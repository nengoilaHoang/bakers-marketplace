import db from '#/db/index.js';
import orderDAO from '#/daos/orders/orders.dao.js';
import preOrderDAO, { type NewPreOrderItem } from '#/daos/pre-orders/pre-orders.dao.js';
import { BadRequestError, ConflictError, NotFoundError } from '#/utils/http-errors.js';
import type { Paginated } from '#/models/admin/admin.model.js';
import {
	PRE_ORDER_APPROVAL_WINDOW_MINUTES,
	PRE_ORDER_MAX_START_DAYS,
	PRE_ORDER_TIME_ZONE,
	type PreOrderCreate,
	type PreOrderDetail,
	type PreOrderListItem,
	type PreOrderQuery,
	type PreOrderStatus,
} from '#/models/pre-orders/pre-orders.model.js';

// A request can be skipped or cancelled until it is settled for good
const OPEN_STATUSES: PreOrderStatus[] = ['PENDING', 'APPROVED', 'ACTIVE'];

/** Today as YYYY-MM-DD in the platform time zone, `plusDays` days later. */
function localDate(plusDays = 0): string {
	const date = new Date(Date.now() + plusDays * 24 * 60 * 60 * 1000);
	// en-CA formats as YYYY-MM-DD
	return new Intl.DateTimeFormat('en-CA', { timeZone: PRE_ORDER_TIME_ZONE }).format(date);
}

/**
 * The baker's side of pre-orders: request a recurring order, follow it, skip a cycle,
 * cancel the whole request. Vendors approve it once (vendor-pre-orders.service), then the
 * scheduler creates an already approved order on every cycle.
 */
class PreOrderService {
	private preOrderDAO = preOrderDAO;

	/**
	 * Saves the request with its items (price, title and unit locked for every cycle) and
	 * plans its cycles. No stock is taken now: each cycle takes its own when its order is created.
	 */
	public async create(userId: string, payload: PreOrderCreate): Promise<PreOrderDetail> {
		if (payload.startDate < localDate() || payload.startDate > localDate(PRE_ORDER_MAX_START_DAYS)) {
			throw new BadRequestError(
				`The start date must be between today and ${PRE_ORDER_MAX_START_DAYS} days from now`,
				'INVALID_START_DATE',
			);
		}

		const requestId = await db.instance.transaction(async (trx) => {
			const products = await orderDAO.lockProducts(
				payload.items.map((item) => item.productId),
				trx,
			);
			const productById = new Map(products.map((product) => [product.id, product]));

			const items: NewPreOrderItem[] = payload.items.map((item) => {
				const product = productById.get(item.productId);

				// A product without a stock row has never been stocked, so it cannot be sold
				if (!product || product.stock === null) {
					throw new NotFoundError(`Product ${item.productId} not found`, 'PRODUCT_NOT_FOUND');
				}

				return {
					productId: product.id,
					productTitle: product.title,
					unitPrice: product.unitPrice,
					unitCost: product.unitCost,
					unit: product.unit,
					quantity: item.quantity,
					note: item.note,
				};
			});

			const currencies = new Set(products.map((product) => product.currency));

			if (currencies.size > 1) {
				throw new BadRequestError('All products of a request must share one currency', 'MIXED_CURRENCY');
			}

			const id = await this.preOrderDAO.create(
				{
					issuerId: userId,
					shippingAddress: payload.shippingAddress,
					frequency: payload.frequency,
					durationMonths: payload.durationMonths,
					startDate: payload.startDate,
					currency: [...currencies][0],
					approvalWindowMinutes: PRE_ORDER_APPROVAL_WINDOW_MINUTES,
				},
				items,
				trx,
			);

			await this.preOrderDAO.addHistory({ requestId: id, status: 'PENDING', actorId: userId }, trx);

			return id;
		});

		return this.getOwnDetail(userId, requestId);
	}

	public async getMine(userId: string, query: PreOrderQuery): Promise<Paginated<PreOrderListItem>> {
		return this.preOrderDAO.getPageByIssuer(userId, query);
	}

	/** Someone else's request answers 404, so ids cannot be probed. */
	public async getOwnDetail(userId: string, id: string): Promise<PreOrderDetail> {
		await this.assertOwner(userId, id);

		const request = await this.preOrderDAO.getDetail(id);

		if (!request) {
			throw new NotFoundError('Pre-order not found');
		}

		return request;
	}

	/** Cancels the whole request: every cycle not reached yet is cancelled; orders already created stay. */
	public async cancel(userId: string, id: string, reason?: string): Promise<PreOrderDetail> {
		await this.assertOwner(userId, id);

		await db.instance.transaction(async (trx) => {
			const request = await this.preOrderDAO.lockRequest(id, trx);

			if (!request || !OPEN_STATUSES.includes(request.currentStatus)) {
				throw new ConflictError('This pre-order can no longer be cancelled', 'PRE_ORDER_CLOSED');
			}

			await this.preOrderDAO.updateStatus(id, 'CANCELLED', trx);
			const cancelled = await this.preOrderDAO.cancelScheduledCycles(id, trx);
			await this.preOrderDAO.addHistory(
				{
					requestId: id,
					status: 'CANCELLED',
					actorId: userId,
					note: [reason, `Huỷ ${cancelled} kỳ chưa tới`].filter(Boolean).join(' · '),
				},
				trx,
			);
		});

		return this.getOwnDetail(userId, id);
	}

	/**
	 * Skips one cycle: allowed while it is still scheduled, before its order is created.
	 * The last cycle left cannot be skipped: cancel the request instead.
	 */
	public async skipCycle(userId: string, id: string, cycleId: string): Promise<PreOrderDetail> {
		await this.assertOwner(userId, id);

		await db.instance.transaction(async (trx) => {
			const request = await this.preOrderDAO.lockRequest(id, trx);

			if (!request || !OPEN_STATUSES.includes(request.currentStatus)) {
				throw new ConflictError('This pre-order is closed', 'PRE_ORDER_CLOSED');
			}

			const cycle = await this.preOrderDAO.lockCycle(id, cycleId, trx);

			if (!cycle) {
				throw new NotFoundError('Cycle not found');
			}

			// Its time has come: the scheduler creates (or created) its order
			if (cycle.currentStatus !== 'SCHEDULED' || cycle.started) {
				throw new ConflictError('Only a cycle that has not started can be skipped', 'CYCLE_NOT_SCHEDULED');
			}

			if ((await this.preOrderDAO.countScheduledCycles(id, trx)) <= 1) {
				throw new ConflictError('The last cycle left cannot be skipped', 'LAST_CYCLE');
			}

			await this.preOrderDAO.skipCycle(cycleId, trx);
			await this.preOrderDAO.addHistory(
				{
					requestId: id,
					status: request.currentStatus,
					actorId: userId,
					note: `Bỏ qua kỳ ${cycle.cycleNumber}`,
				},
				trx,
			);
		});

		return this.getOwnDetail(userId, id);
	}

	private async assertOwner(userId: string, id: string) {
		const request = await this.preOrderDAO.getOwner(id);

		if (!request || request.issuerId !== userId) {
			throw new NotFoundError('Pre-order not found');
		}

		return request;
	}
}

export default new PreOrderService();
