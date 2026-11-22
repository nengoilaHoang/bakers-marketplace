import db from '#/db/index.js';
import type { Knex } from 'knex';
import type { Paginated } from '#/models/admin/admin.model.js';
import type {
	OrderItemStatus,
	OrderItemView,
	OrderStatus,
	ShippingAddress,
} from '#/models/orders/orders.model.js';
import {
	PRE_ORDER_TIME_ZONE,
	type PreOrderCycleView,
	type PreOrderDetail,
	type PreOrderListItem,
	type PreOrderQuery,
	type PreOrderStatus,
	type PreOrderStatusHistoryView,
	type PreOrderSummary,
	type RecurrenceFrequency,
	type VendorPreOrderDetail,
	type VendorPreOrderListItem,
	type VendorPreOrderQuery,
} from '#/models/pre-orders/pre-orders.model.js';
import { paginate } from '#/utils/pagination.js';

type Money = string | number;

type RequestRow = Omit<PreOrderSummary, 'cycleSubtotal'> & {
	issuerId: string | null;
	cycleSubtotal: Money;
	shippingRecipientName: string;
	shippingPhone: string;
	shippingStreetAddress: string;
	shippingWard: string;
	shippingProvince: string;
	shippingNote: string | null;
};

type VendorRequestRow = RequestRow & {
	customerDisplayName: string | null;
	myItemCount: number;
	myPendingCount: number;
	myApprovedCount: number;
	myExpiredCount: number;
	mySubtotal: Money;
};

type ItemRow = Omit<OrderItemView, 'unitPrice' | 'rating'> & { preOrderRequestId: string; unitPrice: Money };

export type NewPreOrder = {
	issuerId: string;
	shippingAddress: ShippingAddress;
	frequency: RecurrenceFrequency;
	durationMonths: number;
	startDate: string;
	currency: string;
	approvalWindowMinutes: number;
};

export type NewPreOrderItem = {
	productId: string;
	productTitle: string;
	unitPrice: Money;
	unitCost: Money;
	unit: string;
	quantity: number;
	note?: string;
};

/** A request locked together with the cycle being turned into an order. */
export type CycleForOrder = {
	cycleId: string;
	cycleNumber: number;
	cycleStatus: string;
	due: boolean;
	requestId: string;
	requestStatus: PreOrderStatus;
	issuerId: string | null;
	currency: string;
	shippingAddress: ShippingAddress;
};

export type CycleItem = {
	id: string;
	productId: string | null;
	productTitle: string;
	unitPrice: Money;
	unitCost: Money;
	unit: string;
	quantity: number;
	note: string | null;
};

// First image of the product a request item points at
const ITEM_IMAGE_SQL = `(
	SELECT f.url FROM product_images pi JOIN files f ON f.id = pi.image_id
	WHERE pi.product_id = i.product_id ORDER BY pi.sort_order LIMIT 1
) AS image_url`;

/** The request's items that belong to a vendor (through their product). */
const MY_ITEMS_SQL = `FROM pre_order_items i JOIN products p ON p.id = i.product_id
	WHERE i.pre_order_request_id = r.id AND p.vendor_id = ?`;

const TODAY_SQL = `(now() AT TIME ZONE '${PRE_ORDER_TIME_ZONE}')::date`;

/**
 * Pre-order requests (recurring orders of a baker), their items, cycles and history.
 * Shared by the baker side, the vendor side and the scheduler.
 */
class PreOrderDAO {
	private readonly tableName = 'pre_order_requests';
	private db = db;

	// ---------- writing ----------

