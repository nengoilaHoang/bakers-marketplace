import db from '#/db/index.js';
import type { Knex } from 'knex';
import type { Paginated } from '#/models/admin/admin.model.js';
import type {
	OrderDetail,
	OrderItemView,
	OrderItemStatus,
	OrderListItem,
	OrderQuery,
	OrderStatus,
	OrderStatusHistoryView,
	OrderSummary,
	ShipmentView,
	ShippingAddress,
	TrackingEventView,
} from '#/models/orders/orders.model.js';
import { paginate } from '#/utils/pagination.js';

/** Numeric columns come back from pg as strings. */
type Money = string | number;

export type OrderRow = {
	id: string;
	orderNumber: string;
	orderedBy: string | null;
	currentStatus: OrderStatus;
	subtotal: Money;
	deliveryFee: Money;
	taxPercentage: Money;
	totalAmount: Money;
	currency: string;
	shippingRecipientName: string;
	shippingPhone: string;
	shippingStreetAddress: string;
	shippingWard: string;
	shippingProvince: string;
	shippingNote: string | null;
	placedAt: Date;
	updatedAt: Date;
};

type OrderItemRow = Omit<OrderItemView, 'unitPrice' | 'rating'> & {
	orderId: string;
	unitPrice: Money;
	ratingId: string | null;
	rating: number | null;
	comment: string | null;
	ratedAt: Date | null;
};

type HistoryRow = Omit<OrderStatusHistoryView, 'actor'> & {
	actorId: string | null;
	actorDisplayName: string | null;
};

/** A product as the checkout sees it, with the stock row it locked. */
export type OrderableProduct = {
	id: string;
	title: string;
	unitPrice: Money;
	unitCost: Money;
	unit: string;
	currency: string;
	stock: number | null;
};

export type NewOrder = {
	orderedBy: string;
	shippingAddress: ShippingAddress;
	subtotal: number;
	totalAmount: number;
	currency: string;
};

export type NewOrderItem = {
	productId: string;
	productTitle: string;
	unitPrice: Money;
	unitCost: Money;
	unit: string;
	quantity: number;
	note?: string;
};

// First image of the product an order item points at
const ITEM_IMAGE_SQL = `(
	SELECT f.url FROM product_images pi JOIN files f ON f.id = pi.image_id
	WHERE pi.product_id = oi.product_id ORDER BY pi.sort_order LIMIT 1
) AS image_url`;

class OrderDAO {
	private readonly tableName = 'orders';
	private db = db;

	// ---------- placing / cancelling ----------

	/**
	 * Reads the products and locks their stock rows until the transaction ends,
	 * always in id order so two checkouts never wait on each other in a cycle.
	 */
	public async lockProducts(
		productIds: string[],
		trx: Knex.Transaction,
	): Promise<OrderableProduct[]> {
		const stocks: { id: string; stock: number }[] = await trx('product_stocks')
			.select('id', 'stock')
			.whereIn('id', productIds)
			.orderBy('id')
			.forUpdate();
		const stockById = new Map(stocks.map((row) => [row.id, row.stock]));

		const products: Omit<OrderableProduct, 'stock'>[] = await trx('products')
			.select('id', 'title', 'unitPrice', 'unitCost', 'unit', 'currency')
			.whereIn('id', productIds);

		return products.map((product) => ({
			...product,
			stock: stockById.get(product.id) ?? null,
		}));
	}

	public async decrementStock(
		productId: string,
		quantity: number,
		trx: Knex.Transaction,
	): Promise<void> {
		await trx('product_stocks')
			.where('id', productId)
			.decrement('stock', quantity);
	}

	/**
	 * Gives back the stock an order still holds (products deleted since are skipped).
	 * Declined items already gave theirs back when the vendor declined them.
	 */
	public async restoreStock(orderId: string, trx: Knex.Transaction): Promise<void> {
		await trx.raw(
			`UPDATE product_stocks s SET stock = s.stock + oi.quantity
			FROM order_items oi
			WHERE oi.order_id = ? AND oi.product_id = s.id AND oi.status <> 'DECLINED'`,
			[orderId],
		);
	}

