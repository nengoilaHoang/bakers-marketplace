import type { Knex } from 'knex';

import db from '#/db/index.js';
import orderDAO, { type NewOrderItem } from '#/daos/orders/orders.dao.js';
import shipmentDAO from '#/daos/orders/shipments.dao.js';
import preOrderDAO from '#/daos/pre-orders/pre-orders.dao.js';
import type { OrderStatus } from '#/models/orders/orders.model.js';
import type { PreOrderStatus } from '#/models/pre-orders/pre-orders.model.js';

// How often requests and cycles are checked
const CHECK_INTERVAL_MS = 10_000;
const BATCH_SIZE = 50;

const NOT_ENOUGH_STOCK = 'Không đủ hàng cho kỳ này';
const PRODUCT_GONE = 'Sản phẩm đã ngừng bán';

/**
 * Moves pre-order requests along over time, each step in its own transaction:
 * 1. Pending requests past their approval deadline: unanswered items EXPIRED; the request is
 *    APPROVED when some items were approved, otherwise EXPIRED (its cycles are cancelled).
 * 2. Approved requests whose start date has come become ACTIVE.
 * 3. Cycles whose time has come get their order, already APPROVED (vendors approved the request).
 *    Each item takes its stock now; an item short of stock is kept in the order as DECLINED.
 *    When no cycle is left to come, the request is COMPLETED.
 */
class PreOrderSchedulerService {
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

	/** One pass; a pass still running makes the next tick skip. Returns what each step changed. */
	public async runOnce(): Promise<{ expired: number; activated: number; ordered: number }> {
		const done = { expired: 0, activated: 0, ordered: 0 };

		if (this.isRunning) return done;
		this.isRunning = true;

		try {
			done.expired = await this.each(await preOrderDAO.getOverdueRequestIds(BATCH_SIZE), (id) =>
				this.expire(id),
			);
			done.activated = await this.each(await preOrderDAO.getStartedRequestIds(BATCH_SIZE), (id) =>
				this.activate(id),
			);
			done.ordered = await this.each(await preOrderDAO.getDueCycleIds(BATCH_SIZE), (id) =>
				this.createCycleOrder(id),
			);
		} catch (error) {
			console.error('Pre-order scheduler pass failed:', error);
		} finally {
			this.isRunning = false;
		}

		return done;
	}

	private async each(ids: string[], step: (id: string) => Promise<boolean>): Promise<number> {
		let changed = 0;

		for (const id of ids) {
			try {
				if (await step(id)) changed += 1;
			} catch (error) {
				console.error(`Pre-order scheduler failed on ${id}:`, error);
			}
		}

		return changed;
	}

	private async expire(requestId: string): Promise<boolean> {
		return db.instance.transaction(async (trx) => {
			const request = await preOrderDAO.lockRequest(requestId, trx);

			// A vendor or the baker may have settled it since it was listed
			if (request?.currentStatus !== 'PENDING' || !request.overdue) return false;

			const expired = await preOrderDAO.expirePendingItems(requestId, trx);

			if (expired.length === 0) return false;

			const { approved } = await preOrderDAO.getItemSummary(requestId, trx);
			const status: PreOrderStatus = approved > 0 ? 'APPROVED' : 'EXPIRED';
			await preOrderDAO.updateStatus(requestId, status, trx);

			if (status === 'EXPIRED') {
				await preOrderDAO.cancelScheduledCycles(requestId, trx);
			}

			const brands = (await preOrderDAO.getBrandNamesOfItems(expired.map((item) => item.id), trx)).join(', ');
			await preOrderDAO.addHistory(
				{
					requestId,
					status,
					actorId: null,
					note: `Hết hạn duyệt: ${brands || 'tiệm'} không phản hồi ${expired.length} món`,
				},
				trx,
			);

			return true;
		});
	}

	private async activate(requestId: string): Promise<boolean> {
		return db.instance.transaction(async (trx) => {
			const request = await preOrderDAO.lockRequest(requestId, trx);

			if (request?.currentStatus !== 'APPROVED') return false;

			await preOrderDAO.updateStatus(requestId, 'ACTIVE', trx);
			await preOrderDAO.addHistory(
				{ requestId, status: 'ACTIVE', actorId: null, note: 'Đến ngày bắt đầu, bắt đầu giao định kỳ' },
				trx,
			);

			return true;
		});
	}

