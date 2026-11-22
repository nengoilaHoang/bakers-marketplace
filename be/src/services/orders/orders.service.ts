import db from '#/db/index.js';
import orderDAO, { type NewOrderItem } from '#/daos/orders/orders.dao.js';
import ratingDAO from '#/daos/ratings/ratings.dao.js';
import {
	BadRequestError,
	ConflictError,
	NotFoundError,
} from '#/utils/http-errors.js';
import type { Paginated } from '#/models/admin/admin.model.js';
import type {
	OrderCreate,
	OrderDetail,
	OrderListItem,
	OrderQuery,
	OrderRatingCreate,
	ReorderResult,
} from '#/models/orders/orders.model.js';

class OrderService {
	private orderDAO = orderDAO;

	/**
	 * Places one order for the whole cart (products of any vendors) and takes the
	 * stock in the same transaction. Prices, titles and units are read from the DB.
	 */
	public async place(userId: string, payload: OrderCreate): Promise<OrderDetail> {
		const orderId = await db.instance.transaction(async (trx) => {
			const productIds = payload.items.map((item) => item.productId);
			const products = await this.orderDAO.lockProducts(productIds, trx);
			const productById = new Map(products.map((product) => [product.id, product]));

			const items: NewOrderItem[] = payload.items.map((item) => {
				const product = productById.get(item.productId);

				if (!product) {
					throw new NotFoundError(`Product ${item.productId} not found`, 'PRODUCT_NOT_FOUND');
				}

				// A product without a stock row has never been stocked, so it cannot be sold
				if (product.stock === null || product.stock < item.quantity) {
					throw new ConflictError(
						`Not enough stock for "${product.title}" (${product.stock ?? 0} left)`,
						'INSUFFICIENT_STOCK',
					);
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
				throw new BadRequestError('All products of an order must share one currency', 'MIXED_CURRENCY');
			}

			// Fees, tax and commission are not charged yet, so the total is the subtotal
			const subtotal = items.reduce(
				(sum, item) => sum + Number(item.unitPrice) * item.quantity,
				0,
			);

			for (const item of items) {
				await this.orderDAO.decrementStock(item.productId, item.quantity, trx);
			}

			const id = await this.orderDAO.create(
				{
					orderedBy: userId,
					shippingAddress: payload.shippingAddress,
					subtotal,
					totalAmount: subtotal,
					currency: [...currencies][0],
				},
				items,
				trx,
			);

			await this.orderDAO.addHistory({ orderId: id, status: 'PENDING', actorId: userId }, trx);

			return id;
		});

		return this.getOwnDetail(userId, orderId);
	}

	public async getMine(userId: string, query: OrderQuery): Promise<Paginated<OrderListItem>> {
		return this.orderDAO.getPageByUser(userId, query);
	}

	/** Someone else's order answers 404, so order ids cannot be probed. */
	public async getOwnDetail(userId: string, id: string): Promise<OrderDetail> {
		await this.assertOwner(userId, id);

		const order = await this.orderDAO.getDetail(id);

		if (!order) {
			throw new NotFoundError('Order not found');
		}

		return order;
	}

	/** Only a pending order can be cancelled; its stock goes back. */
	public async cancel(userId: string, id: string, reason?: string): Promise<OrderDetail> {
		await this.assertOwner(userId, id);

		await db.instance.transaction(async (trx) => {
			// The status switch is the guard: a second cancel, or one racing an approval, gets 409
			if (!(await this.orderDAO.updateStatus(id, 'PENDING', 'CANCELLED', trx))) {
				throw new ConflictError('Only a pending order can be cancelled', 'ORDER_NOT_PENDING');
			}

			await this.orderDAO.restoreStock(id, trx);
			await this.orderDAO.addHistory(
				{ orderId: id, status: 'CANCELLED', actorId: userId, note: reason },
				trx,
			);
		});

		return this.getOwnDetail(userId, id);
	}

	/**
	 * The items of a past order as they can be bought now: current price, quantity
	 * lowered to the stock left. Deleted or sold-out products are listed apart.
	 */
	public async reorder(userId: string, id: string): Promise<ReorderResult> {
		await this.assertOwner(userId, id);

		const lines = await this.orderDAO.getReorderLines(id);
		const result: ReorderResult = { items: [], skipped: [] };

		for (const line of lines) {
			if (!line.productId || !line.slug || !line.title || line.unitPrice === null) {
				result.skipped.push({ productTitle: line.productTitle, reason: 'DELETED' });
				continue;
			}

			const stock = line.stock ?? 0;

			if (stock <= 0) {
				result.skipped.push({ productTitle: line.title, reason: 'OUT_OF_STOCK' });
				continue;
			}

			result.items.push({
				productId: line.productId,
				slug: line.slug,
				title: line.title,
				unitPrice: Number(line.unitPrice),
				currency: line.currency ?? 'VND',
				unit: line.unit ?? '',
				imageUrl: line.imageUrl,
				brandId: line.brandId,
				brandName: line.brandName,
				stock,
				quantity: Math.min(line.quantity, stock),
			});
		}

		return result;
	}

	/** The buyer rates an item of a completed order, once. */
	public async rateItem(
		userId: string,
		orderId: string,
		itemId: string,
		payload: OrderRatingCreate,
	): Promise<OrderDetail> {
		const order = await this.assertOwner(userId, orderId);

		if (order.currentStatus !== 'COMPLETED') {
			throw new ConflictError('Only items of a completed order can be rated', 'ORDER_NOT_COMPLETED');
		}

		const item = await this.orderDAO.getItem(orderId, itemId);

		if (!item) {
			throw new NotFoundError('Order item not found');
		}

		if (item.status !== 'APPROVED') {
			throw new ConflictError('Only delivered (approved) items can be rated', 'ITEM_NOT_APPROVED');
		}

		if (item.ratingId) {
			throw new ConflictError('This item has already been rated', 'ALREADY_RATED');
		}

		try {
			await ratingDAO.createOrderRating({ raterId: userId, orderItemId: itemId, ...payload });
		} catch (error) {
			// Two ratings sent at once: the unique order_item_id keeps the second one out
			if ((error as { code?: string }).code === '23505') {
				throw new ConflictError('This item has already been rated', 'ALREADY_RATED');
			}

			throw error;
		}

		return this.getOwnDetail(userId, orderId);
	}

	private async assertOwner(userId: string, id: string) {
		const order = await this.orderDAO.getOwner(id);

		if (!order || order.orderedBy !== userId) {
			throw new NotFoundError('Order not found');
		}

		return order;
	}
}

export default new OrderService();
