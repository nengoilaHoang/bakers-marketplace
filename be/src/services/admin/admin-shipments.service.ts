import db from '#/db/index.js';
import orderDAO from '#/daos/orders/orders.dao.js';
import shipmentDAO, { SHIPMENT_STEPS } from '#/daos/orders/shipments.dao.js';
import { ConflictError, NotFoundError } from '#/utils/http-errors.js';
import type { Paginated } from '#/models/admin/admin.model.js';
import type { AdminShipmentQuery, AdminShipmentRow } from '#/models/orders/orders.model.js';

/**
 * The system creates a shipment when an order is approved; an admin moves it one step at a
 * time. The last step (DELIVERED) completes the order, which lets the buyer rate it.
 */
class AdminShipmentService {
	private shipmentDAO = shipmentDAO;

	public async getPage(query: AdminShipmentQuery): Promise<Paginated<AdminShipmentRow>> {
		return this.shipmentDAO.getPage(query);
	}

	public async advance(adminId: string, shipmentId: string): Promise<void> {
		await db.instance.transaction(async (trx) => {
			const shipment = await this.shipmentDAO.lock(shipmentId, trx);

			if (!shipment) {
				throw new NotFoundError('Shipment not found');
			}

			const index = SHIPMENT_STEPS.findIndex((step) => step.status === shipment.currentStatus);
			const next = SHIPMENT_STEPS[index + 1];

			if (!next) {
				throw new ConflictError('Shipment has already been delivered', 'ALREADY_DELIVERED');
			}

			await this.shipmentDAO.moveTo(shipmentId, next, trx);

			if (next.status === 'DELIVERED') {
				if (!(await orderDAO.updateStatus(shipment.orderId, 'APPROVED', 'COMPLETED', trx))) {
					throw new ConflictError('Only an approved order can be delivered', 'ORDER_NOT_APPROVED');
				}

				await orderDAO.addHistory(
					{
						orderId: shipment.orderId,
						status: 'COMPLETED',
						actorId: adminId,
						note: 'Đã giao hàng thành công',
					},
					trx,
				);
			}
		});
	}
}

export default new AdminShipmentService();
