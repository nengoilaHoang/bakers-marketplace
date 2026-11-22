import { randomBytes } from 'node:crypto';

import db from '#/db/index.js';
import type { Knex } from 'knex';
import type { Paginated } from '#/models/admin/admin.model.js';
import type {
	AdminShipmentQuery,
	AdminShipmentRow,
	ShipmentStatus,
} from '#/models/orders/orders.model.js';
import { paginate } from '#/utils/pagination.js';

/** The steps of a delivery, in order, with the tracking text each step records. */
export const SHIPMENT_STEPS: { status: ShipmentStatus; locationName: string; description: string }[] = [
	{ status: 'LABEL_CREATED', locationName: 'Bakers Marketplace', description: 'Đã tạo vận đơn' },
	{ status: 'PICKED_UP', locationName: 'Tiệm bánh', description: 'Đơn vị vận chuyển đã lấy hàng' },
	{ status: 'IN_TRANSIT', locationName: 'Kho trung chuyển', description: 'Đang trung chuyển' },
	{ status: 'OUT_FOR_DELIVERY', locationName: 'Bưu cục gần bạn', description: 'Shipper đang giao hàng' },
	{ status: 'DELIVERED', locationName: 'Địa chỉ nhận hàng', description: 'Giao hàng thành công' },
];

// The platform ships every order with one carrier (no carrier API yet)
const CARRIER = 'Giao Hàng Nhanh';
const TRACKING_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function newTrackingNumber(): string {
	const bytes = randomBytes(7);
	return `GHN${[...bytes].map((byte) => TRACKING_ALPHABET[byte % TRACKING_ALPHABET.length]).join('')}`;
}

type AdminShipmentDbRow = Omit<AdminShipmentRow, 'customer' | 'totalAmount'> & {
	orderedBy: string | null;
	customerDisplayName: string | null;
	totalAmount: string | number;
};

/** Shipments are created by the system when an order is approved and moved forward by admins. */
class ShipmentDAO {
	private readonly tableName = 'shipments';
	private db = db;

	/** Creates the order's shipment at its first step; an order has at most one. */
	public async createForOrder(orderId: string, trx: Knex.Transaction): Promise<void> {
		const [first] = SHIPMENT_STEPS;
		const [shipment] = await trx(this.tableName)
			.insert({
				orderId,
				carrier: CARRIER,
				trackingNumber: newTrackingNumber(),
				currentStatus: first.status,
				// Rough promise shown to the buyer: three days
				estimatedDelivery: trx.raw(`now() + interval '3 days'`),
			})
			.returning('id');

		await trx('tracking_events').insert({
			shipmentId: shipment.id,
			status: first.status,
			locationName: first.locationName,
			description: first.description,
		});
	}

	/** Locks the shipment row with its order's status, so one click moves it one step only. */
	public async lock(
		shipmentId: string,
		trx: Knex.Transaction,
	): Promise<{ orderId: string; currentStatus: ShipmentStatus; orderStatus: string } | null> {
		const row = await trx(`${this.tableName} as s`)
			.select('s.orderId', 's.currentStatus', 'o.currentStatus as orderStatus')
			.join('orders as o', 'o.id', 's.orderId')
			.where('s.id', shipmentId)
			.forUpdate('s')
			.first();

		return row ?? null;
	}

	public async moveTo(
		shipmentId: string,
		step: (typeof SHIPMENT_STEPS)[number],
		trx: Knex.Transaction,
	): Promise<void> {
		await trx(this.tableName)
			.where('id', shipmentId)
			.update({
				currentStatus: step.status,
				updatedAt: trx.fn.now(),
				...(step.status === 'DELIVERED' ? { estimatedDelivery: trx.fn.now() } : {}),
			});

		await trx('tracking_events').insert({
			shipmentId,
			status: step.status,
			locationName: step.locationName,
			description: step.description,
		});
	}

	public async getPage(query: AdminShipmentQuery): Promise<Paginated<AdminShipmentRow>> {
		const filtered = this.db.instance(`${this.tableName} as s`);

		if (query.view === 'active') {
			filtered.whereNot('s.currentStatus', 'DELIVERED');
		} else if (query.view === 'delivered') {
			filtered.where('s.currentStatus', 'DELIVERED');
		}

		return paginate<AdminShipmentDbRow, AdminShipmentRow>(
			filtered,
			(rows) =>
				rows
					.select(
						's.id',
						's.orderId',
						'o.orderNumber',
						'o.orderedBy',
						'customer.displayname as customerDisplayName',
						'o.totalAmount',
						'o.currency',
						's.carrier',
						's.trackingNumber',
						's.currentStatus',
						's.updatedAt',
						this.db.instance.raw(
							`(SELECT count(*) FROM order_items oi WHERE oi.order_id = o.id AND oi.status = 'APPROVED')::int AS item_count`,
						),
					)
					.join('orders as o', 'o.id', 's.orderId')
					.leftJoin('users as customer', 'customer.id', 'o.orderedBy')
					// Oldest updates first: those have waited longest for the next step
					.orderBy('s.updatedAt', query.view === 'delivered' ? 'desc' : 'asc')
					.orderBy('s.id'),
			query,
			({ orderedBy, customerDisplayName, totalAmount, ...row }) => ({
				...row,
				totalAmount: Number(totalAmount),
				customer: orderedBy ? { id: orderedBy, displayName: customerDisplayName ?? '' } : null,
			}),
		);
	}
}

export default new ShipmentDAO();