	public async create(
		order: NewOrder,
		items: NewOrderItem[],
		trx: Knex.Transaction,
	): Promise<string> {
		const { shippingAddress: address, ...rest } = order;
		const [created] = await trx(this.tableName)
			.insert({
				...rest,
				shippingRecipientName: address.recipientName,
				shippingPhone: address.phone,
				shippingStreetAddress: address.streetAddress,
				shippingWard: address.ward,
				shippingProvince: address.province,
				shippingNote: address.note ?? null,
			})
			.returning('id');

		await trx('order_items').insert(
			items.map((item) => ({ ...item, note: item.note ?? null, orderId: created.id })),
		);

		return created.id;
	}

	/** Changes the status only when it is still `from`; returns false otherwise. */
	public async updateStatus(
		id: string,
		from: OrderStatus,
		to: OrderStatus,
		trx: Knex.Transaction,
	): Promise<boolean> {
		const updated = await trx(this.tableName)
			.where({ id, currentStatus: from })
			.update({ currentStatus: to, updatedAt: trx.fn.now() });

		return updated > 0;
	}

	public async addHistory(
		entry: { orderId: string; status: OrderStatus; actorId: string | null; note?: string },
		trx: Knex.Transaction,
	): Promise<void> {
		await trx('order_status_histories').insert({ ...entry, note: entry.note ?? null });
	}

	// ---------- reading ----------

	public async getOwner(id: string): Promise<{ orderedBy: string | null; currentStatus: OrderStatus } | null> {
		const row = await this.db.instance(this.tableName)
			.select('orderedBy', 'currentStatus')
			.where('id', id)
			.first();

		return row ?? null;
	}

	public async getPageByUser(
		userId: string,
		query: OrderQuery,
	): Promise<Paginated<OrderListItem>> {
		const filtered = this.db.instance(`${this.tableName} as o`).where('o.orderedBy', userId);

		if (query.status) {
			filtered.where('o.currentStatus', query.status);
		}

		const page = await paginate<OrderRow, OrderSummary>(
			filtered,
			(rows) => rows.select('o.*').orderBy('o.placedAt', 'desc').orderBy('o.id', 'desc'),
			query,
			(row) => this.toSummary(row),
		);

		const items = await this.getItems(page.data.map((order) => order.id));

		return {
			...page,
			data: page.data.map((order) => ({
				...order,
				items: (items.get(order.id) ?? []).map(({ id, productTitle, imageUrl, quantity }) => ({
					id,
					productTitle,
					imageUrl,
					quantity,
				})),
			})),
		};
	}

	public async getDetail(id: string): Promise<OrderDetail | null> {
		const row: OrderRow | undefined = await this.db.instance(this.tableName)
			.select('*')
			.where('id', id)
			.first();

		if (!row) {
			return null;
		}

		const [items, statusHistory, shipment] = await Promise.all([
			this.getItems([id]),
			this.getHistory(id),
			this.getShipment(id),
		]);

		return {
			...this.toSummary(row),
			shippingAddress: {
				recipientName: row.shippingRecipientName,
				phone: row.shippingPhone,
				streetAddress: row.shippingStreetAddress,
				ward: row.shippingWard,
				province: row.shippingProvince,
				...(row.shippingNote ? { note: row.shippingNote } : {}),
			},
			items: items.get(id) ?? [],
			statusHistory,
			shipment,
		};
	}

	public async getItem(
		orderId: string,
		itemId: string,
	): Promise<{ id: string; status: OrderItemStatus; ratingId: string | null } | null> {
		const row = await this.db.instance('order_items as oi')
			.select('oi.id', 'oi.status', 'r.id as ratingId')
			.leftJoin('order_ratings as r', 'r.orderItemId', 'oi.id')
			.where({ 'oi.id': itemId, 'oi.orderId': orderId })
			.first();

		return row ?? null;
	}