	public async create(request: NewPreOrder, items: NewPreOrderItem[], trx: Knex.Transaction): Promise<string> {
		const { shippingAddress: address, approvalWindowMinutes, startDate, durationMonths, ...rest } = request;

		const [created] = await trx(this.tableName)
			.insert({
				...rest,
				durationMonths,
				startDate,
				// The day before the same date `durationMonths` later
				endDate: trx.raw(`(?::date + make_interval(months => ?) - interval '1 day')::date`, [
					startDate,
					durationMonths,
				]),
				approvalDeadline: trx.raw('now() + make_interval(mins => ?)', [approvalWindowMinutes]),
				shippingRecipientName: address.recipientName,
				shippingPhone: address.phone,
				shippingStreetAddress: address.streetAddress,
				shippingWard: address.ward,
				shippingProvince: address.province,
				shippingNote: address.note ?? null,
			})
			.returning('id');

		await trx('pre_order_items').insert(
			items.map((item) => ({ ...item, note: item.note ?? null, preOrderRequestId: created.id })),
		);

		// MONTHLY: the start day of every month. BIWEEKLY: that day and 14 days later.
		// Postgres keeps month ends valid (31/01 + 1 month = 28/02).
		const offsets: { months: number; days: number }[] = [];
		for (let month = 0; month < durationMonths; month += 1) {
			offsets.push({ months: month, days: 0 });
			if (request.frequency === 'BIWEEKLY') offsets.push({ months: month, days: 14 });
		}

		await trx('pre_order_cycles').insert(
			offsets.map((offset, index) => ({
				preOrderRequestId: created.id,
				cycleNumber: index + 1,
				scheduledAt: trx.raw(
					`(?::date + make_interval(months => ?, days => ?))::timestamp AT TIME ZONE '${PRE_ORDER_TIME_ZONE}'`,
					[startDate, offset.months, offset.days],
				),
			})),
		);

		return created.id;
	}

	public async addHistory(
		entry: { requestId: string; status: PreOrderStatus; actorId: string | null; note?: string },
		trx: Knex.Transaction,
	): Promise<void> {
		const { requestId, ...rest } = entry;
		await trx('pre_order_status_histories').insert({
			...rest,
			preOrderRequestId: requestId,
			note: entry.note ?? null,
		});
	}

	/**
	 * Locks the request row so vendors' answers, the baker's actions and the scheduler are
	 * applied one at a time. `overdue`: the approval deadline has passed.
	 */
	public async lockRequest(
		id: string,
		trx: Knex.Transaction,
	): Promise<{ issuerId: string | null; currentStatus: PreOrderStatus; overdue: boolean } | null> {
		const row = await trx(this.tableName)
			.select('issuerId', 'currentStatus', trx.raw('coalesce(approval_deadline <= now(), false) AS overdue'))
			.where('id', id)
			.forUpdate()
			.first();

		return row ?? null;
	}

	public async updateStatus(id: string, status: PreOrderStatus, trx: Knex.Transaction): Promise<void> {
		await trx(this.tableName).where('id', id).update({ currentStatus: status, updatedAt: trx.fn.now() });
	}

	/** Cycles not reached yet are dropped with the request. */
	public async cancelScheduledCycles(requestId: string, trx: Knex.Transaction): Promise<number> {
		return trx('pre_order_cycles')
			.where({ preOrderRequestId: requestId, currentStatus: 'SCHEDULED' })
			.update({ currentStatus: 'CANCELLED' });
	}

	/** `started`: its time has come, so the scheduler may be creating its order. */
	public async lockCycle(
		requestId: string,
		cycleId: string,
		trx: Knex.Transaction,
	): Promise<{ cycleNumber: number; currentStatus: string; scheduledAt: Date; started: boolean } | null> {
		const row = await trx('pre_order_cycles')
			.select('cycleNumber', 'currentStatus', 'scheduledAt', trx.raw('scheduled_at <= now() AS started'))
			.where({ id: cycleId, preOrderRequestId: requestId })
			.forUpdate()
			.first();

		return row ?? null;
	}

	public async countScheduledCycles(requestId: string, trx: Knex.Transaction): Promise<number> {
		const row = await trx('pre_order_cycles')
			.where({ preOrderRequestId: requestId, currentStatus: 'SCHEDULED' })
			.count({ total: '*' })
			.first();

		return Number(row?.total ?? 0);
	}

	public async skipCycle(cycleId: string, trx: Knex.Transaction): Promise<void> {
		await trx('pre_order_cycles').where('id', cycleId).update({ currentStatus: 'SKIPPED' });
	}

	/** Moves this vendor's still-pending items to APPROVED / DECLINED; returns their ids. */
	public async decidePendingItems(
		vendorId: string,
		requestId: string,
		status: Exclude<OrderItemStatus, 'PENDING'>,
		declineReason: string | null,
		trx: Knex.Transaction,
	): Promise<{ id: string }[]> {
		const result = await trx.raw(
			`UPDATE pre_order_items i SET status = ?, decline_reason = ?
			FROM products p
			WHERE p.id = i.product_id AND p.vendor_id = ? AND i.pre_order_request_id = ? AND i.status = 'PENDING'
			RETURNING i.id`,
			[status, declineReason, vendorId, requestId],
		);

		return result.rows as { id: string }[];
	}

