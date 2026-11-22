import db from '#/db/index.js';
import orderDAO from '#/daos/orders/orders.dao.js';
import vendorOrderDAO from '#/daos/orders/vendor-orders.dao.js';
import shipmentDAO from '#/daos/orders/shipments.dao.js';
import { ConflictError, NotFoundError } from '#/utils/http-errors.js';
import type { Paginated } from '#/models/admin/admin.model.js';
import type {
	OrderStatus,
	VendorOrderDetail,
	VendorOrderListItem,
	VendorOrderQuery,
} from '#/models/orders/orders.model.js';

/**
 * A vendor answers for its own items of an order. The order stays PENDING until every
 * vendor in it has answered; then it becomes APPROVED, or DECLINED when no item is left.
 */
class VendorOrderService {
	private vendorOrderDAO = vendorOrderDAO;

	public async getPage(
		vendorId: string,
		query: VendorOrderQuery,
	): Promise<Paginated<VendorOrderListItem>> {
		return this.vendorOrderDAO.getPage(vendorId, query);
	}

	public async getDetail(vendorId: string, orderId: string): Promise<VendorOrderDetail> {
		const order = await this.vendorOrderDAO.getDetail(vendorId, orderId);

		if (!order) {
			throw new NotFoundError('Order not found');
		}

		return order;
	}

	public async approve(vendorId: string, orderId: string): Promise<VendorOrderDetail> {
		await this.decide(vendorId, orderId, null);

		return this.getDetail(vendorId, orderId);
	}

	/** Drops this vendor's items from the order: they stay listed as declined, their stock goes back. */
	public async decline(
		vendorId: string,
		orderId: string,
		reason: string,
	): Promise<VendorOrderDetail> {
		await this.decide(vendorId, orderId, reason);

		return this.getDetail(vendorId, orderId);
	}

	/** declineReason null approves, a reason declines. */
	private async decide(vendorId: string, orderId: string, declineReason: string | null) {
		await this.getDetail(vendorId, orderId);

		await db.instance.transaction(async (trx) => {
			const order = await this.vendorOrderDAO.lockOrder(orderId, trx);

			if (order?.currentStatus !== 'PENDING') {
				throw new ConflictError('Only a pending order can be answered', 'ORDER_NOT_PENDING');
			}

			const decided = await this.vendorOrderDAO.decidePendingItems(
				vendorId,
				orderId,
				declineReason === null ? 'APPROVED' : 'DECLINED',
				declineReason,
				trx,
			);

			if (decided.length === 0) {
				throw new ConflictError('Your items in this order were already answered', 'ALREADY_ANSWERED');
			}

			if (declineReason !== null) {
				await this.vendorOrderDAO.restoreItemStock(decided, trx);
			}

			const { pending, approved, subtotal } = await this.vendorOrderDAO.getItemSummary(orderId, trx);
			// The last vendor to answer settles the order
			const status: OrderStatus = pending > 0 ? 'PENDING' : approved > 0 ? 'APPROVED' : 'DECLINED';
			await this.vendorOrderDAO.updateTotals(orderId, subtotal, status, trx);

			const brands = (await this.vendorOrderDAO.getBrandNames(vendorId, orderId, trx)).join(', ');
			await orderDAO.addHistory(
				{
					orderId,
					status,
					actorId: vendorId,
					note:
						declineReason === null
							? `${brands} đã duyệt ${decided.length} món`
							: `${brands} từ chối ${decided.length} món: ${declineReason}`,
				},
				trx,
			);

			// Settled with items left to deliver: the platform ships them in one shipment
			if (status === 'APPROVED') {
				await shipmentDAO.createForOrder(orderId, trx);
			}
		});
	}
}

export default new VendorOrderService();