	/** The items of an order with the product they point at, for a reorder. */
	public async getReorderLines(orderId: string): Promise<
		{
			productId: string | null;
			productTitle: string;
			quantity: number;
			slug: string | null;
			title: string | null;
			unitPrice: Money | null;
			currency: string | null;
			unit: string | null;
			brandId: string | null;
			brandName: string | null;
			stock: number | null;
			imageUrl: string | null;
		}[]
	> {
		return this.db.instance('order_items as oi')
			.select(
				'oi.productId',
				'oi.productTitle',
				'oi.quantity',
				'p.slug',
				'p.title',
				'p.unitPrice',
				'p.currency',
				'p.unit',
				'b.id as brandId',
				'b.name as brandName',
				's.stock',
				this.db.instance.raw(ITEM_IMAGE_SQL),
			)
			.leftJoin('products as p', 'p.id', 'oi.productId')
			.leftJoin('brands as b', 'b.id', 'p.brandId')
			.leftJoin('product_stocks as s', 's.id', 'oi.productId')
			.where('oi.orderId', orderId)
			.orderBy('oi.productTitle');
	}

	/** Items of the given orders; with vendorId, only that vendor's items. */
	public async getItems(
		orderIds: string[],
		vendorId?: string,
	): Promise<Map<string, OrderItemView[]>> {
		const itemsByOrder = new Map<string, OrderItemView[]>();

		if (orderIds.length === 0) {
			return itemsByOrder;
		}

		const rows: OrderItemRow[] = await this.db.instance('order_items as oi')
			.select(
				'oi.id',
				'oi.orderId',
				'oi.productId',
				'p.slug as productSlug',
				'oi.productTitle',
				this.db.instance.raw(ITEM_IMAGE_SQL),
				'oi.unitPrice',
				'oi.unit',
				'oi.quantity',
				'oi.note',
				'oi.status',
				'oi.declineReason',
				'r.id as ratingId',
				'r.rating',
				'r.comment',
				'r.ratedAt',
			)
			.leftJoin('products as p', 'p.id', 'oi.productId')
			.leftJoin('order_ratings as orr', 'orr.orderItemId', 'oi.id')
			.leftJoin('ratings as r', 'r.id', 'orr.id')
			.whereIn('oi.orderId', orderIds)
			.modify((query) => {
				if (vendorId) query.where('p.vendorId', vendorId);
			})
			.orderBy('oi.productTitle');

		for (const { orderId, ratingId, rating, comment, ratedAt, unitPrice, ...item } of rows) {
			const items = itemsByOrder.get(orderId) ?? [];
			items.push({
				...item,
				unitPrice: Number(unitPrice),
				rating:
					ratingId && rating !== null && ratedAt
						? { id: ratingId, rating, comment, ratedAt }
						: null,
			});
			itemsByOrder.set(orderId, items);
		}

		return itemsByOrder;
	}

	public async getHistory(orderId: string): Promise<OrderStatusHistoryView[]> {
		const rows: HistoryRow[] = await this.db.instance('order_status_histories as h')
			.select(
				'h.id',
				'h.status',
				'h.actorId',
				'actor.displayname as actorDisplayName',
				'h.note',
				'h.timestamp',
			)
			.leftJoin('users as actor', 'actor.id', 'h.actorId')
			.where('h.orderId', orderId)
			.orderBy('h.timestamp', 'asc');

		return rows.map(({ actorId, actorDisplayName, ...entry }) => ({
			...entry,
			actor: actorId ? { id: actorId, displayName: actorDisplayName ?? '' } : null,
		}));
	}

	public async getShipment(orderId: string): Promise<ShipmentView | null> {
		const shipment: Omit<ShipmentView, 'events'> | undefined = await this.db.instance('shipments')
			.select('id', 'carrier', 'trackingNumber', 'estimatedDelivery', 'currentStatus')
			.where('orderId', orderId)
			.first();

		if (!shipment) {
			return null;
		}

		const events: TrackingEventView[] = await this.db.instance('tracking_events')
			.select('id', 'status', 'locationName', 'description', 'timestamp')
			.where('shipmentId', shipment.id)
			.orderBy('timestamp', 'desc');

		return { ...shipment, events };
	}

	public toSummary(row: OrderRow): OrderSummary {
		return {
			id: row.id,
			orderNumber: row.orderNumber,
			currentStatus: row.currentStatus,
			subtotal: Number(row.subtotal),
			deliveryFee: Number(row.deliveryFee),
			taxPercentage: Number(row.taxPercentage),
			totalAmount: Number(row.totalAmount),
			currency: row.currency,
			placedAt: row.placedAt,
			updatedAt: row.updatedAt,
		};
	}
}

export default new OrderDAO();