	public async expirePendingItems(requestId: string, trx: Knex.Transaction): Promise<{ id: string }[]> {
		const result = await trx.raw(
			`UPDATE pre_order_items SET status = 'EXPIRED'
			WHERE pre_order_request_id = ? AND status = 'PENDING'
			RETURNING id`,
			[requestId],
		);

		return result.rows as { id: string }[];
	}

	public async getItemSummary(
		requestId: string,
		trx: Knex.Transaction,
	): Promise<{ pending: number; approved: number }> {
		const row = await trx('pre_order_items')
			.where('preOrderRequestId', requestId)
			.select(
				trx.raw(`count(*) FILTER (WHERE status = 'PENDING')::int AS pending`),
				trx.raw(`count(*) FILTER (WHERE status = 'APPROVED')::int AS approved`),
			)
			.first();

		return { pending: row.pending, approved: row.approved };
	}

	/** Names of this vendor's brands among the request's items, for the history note. */
	public async getBrandNames(vendorId: string, requestId: string, trx: Knex.Transaction): Promise<string[]> {
		const rows: { name: string }[] = await trx('pre_order_items as i')
			.distinct('b.name')
			.join('products as p', 'p.id', 'i.productId')
			.join('brands as b', 'b.id', 'p.brandId')
			.where({ 'i.preOrderRequestId': requestId, 'p.vendorId': vendorId });

		return rows.map((row) => row.name);
	}

	public async getBrandNamesOfItems(itemIds: string[], trx: Knex.Transaction): Promise<string[]> {
		const rows: { name: string }[] = await trx('pre_order_items as i')
			.distinct('b.name')
			.join('products as p', 'p.id', 'i.productId')
			.join('brands as b', 'b.id', 'p.brandId')
			.whereIn('i.id', itemIds);

		return rows.map((row) => row.name);
	}

	// ---------- scheduler ----------

	/** Pending requests whose approval deadline has passed, oldest first. */
	public async getOverdueRequestIds(limit: number): Promise<string[]> {
		const rows: { id: string }[] = await this.db.instance(this.tableName)
			.select('id')
			.where('currentStatus', 'PENDING')
			.whereRaw('approval_deadline <= now()')
			.orderBy('approvalDeadline')
			.limit(limit);

		return rows.map((row) => row.id);
	}

	/** Approved requests whose start date has come. */
	public async getStartedRequestIds(limit: number): Promise<string[]> {
		const rows: { id: string }[] = await this.db.instance(this.tableName)
			.select('id')
			.where('currentStatus', 'APPROVED')
			.whereRaw(`start_date <= ${TODAY_SQL}`)
			.orderBy('startDate')
			.limit(limit);

		return rows.map((row) => row.id);
	}

	/** Cycles whose time has come, of requests that are approved or running. */
	public async getDueCycleIds(limit: number): Promise<string[]> {
		const rows: { id: string }[] = await this.db.instance('pre_order_cycles as c')
			.select('c.id')
			.join(`${this.tableName} as r`, 'r.id', 'c.preOrderRequestId')
			.where('c.currentStatus', 'SCHEDULED')
			.whereRaw('c.scheduled_at <= now()')
			.whereIn('r.currentStatus', ['APPROVED', 'ACTIVE'])
			.orderBy('c.scheduledAt')
			.limit(limit);

		return rows.map((row) => row.id);
	}

	/** Locks the cycle and its request (both rows) before creating the cycle's order. */
	public async lockCycleForOrder(cycleId: string, trx: Knex.Transaction): Promise<CycleForOrder | null> {
		const row = await trx('pre_order_cycles as c')
			.select(
				'c.id as cycleId',
				'c.cycleNumber',
				'c.currentStatus as cycleStatus',
				trx.raw('c.scheduled_at <= now() AS due'),
				'r.id as requestId',
				'r.currentStatus as requestStatus',
				'r.issuerId',
				'r.currency',
				'r.shippingRecipientName',
				'r.shippingPhone',
				'r.shippingStreetAddress',
				'r.shippingWard',
				'r.shippingProvince',
				'r.shippingNote',
			)
			.join(`${this.tableName} as r`, 'r.id', 'c.preOrderRequestId')
			.where('c.id', cycleId)
			.forUpdate()
			.first();

		if (!row) return null;

		return {
			cycleId: row.cycleId,
			cycleNumber: row.cycleNumber,
			cycleStatus: row.cycleStatus,
			due: row.due,
			requestId: row.requestId,
			requestStatus: row.requestStatus,
			issuerId: row.issuerId,
			currency: row.currency,
			shippingAddress: this.toAddress(row),
		};
	}

