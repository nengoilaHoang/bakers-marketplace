import db from '#/db/index.js';
import preOrderDAO from '#/daos/pre-orders/pre-orders.dao.js';
import { ConflictError, NotFoundError } from '#/utils/http-errors.js';
import type { Paginated } from '#/models/admin/admin.model.js';
import type {
	PreOrderStatus,
	VendorPreOrderDetail,
	VendorPreOrderListItem,
	VendorPreOrderQuery,
} from '#/models/pre-orders/pre-orders.model.js';

/**
 * A vendor answers once for its own items of a pre-order request, like a normal order.
 * The request stays PENDING until every vendor answered; then it is APPROVED, or DECLINED
 * when no item is left. Vendors that do not answer before the deadline are expired by the scheduler.
 */
class VendorPreOrderService {
	private preOrderDAO = preOrderDAO;

	public async getPage(vendorId: string, query: VendorPreOrderQuery): Promise<Paginated<VendorPreOrderListItem>> {
		return this.preOrderDAO.getVendorPage(vendorId, query);
	}

	public async getDetail(vendorId: string, id: string): Promise<VendorPreOrderDetail> {
		const request = await this.preOrderDAO.getVendorDetail(vendorId, id);

		if (!request) {
			throw new NotFoundError('Pre-order not found');
		}

		return request;
	}

	public async approve(vendorId: string, id: string): Promise<VendorPreOrderDetail> {
		await this.decide(vendorId, id, null);

		return this.getDetail(vendorId, id);
	}

	public async decline(vendorId: string, id: string, reason: string): Promise<VendorPreOrderDetail> {
		await this.decide(vendorId, id, reason);

		return this.getDetail(vendorId, id);
	}

	/** declineReason null approves, a reason declines. No stock moves: cycles take theirs later. */
	private async decide(vendorId: string, id: string, declineReason: string | null) {
		await this.getDetail(vendorId, id);

		await db.instance.transaction(async (trx) => {
			const request = await this.preOrderDAO.lockRequest(id, trx);

			if (request?.currentStatus !== 'PENDING') {
				throw new ConflictError('Only a pending pre-order can be answered', 'PRE_ORDER_NOT_PENDING');
			}

			if (request.overdue) {
				throw new ConflictError('The approval deadline of this pre-order has passed', 'APPROVAL_EXPIRED');
			}

			const decided = await this.preOrderDAO.decidePendingItems(
				vendorId,
				id,
				declineReason === null ? 'APPROVED' : 'DECLINED',
				declineReason,
				trx,
			);

			if (decided.length === 0) {
				throw new ConflictError('Your items in this pre-order were already answered', 'ALREADY_ANSWERED');
			}

			const { pending, approved } = await this.preOrderDAO.getItemSummary(id, trx);
			// The last vendor to answer settles the request
			const status: PreOrderStatus = pending > 0 ? 'PENDING' : approved > 0 ? 'APPROVED' : 'DECLINED';

			if (status !== 'PENDING') {
				await this.preOrderDAO.updateStatus(id, status, trx);
			}

			if (status === 'DECLINED') {
				await this.preOrderDAO.cancelScheduledCycles(id, trx);
			}

			const brands = (await this.preOrderDAO.getBrandNames(vendorId, id, trx)).join(', ');
			await this.preOrderDAO.addHistory(
				{
					requestId: id,
					status,
					actorId: vendorId,
					note:
						declineReason === null
							? `${brands} đã duyệt ${decided.length} món`
							: `${brands} từ chối ${decided.length} món: ${declineReason}`,
				},
				trx,
			);
		});
	}
}

export default new VendorPreOrderService();
