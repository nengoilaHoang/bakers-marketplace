import db from '#/db/index.js';
import type { Knex } from 'knex';
import orderDAO, { type OrderRow } from '#/daos/orders/orders.dao.js';
import type { Paginated } from '#/models/admin/admin.model.js';
import type {
	OrderItemStatus,
	OrderStatus,
	VendorOrderDetail,
	VendorOrderListItem,
	VendorOrderQuery,
	VendorPartStatus,
} from '#/models/orders/orders.model.js';
import { paginate } from '#/utils/pagination.js';

type VendorOrderRow = OrderRow & {
	customerDisplayName: string | null;
	myPendingCount: number;
	myApprovedCount: number;
	myItemCount: number;
	mySubtotal: string | number;
};

/** The order's items that belong to a vendor (through their product). */
const MY_ITEMS_SQL = `FROM order_items oi JOIN products p ON p.id = oi.product_id
	WHERE oi.order_id = o.id AND p.vendor_id = ?`;

/** Orders as a vendor sees them: only orders holding its products, only its own items. */
class VendorOrderDAO {
	private readonly tableName = 'orders';
	private db = db;

	public async getPage(
		vendorId: string,
		query: VendorOrderQuery,
	): Promise<Paginated<VendorOrderListItem>> {
		const knex = this.db.instance;
		const filtered = knex(`${this.tableName} as o`).whereRaw(`EXISTS (SELECT 1 ${MY_ITEMS_SQL})`, [vendorId]);

		if (query.status) {
			filtered.where('o.currentStatus', query.status);
		}

		if (query.awaiting) {
			filtered
				.where('o.currentStatus', 'PENDING')
				.whereRaw(`EXISTS (SELECT 1 ${MY_ITEMS_SQL} AND oi.status = 'PENDING')`, [vendorId]);
		}

		return paginate<VendorOrderRow, VendorOrderListItem>(
			filtered,
			(rows) =>
				this.withVendorColumns(rows, vendorId)
					.orderBy('o.placedAt', 'desc')
					.orderBy('o.id', 'desc'),
			query,
			(row) => this.toListItem(row),
		);
	}

	public async getDetail(vendorId: string, orderId: string): Promise<VendorOrderDetail | null> {
		const row: VendorOrderRow | undefined = await this.withVendorColumns(
			this.db.instance(`${this.tableName} as o`),
			vendorId,
		)
			.where('o.id', orderId)
			.first();

		// An order without this vendor's products does not exist for this vendor
		if (!row || row.myItemCount === 0) {
			return null;
		}

		const [items, statusHistory, shipment, otherRow] = await Promise.all([
			orderDAO.getItems([orderId], vendorId),
			orderDAO.getHistory(orderId),
			orderDAO.getShipment(orderId),
			this.db.instance('order_items').count({ total: '*' }).where('orderId', orderId).first(),
		]);

		return {
			...this.toListItem(row),
			shippingAddress: {
				recipientName: row.shippingRecipientName,
				phone: row.shippingPhone,
				streetAddress: row.shippingStreetAddress,
				ward: row.shippingWard,
				province: row.shippingProvince,
				...(row.shippingNote ? { note: row.shippingNote } : {}),
			},
			items: items.get(orderId) ?? [],
			otherVendorItemCount: Number(otherRow?.total ?? 0) - row.myItemCount,
			statusHistory,
			shipment,
		};
	}

	/** Locks the order row so vendors' answers and the buyer's cancel are applied one at a time. */
	public async lockOrder(
		orderId: string,
		trx: Knex.Transaction,
	): Promise<{ currentStatus: OrderStatus } | null> {
		const row = await trx(this.tableName)
			.select('currentStatus')
			.where('id', orderId)
			.forUpdate()
			.first();

		return row ?? null;
	}