	/** Items the vendors approved: the ones every cycle delivers. */
	public async getApprovedItems(requestId: string, trx: Knex.Transaction): Promise<CycleItem[]> {
		return trx('pre_order_items')
			.select('id', 'productId', 'productTitle', 'unitPrice', 'unitCost', 'unit', 'quantity', 'note')
			.where({ preOrderRequestId: requestId, status: 'APPROVED' })
			.orderBy('productTitle');
	}

	public async setCycleOrder(cycleId: string, orderId: string, trx: Knex.Transaction): Promise<void> {
		await trx('pre_order_cycles')
			.where('id', cycleId)
			.update({ currentStatus: 'ORDER_CREATED', generatedOrderId: orderId });
	}

	// ---------- reading (baker) ----------

	public async getOwner(id: string): Promise<{ issuerId: string | null } | null> {
		const row = await this.db.instance(this.tableName).select('issuerId').where('id', id).first();

		return row ?? null;
	}

	public async getPageByIssuer(issuerId: string, query: PreOrderQuery): Promise<Paginated<PreOrderListItem>> {
		const filtered = this.db.instance(`${this.tableName} as r`).where('r.issuerId', issuerId);

		if (query.status) {
			filtered.where('r.currentStatus', query.status);
		}

		const page = await paginate<RequestRow, PreOrderSummary>(
			filtered,
			(rows) => this.withSummaryColumns(rows).orderBy('r.requestedAt', 'desc').orderBy('r.id', 'desc'),
			query,
			(row) => this.toSummary(row),
		);

		const items = await this.getItems(page.data.map((request) => request.id));

		return {
			...page,
			data: page.data.map((request) => ({
				...request,
				items: (items.get(request.id) ?? []).map(({ id, productTitle, imageUrl, quantity }) => ({
					id,
					productTitle,
					imageUrl,
					quantity,
				})),
			})),
		};
	}

	public async getDetail(id: string): Promise<PreOrderDetail | null> {
		const row: RequestRow | undefined = await this.withSummaryColumns(this.db.instance(`${this.tableName} as r`))
			.where('r.id', id)
			.first();

		if (!row) return null;

		const [items, cycles, statusHistory] = await Promise.all([
			this.getItems([id]),
			this.getCycles(id),
			this.getHistory(id),
		]);

		return {
			...this.toSummary(row),
			shippingAddress: this.toAddress(row),
			items: items.get(id) ?? [],
			cycles,
			statusHistory,
		};
	}

	// ---------- reading (vendor) ----------

	public async getVendorPage(
		vendorId: string,
		query: VendorPreOrderQuery,
	): Promise<Paginated<VendorPreOrderListItem>> {
		const filtered = this.db.instance(`${this.tableName} as r`).whereRaw(`EXISTS (SELECT 1 ${MY_ITEMS_SQL})`, [
			vendorId,
		]);

		if (query.status) {
			filtered.where('r.currentStatus', query.status);
		}

		if (query.awaiting) {
			filtered
				.where('r.currentStatus', 'PENDING')
				.whereRaw(`EXISTS (SELECT 1 ${MY_ITEMS_SQL} AND i.status = 'PENDING')`, [vendorId]);
		}

		return paginate<VendorRequestRow, VendorPreOrderListItem>(
			filtered,
			(rows) =>
				this.withVendorColumns(rows, vendorId).orderBy('r.requestedAt', 'desc').orderBy('r.id', 'desc'),
			query,
			(row) => this.toVendorListItem(row),
		);
	}