	private async createCycleOrder(cycleId: string): Promise<boolean> {
		return db.instance.transaction(async (trx) => {
			const cycle = await preOrderDAO.lockCycleForOrder(cycleId, trx);

			// Skipped, cancelled or created meanwhile, or the request was closed
			if (
				!cycle ||
				cycle.cycleStatus !== 'SCHEDULED' ||
				!cycle.due ||
				!['APPROVED', 'ACTIVE'].includes(cycle.requestStatus)
			) {
				return false;
			}

			// The baker's account was deleted: nobody to deliver to
			if (!cycle.issuerId) {
				await preOrderDAO.cancelScheduledCycles(cycle.requestId, trx);
				await preOrderDAO.updateStatus(cycle.requestId, 'CANCELLED', trx);
				await preOrderDAO.addHistory(
					{ requestId: cycle.requestId, status: 'CANCELLED', actorId: null, note: 'Tài khoản đặt đã bị xoá' },
					trx,
				);
				return true;
			}

			const requestItems = await preOrderDAO.getApprovedItems(cycle.requestId, trx);
			const productIds = requestItems.flatMap((item) => (item.productId ? [item.productId] : []));
			const products = productIds.length > 0 ? await orderDAO.lockProducts(productIds, trx) : [];
			const stockById = new Map(products.map((product) => [product.id, product.stock]));

			const items: NewOrderItem[] = [];

			for (const item of requestItems) {
				const stock = item.productId ? stockById.get(item.productId) : undefined;
				const line = {
					productId: item.productId,
					productTitle: item.productTitle,
					// The price the vendors approved in the request
					unitPrice: item.unitPrice,
					unitCost: item.unitCost,
					unit: item.unit,
					quantity: item.quantity,
					note: item.note ?? undefined,
				};

				if (stock === undefined || stock === null || stock < item.quantity) {
					// Kept in the order (not charged) so the baker sees what this cycle misses
					items.push({
						...line,
						status: 'DECLINED',
						declineReason: stock === undefined ? PRODUCT_GONE : NOT_ENOUGH_STOCK,
					});
					continue;
				}

				await orderDAO.decrementStock(item.productId!, item.quantity, trx);
				items.push({ ...line, status: 'APPROVED' });
			}

			const delivered = items.filter((item) => item.status === 'APPROVED');
			const subtotal = delivered.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
			const orderStatus: OrderStatus = delivered.length > 0 ? 'APPROVED' : 'DECLINED';
			const cycleCount = await this.countCycles(cycle.requestId, trx);

			const orderId = await orderDAO.create(
				{
					orderedBy: cycle.issuerId,
					shippingAddress: cycle.shippingAddress,
					subtotal,
					totalAmount: subtotal,
					currency: cycle.currency,
					approvalWindowMinutes: null,
					currentStatus: orderStatus,
				},
				items,
				trx,
			);

			const missing = items.length - delivered.length;
			await orderDAO.addHistory(
				{
					orderId,
					status: orderStatus,
					actorId: null,
					note:
						`Tạo tự động từ đặt định kỳ, kỳ ${cycle.cycleNumber}/${cycleCount}` +
						(missing > 0 ? `. ${missing} món không giao được kỳ này` : ''),
				},
				trx,
			);

			if (orderStatus === 'APPROVED') {
				await shipmentDAO.createForOrder(orderId, trx);
			}

			await preOrderDAO.setCycleOrder(cycle.cycleId, orderId, trx);

			// A first cycle reached before the start-date step ran (e.g. approved after the start)
			if (cycle.requestStatus === 'APPROVED') {
				await preOrderDAO.updateStatus(cycle.requestId, 'ACTIVE', trx);
				await preOrderDAO.addHistory(
					{ requestId: cycle.requestId, status: 'ACTIVE', actorId: null, note: 'Bắt đầu giao định kỳ' },
					trx,
				);
			}

			if ((await preOrderDAO.countScheduledCycles(cycle.requestId, trx)) === 0) {
				await preOrderDAO.updateStatus(cycle.requestId, 'COMPLETED', trx);
				await preOrderDAO.addHistory(
					{
						requestId: cycle.requestId,
						status: 'COMPLETED',
						actorId: null,
						note: `Đã tạo đơn cho kỳ cuối (kỳ ${cycle.cycleNumber})`,
					},
					trx,
				);
			}

			return true;
		});
	}

	private async countCycles(requestId: string, trx: Knex.Transaction) {
		const row = await trx('pre_order_cycles').where('preOrderRequestId', requestId).count({ total: '*' }).first();
		return Number(row?.total ?? 0);
	}
}

export default new PreOrderSchedulerService();
