import db from '#/db/index.js';
import orderDAO from '#/daos/orders/orders.dao.js';
import shipmentDAO, { SHIPMENT_STEPS } from '#/daos/orders/shipments.dao.js';
import { ConflictError, NotFoundError } from '#/utils/http-errors.js';
import type { Paginated } from '#/models/admin/admin.model.js';
import type {
	AdminShipmentDetail,
	AdminShipmentQuery,
	AdminShipmentRow,
	ShipmentAdvance,
	ShipmentStatus,
	ShippingAddress,
} from '#/models/orders/orders.model.js';

function nextStepOf(status: ShipmentStatus) {
	const index = SHIPMENT_STEPS.findIndex((step) => step.status === status);
	return SHIPMENT_STEPS[index + 1] ?? null;
}

/**
 * The system creates a shipment when an order is approved; an admin moves it one step at a
 * time, entering where the parcel is and what happened. The last step (DELIVERED) completes
 * the order, which lets the buyer rate it.
 */
class AdminShipmentService {
	private shipmentDAO = shipmentDAO;

	public async getPage(query: AdminShipmentQuery): Promise<Paginated<AdminShipmentRow>> {
		return this.shipmentDAO.getPage(query);
	}

	public async getDetail(shipmentId: string): Promise<AdminShipmentDetail> {
		const ref = await this.shipmentDAO.getOrderRef(shipmentId);
		const order = ref ? await orderDAO.getDetail(ref.orderId) : null;

		if (!ref || !order?.shipment) {
			throw new NotFoundError('Shipment not found');
		}

		const next = nextStepOf(order.shipment.currentStatus);

		return {
			...order,
			shipment: order.shipment,
			customer: ref.orderedBy
				? { id: ref.orderedBy, displayName: ref.customerDisplayName ?? '' }
				: null,
			nextStep: next && {
				...next,
				// The last step happens at the buyer's address
				locationName:
					next.status === 'DELIVERED' ? this.formatArea(order.shippingAddress) : next.locationName,
			},
		};
	}

	/** `input.status` must be the next step: a stale page or a double submit gets 409. */
	public async advance(
		adminId: string,
		shipmentId: string,
		input: ShipmentAdvance,
	): Promise<AdminShipmentDetail> {
		await db.instance.transaction(async (trx) => {
			const shipment = await this.shipmentDAO.lock(shipmentId, trx);

			if (!shipment) {
				throw new NotFoundError('Shipment not found');
			}

			const next = nextStepOf(shipment.currentStatus);

			if (!next) {
				throw new ConflictError('Shipment has already been delivered', 'ALREADY_DELIVERED');
			}

			if (next.status !== input.status) {
				throw new ConflictError('The shipment has moved to another step since', 'STEP_CHANGED');
			}

			await this.shipmentDAO.moveTo(shipmentId, input, trx);

			if (next.status === 'DELIVERED') {
				if (!(await orderDAO.updateStatus(shipment.orderId, 'APPROVED', 'COMPLETED', trx))) {
					throw new ConflictError('Only an approved order can be delivered', 'ORDER_NOT_APPROVED');
				}

				await orderDAO.addHistory(
					{
						orderId: shipment.orderId,
						status: 'COMPLETED',
						actorId: adminId,
						note: input.description,
					},
					trx,
				);
			}
		});

		return this.getDetail(shipmentId);
	}

	private formatArea(address: ShippingAddress): string {
		return `${address.ward}, ${address.province}`;
	}
}

export default new AdminShipmentService();
