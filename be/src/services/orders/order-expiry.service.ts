import db from '#/db/index.js';
import orderDAO from '#/daos/orders/orders.dao.js';
import vendorOrderDAO from '#/daos/orders/vendor-orders.dao.js';
import shipmentDAO from '#/daos/orders/shipments.dao.js';
import type { OrderStatus } from '#/models/orders/orders.model.js';

// How often pending orders are checked against their approval deadline
const CHECK_INTERVAL_MS = 10_000;
const BATCH_SIZE = 50;

/**
 * Settles pending orders whose approval deadline has passed. Items still waiting on a
 * vendor become EXPIRED (stock back, dropped from the total). The order is then APPROVED
 * and shipped when some items were approved, otherwise EXPIRED.
 */
class OrderExpiryService {
	private timer: NodeJS.Timeout | null = null;
	private isRunning = false;

	public start(): void {
		if (this.timer) return;

		this.timer = setInterval(() => void this.runOnce(), CHECK_INTERVAL_MS);
		void this.runOnce();
	}

	public stop(): void {
		if (this.timer) clearInterval(this.timer);
		this.timer = null;
	}

	/** One pass; a pass still running makes the next tick skip. */
	public async runOnce(): Promise<number> {
		if (this.isRunning) return 0;
		this.isRunning = true;

		let settled = 0;

		try {
			const orderIds = await vendorOrderDAO.getOverdueOrderIds(BATCH_SIZE);

			for (const orderId of orderIds) {
				try {
					if (await this.expire(orderId)) settled += 1;
				} catch (error) {
					console.error(`Failed to expire order ${orderId}:`, error);
				}
			}
		} catch (error) {
			console.error('Order expiry check failed:', error);
		} finally {
			this.isRunning = false;
		}

		return settled;
	}

	private async expire(orderId: string): Promise<boolean> {
		return db.instance.transaction(async (trx) => {
			const order = await vendorOrderDAO.lockOrder(orderId, trx);

			// A vendor or the buyer may have settled it since it was listed
			if (order?.currentStatus !== 'PENDING' || !order.overdue) {
				return false;
			}

			const expired = await vendorOrderDAO.expirePendingItems(orderId, trx);

			if (expired.length === 0) {
				return false;
			}

			await vendorOrderDAO.restoreItemStock(expired, trx);

			const { approved, subtotal } = await vendorOrderDAO.getItemSummary(orderId, trx);
			const status: OrderStatus = approved > 0 ? 'APPROVED' : 'EXPIRED';
			await vendorOrderDAO.updateTotals(orderId, subtotal, status, trx);

			const brands = (await vendorOrderDAO.getBrandNamesOfItems(expired.map((item) => item.id), trx)).join(', ');
			await orderDAO.addHistory(
				{
					orderId,
					status,
					actorId: null,
					note: `Hết hạn duyệt: ${brands || 'tiệm'} không phản hồi ${expired.length} món`,
				},
				trx,
			);

			if (status === 'APPROVED') {
				await shipmentDAO.createForOrder(orderId, trx);
			}

			return true;
		});
	}
}

export default new OrderExpiryService();