	/** Moves this vendor's still-pending items to APPROVED / DECLINED; returns what it changed. */
	public async decidePendingItems(
		vendorId: string,
		orderId: string,
		status: Exclude<OrderItemStatus, 'PENDING'>,
		declineReason: string | null,
		trx: Knex.Transaction,
	): Promise<{ id: string; productId: string; quantity: number }[]> {
		const result = await trx.raw(
			`UPDATE order_items oi SET status = ?, decline_reason = ?
			FROM products p
			WHERE p.id = oi.product_id AND p.vendor_id = ? AND oi.order_id = ? AND oi.status = 'PENDING'
			RETURNING oi.id, oi.product_id, oi.quantity`,
			[status, declineReason, vendorId, orderId],
		);

		// Raw rows also go through the knex camelCase hook
		return result.rows as { id: string; productId: string; quantity: number }[];
	}

	public async restoreItemStock(
		items: { productId: string; quantity: number }[],
		trx: Knex.Transaction,
	): Promise<void> {
		for (const item of items) {
			await trx('product_stocks').where('id', item.productId).increment('stock', item.quantity);
		}
	}

	/** Item counts of the whole order and the total of the items it still holds. */
	public async getItemSummary(
		orderId: string,
		trx: Knex.Transaction,
	): Promise<{ pending: number; approved: number; subtotal: number }> {
		const row = await trx('order_items')
			.where('orderId', orderId)
			.select(
				trx.raw(`count(*) FILTER (WHERE status = 'PENDING')::int AS pending`),
				trx.raw(`count(*) FILTER (WHERE status = 'APPROVED')::int AS approved`),
				trx.raw(`coalesce(sum(unit_price * quantity) FILTER (WHERE status <> 'DECLINED'), 0) AS subtotal`),
			)
			.first();

		return { pending: row.pending, approved: row.approved, subtotal: Number(row.subtotal) };
	}

	public async updateTotals(
		orderId: string,
		subtotal: number,
		status: OrderStatus,
		trx: Knex.Transaction,
	): Promise<void> {
		// No fees or tax are charged yet, so the total follows the subtotal
		await trx(this.tableName)
			.where('id', orderId)
			.update({ subtotal, totalAmount: subtotal, currentStatus: status, updatedAt: trx.fn.now() });
	}

	/** Names of this vendor's brands among the order's items, for the history note. */
	public async getBrandNames(vendorId: string, orderId: string, trx: Knex.Transaction): Promise<string[]> {
		const rows: { name: string }[] = await trx('order_items as oi')
			.distinct('b.name')
			.join('products as p', 'p.id', 'oi.productId')
			.join('brands as b', 'b.id', 'p.brandId')
			.where({ 'oi.orderId': orderId, 'p.vendorId': vendorId });

		return rows.map((row) => row.name);
	}

	private withVendorColumns(query: Knex.QueryBuilder, vendorId: string): Knex.QueryBuilder {
		const knex = this.db.instance;

		return query
			.select(
				'o.*',
				'customer.displayname as customerDisplayName',
				knex.raw(`(SELECT count(*) ${MY_ITEMS_SQL})::int AS my_item_count`, [vendorId]),
				knex.raw(`(SELECT count(*) ${MY_ITEMS_SQL} AND oi.status = 'PENDING')::int AS my_pending_count`, [vendorId]),
				knex.raw(`(SELECT count(*) ${MY_ITEMS_SQL} AND oi.status = 'APPROVED')::int AS my_approved_count`, [vendorId]),
				knex.raw(
					`(SELECT coalesce(sum(oi.unit_price * oi.quantity), 0) ${MY_ITEMS_SQL} AND oi.status <> 'DECLINED') AS my_subtotal`,
					[vendorId],
				),
			)
			.leftJoin('users as customer', 'customer.id', 'o.orderedBy');
	}

	private toListItem(row: VendorOrderRow): VendorOrderListItem {
		const myStatus: VendorPartStatus =
			row.myPendingCount > 0 ? 'PENDING' : row.myApprovedCount > 0 ? 'APPROVED' : 'DECLINED';

		return {
			...orderDAO.toSummary(row),
			customer: row.orderedBy
				? { id: row.orderedBy, displayName: row.customerDisplayName ?? '' }
				: null,
			myStatus,
			myItemCount: row.myItemCount,
			mySubtotal: Number(row.mySubtotal),
		};
	}
}

export default new VendorOrderDAO();