	public async getVendorDetail(vendorId: string, id: string): Promise<VendorPreOrderDetail | null> {
		const row: VendorRequestRow | undefined = await this.withVendorColumns(
			this.db.instance(`${this.tableName} as r`),
			vendorId,
		)
			.where('r.id', id)
			.first();

		// A request without this vendor's products does not exist for this vendor
		if (!row || row.myItemCount === 0) return null;

		const [items, cycles, statusHistory, otherRow] = await Promise.all([
			this.getItems([id], vendorId),
			this.getCycles(id),
			this.getHistory(id),
			this.db.instance('pre_order_items').count({ total: '*' }).where('preOrderRequestId', id).first(),
		]);

		return {
			...this.toVendorListItem(row),
			shippingAddress: this.toAddress(row),
			items: items.get(id) ?? [],
			otherVendorItemCount: Number(otherRow?.total ?? 0) - row.myItemCount,
			cycles,
			statusHistory,
		};
	}

	// ---------- shared reads ----------

	/** Items of the given requests; with vendorId, only that vendor's items. */
	public async getItems(requestIds: string[], vendorId?: string): Promise<Map<string, OrderItemView[]>> {
		const itemsByRequest = new Map<string, OrderItemView[]>();

		if (requestIds.length === 0) return itemsByRequest;

		const rows: ItemRow[] = await this.db.instance('pre_order_items as i')
			.select(
				'i.id',
				'i.preOrderRequestId',
				'i.productId',
				'p.slug as productSlug',
				'i.productTitle',
				this.db.instance.raw(ITEM_IMAGE_SQL),
				'i.unitPrice',
				'i.unit',
				'i.quantity',
				'i.note',
				'i.status',
				'i.declineReason',
			)
			.leftJoin('products as p', 'p.id', 'i.productId')
			.whereIn('i.preOrderRequestId', requestIds)
			.modify((query) => {
				if (vendorId) query.where('p.vendorId', vendorId);
			})
			.orderBy('i.productTitle');

		for (const { preOrderRequestId, unitPrice, ...item } of rows) {
			const items = itemsByRequest.get(preOrderRequestId) ?? [];
			items.push({ ...item, unitPrice: Number(unitPrice), rating: null });
			itemsByRequest.set(preOrderRequestId, items);
		}

		return itemsByRequest;
	}

	public async getCycles(requestId: string): Promise<PreOrderCycleView[]> {
		const rows: Array<
			Omit<PreOrderCycleView, 'generatedOrder'> & {
				orderId: string | null;
				orderNumber: string | null;
				orderStatus: OrderStatus | null;
			}
		> = await this.db.instance('pre_order_cycles as c')
			.select(
				'c.id',
				'c.cycleNumber',
				'c.currentStatus',
				'c.scheduledAt',
				'c.createdAt',
				'o.id as orderId',
				'o.orderNumber',
				'o.currentStatus as orderStatus',
			)
			.leftJoin('orders as o', 'o.id', 'c.generatedOrderId')
			.where('c.preOrderRequestId', requestId)
			.orderBy('c.cycleNumber');

		return rows.map(({ orderId, orderNumber, orderStatus, ...cycle }) => ({
			...cycle,
			generatedOrder:
				orderId && orderNumber && orderStatus
					? { id: orderId, orderNumber, currentStatus: orderStatus }
					: null,
		}));
	}

	public async getHistory(requestId: string): Promise<PreOrderStatusHistoryView[]> {
		const rows: Array<
			Omit<PreOrderStatusHistoryView, 'actor'> & { actorId: string | null; actorDisplayName: string | null }
		> = await this.db.instance('pre_order_status_histories as h')
			.select('h.id', 'h.status', 'h.actorId', 'actor.displayname as actorDisplayName', 'h.note', 'h.timestamp')
			.leftJoin('users as actor', 'actor.id', 'h.actorId')
			.where('h.preOrderRequestId', requestId)
			.orderBy('h.timestamp', 'asc');

		return rows.map(({ actorId, actorDisplayName, ...entry }) => ({
			...entry,
			actor: actorId ? { id: actorId, displayName: actorDisplayName ?? '' } : null,
		}));
	}

	private withSummaryColumns(query: Knex.QueryBuilder): Knex.QueryBuilder {
		const knex = this.db.instance;

		return query.select(
			'r.id',
			'r.issuerId',
			'r.currentStatus',
			'r.frequency',
			'r.durationMonths',
			// Plain YYYY-MM-DD, not a Date at some server-local midnight
			knex.raw('r.start_date::text AS start_date'),
			knex.raw('r.end_date::text AS end_date'),
			'r.approvalDeadline',
			'r.billingPreference',
			'r.defaultPaymentMethod',
			'r.currency',
			'r.shippingRecipientName',
			'r.shippingPhone',
			'r.shippingStreetAddress',
			'r.shippingWard',
			'r.shippingProvince',
			'r.shippingNote',
			'r.requestedAt',
			'r.updatedAt',
			knex.raw(
				`(SELECT coalesce(sum(i.unit_price * i.quantity), 0) FROM pre_order_items i
				WHERE i.pre_order_request_id = r.id AND i.status IN ('PENDING', 'APPROVED')) AS cycle_subtotal`,
			),
			knex.raw('(SELECT count(*) FROM pre_order_cycles c WHERE c.pre_order_request_id = r.id)::int AS cycle_count'),
			knex.raw(
				`(SELECT min(c.scheduled_at) FROM pre_order_cycles c
				WHERE c.pre_order_request_id = r.id AND c.current_status = 'SCHEDULED') AS next_cycle_at`,
			),
		);
	}

	private withVendorColumns(query: Knex.QueryBuilder, vendorId: string): Knex.QueryBuilder {
		const knex = this.db.instance;

		return this.withSummaryColumns(query)
			.select(
				'customer.displayname as customerDisplayName',
				knex.raw(`(SELECT count(*) ${MY_ITEMS_SQL})::int AS my_item_count`, [vendorId]),
				knex.raw(`(SELECT count(*) ${MY_ITEMS_SQL} AND i.status = 'PENDING')::int AS my_pending_count`, [vendorId]),
				knex.raw(`(SELECT count(*) ${MY_ITEMS_SQL} AND i.status = 'APPROVED')::int AS my_approved_count`, [
					vendorId,
				]),
				knex.raw(`(SELECT count(*) ${MY_ITEMS_SQL} AND i.status = 'EXPIRED')::int AS my_expired_count`, [vendorId]),
				knex.raw(
					`(SELECT coalesce(sum(i.unit_price * i.quantity), 0) ${MY_ITEMS_SQL}
					AND i.status IN ('PENDING', 'APPROVED')) AS my_subtotal`,
					[vendorId],
				),
			)
			.leftJoin('users as customer', 'customer.id', 'r.issuerId');
	}

	private toSummary(row: RequestRow): PreOrderSummary {
		return {
			id: row.id,
			currentStatus: row.currentStatus,
			frequency: row.frequency,
			durationMonths: row.durationMonths,
			startDate: row.startDate,
			endDate: row.endDate,
			approvalDeadline: row.approvalDeadline,
			billingPreference: row.billingPreference,
			defaultPaymentMethod: row.defaultPaymentMethod,
			currency: row.currency,
			cycleSubtotal: Number(row.cycleSubtotal),
			cycleCount: row.cycleCount,
			nextCycleAt: row.nextCycleAt,
			requestedAt: row.requestedAt,
			updatedAt: row.updatedAt,
		};
	}

	private toVendorListItem(row: VendorRequestRow): VendorPreOrderListItem {
		const myStatus: OrderItemStatus =
			row.myPendingCount > 0
				? 'PENDING'
				: row.myApprovedCount > 0
					? 'APPROVED'
					: row.myExpiredCount > 0
						? 'EXPIRED'
						: 'DECLINED';

		return {
			...this.toSummary(row),
			customer: row.issuerId ? { id: row.issuerId, displayName: row.customerDisplayName ?? '' } : null,
			myStatus,
			myItemCount: row.myItemCount,
			mySubtotal: Number(row.mySubtotal),
		};
	}

	private toAddress(row: {
		shippingRecipientName: string;
		shippingPhone: string;
		shippingStreetAddress: string;
		shippingWard: string;
		shippingProvince: string;
		shippingNote: string | null;
	}): ShippingAddress {
		return {
			recipientName: row.shippingRecipientName,
			phone: row.shippingPhone,
			streetAddress: row.shippingStreetAddress,
			ward: row.shippingWard,
			province: row.shippingProvince,
			...(row.shippingNote ? { note: row.shippingNote } : {}),
		};
	}
}

export default new PreOrderDAO();
