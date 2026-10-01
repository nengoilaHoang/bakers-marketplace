import type { Knex } from 'knex';

import db from '#/db/index.js';
import type { Image } from '#/models/images.model.js';
import type {
	Product,
	ProductRow,
	ProductNoteRow,
	ProductTagRow,
	ProductStock,
	ProductCollectionSummary,
	StockAlertRow,
} from '#/models/products/products.model.js';

type ProductImageJoinRow = Image & { productId: string };
type StockRow = { id: string; stock: number; createdAt: Date };
type CollectionJoinRow = ProductCollectionSummary & { productId: string };

class ProductDAO {
	private readonly tableName = 'products';
	private db = db;

	public async getAll(): Promise<Product[]> {
		const rows = await this.db.instance<ProductRow>(this.tableName)
			.select('*')
			.orderBy('createdAt', 'desc');

		return this.attachRelations(rows);
	}

	public async search(keyword: string): Promise<Product[]> {
		const rows = await this.db.instance<ProductRow>(this.tableName)
			.select('*')
			.whereILike('title', `%${keyword}%`)
			.orderBy('createdAt', 'desc');

		return this.attachRelations(rows);
	}

	public async getByBrandId(brandId: string): Promise<Product[]> {
		const rows = await this.db.instance<ProductRow>(this.tableName)
			.select('*')
			.where('brandId', brandId)
			.orderBy('createdAt', 'desc');

		return this.attachRelations(rows);
	}

	public async getByCollectionId(
		collectionId: string,
	): Promise<Product[]> {
		const rows = await this.db.instance<ProductRow>(this.tableName)
			.select('products.*')
			.join(
				'product_collections',
				'products.id',
				'product_collections.product_id',
			)
			.where('product_collections.collection_id', collectionId)
			.orderBy('products.created_at', 'desc');

		return this.attachRelations(rows);
	}

	public async getById(id: string): Promise<Product | null> {
		const row = await this.db.instance<ProductRow>(this.tableName)
			.select('*')
			.where('id', id)
			.first();

		if (!row) {
			return null;
		}

		const [product] = await this.attachRelations([row]);

		return product;
	}

	public async getBySlug(slug: string): Promise<Product | null> {
		const row = await this.db.instance<ProductRow>(this.tableName)
			.select('*')
			.where('slug', slug)
			.first();

		if (!row) {
			return null;
		}

		const [product] = await this.attachRelations([row]);

		return product;
	}

	public async create(
		product: Partial<ProductRow>,
	): Promise<Product> {
		const data = this.removeUndefined(product);

		const createdId = await this.db.instance.transaction(
			async (trx) => {
				const [created] = await trx<ProductRow>(this.tableName)
					.insert(data)
					.returning('id');

				await trx('product_stocks').insert({
					id: created.id,
					stock: 0,
				});

				return created.id;
			},
		);

		const product_ = await this.getById(createdId);

		return product_ as Product;
	}

	public async update(
		id: string,
		product: Partial<ProductRow>,
	): Promise<Product | null> {
		const data = this.removeUndefined(product);
		delete data.id;
		delete data.createdAt;

		if (Object.keys(data).length > 0) {
			const updated = await this.db.instance<ProductRow>(this.tableName)
				.where('id', id)
				.update(data);

			if (!updated) {
				return null;
			}
		}

		return this.getById(id);
	}

	public async delete(id: string): Promise<Product | null> {
		const product = await this.getById(id);

		if (!product) {
			return null;
		}

		await this.db.instance(this.tableName)
			.where('id', id)
			.del();

		return product;
	}

	public async existsById(id: string): Promise<boolean> {
		const row = await this.db.instance(this.tableName)
			.select('id')
			.where('id', id)
			.first();

		return Boolean(row);
	}

	// ---------- media ----------

	public async addImage(
		productId: string,
		imageId: string,
		sortOrder?: number,
	): Promise<void> {
		const order = sortOrder ?? await this.nextImageOrder(productId);

		await this.db.instance('product_images').insert({
			productId,
			imageId,
			sortOrder: order,
		});
	}

	public async removeImage(
		productId: string,
		imageId: string,
	): Promise<boolean> {
		const deleted = await this.db.instance('product_images')
			.where({ productId, imageId })
			.del();

		return deleted > 0;
	}

	public async reorderImages(
		productId: string,
		imageIds: string[],
	): Promise<void> {
		await this.db.instance.transaction(async (trx) => {
			await trx('product_images')
				.where('productId', productId)
				.del();

			if (imageIds.length === 0) {
				return;
			}

			await trx('product_images').insert(
				imageIds.map((imageId, index) => ({
					productId,
					imageId,
					sortOrder: index + 1,
				})),
			);
		});
	}

	private async nextImageOrder(productId: string): Promise<number> {
		const row = await this.db.instance('product_images')
			.max('sortOrder as maxOrder')
			.where('productId', productId)
			.first<{ maxOrder: number | null }>();

		return (row?.maxOrder ?? 0) + 1;
	}

	// ---------- notes ----------

	public async addNote(
		productId: string,
		content: string,
	): Promise<ProductNoteRow> {
		const [note] = await this.db.instance<ProductNoteRow>('product_notes')
			.insert({ productId, content })
			.returning('*');

		return note;
	}

	public async updateNote(
		noteId: string,
		content: string,
	): Promise<ProductNoteRow | null> {
		const [note] = await this.db.instance<ProductNoteRow>('product_notes')
			.where('id', noteId)
			.update({ content })
			.returning('*');

		return note ?? null;
	}

	public async removeNote(noteId: string): Promise<boolean> {
		const deleted = await this.db.instance('product_notes')
			.where('id', noteId)
			.del();

		return deleted > 0;
	}

	// ---------- tags ----------

	public async addTag(
		productId: string,
		name: string,
	): Promise<ProductTagRow> {
		const [tag] = await this.db.instance<ProductTagRow>('product_tags')
			.insert({ productId, name })
			.returning('*');

		return tag;
	}

	public async updateTag(
		tagId: string,
		name: string,
	): Promise<ProductTagRow | null> {
		const [tag] = await this.db.instance<ProductTagRow>('product_tags')
			.where('id', tagId)
			.update({ name })
			.returning('*');

		return tag ?? null;
	}

	public async removeTag(
		productId: string,
		name: string,
	): Promise<boolean> {
		const deleted = await this.db.instance('product_tags')
			.where({ productId, name })
			.del();

		return deleted > 0;
	}

	// ---------- stock ----------

	public async updateStock(
		productId: string,
		stock: number,
	): Promise<ProductStock | null> {
		const updated = await this.db.instance('product_stocks')
			.where('id', productId)
			.update({ stock });

		if (!updated) {
			return null;
		}

		const stocks = await this.loadStocks([productId]);

		return stocks.get(productId) ?? null;
	}

	public async setAlert(
		productId: string,
		alertType: StockAlertRow['alertType'],
		threshold: number,
	): Promise<StockAlertRow> {
		const [alert] = await this.db.instance<StockAlertRow>('stock_alerts')
			.insert({
				productStockId: productId,
				alertType,
				threshold,
			})
			.onConflict(['product_stock_id', 'alert_type'])
			.merge(['threshold'])
			.returning('*');

		return alert;
	}

	public async removeAlert(
		productId: string,
		alertType: StockAlertRow['alertType'],
	): Promise<boolean> {
		const deleted = await this.db.instance('stock_alerts')
			.where({ productStockId: productId, alertType })
			.del();

		return deleted > 0;
	}

	// ---------- collections ----------

	public async assignToCollection(
		productId: string,
		collectionId: string,
	): Promise<void> {
		await this.db.instance('product_collections')
			.insert({ productId, collectionId })
			.onConflict(['product_id', 'collection_id'])
			.ignore();
	}

	public async removeFromCollection(
		productId: string,
		collectionId: string,
	): Promise<boolean> {
		const deleted = await this.db.instance('product_collections')
			.where({ productId, collectionId })
			.del();

		return deleted > 0;
	}

	public async isSlugTaken(
		slug: string,
		exceptId?: string,
	): Promise<boolean> {
		const query = this.db.instance(this.tableName)
			.select('id')
			.where('slug', slug);

		if (exceptId) {
			query.whereNot('id', exceptId);
		}

		return Boolean(await query.first());
	}

	private async attachRelations(
		rows: ProductRow[],
	): Promise<Product[]> {
		if (rows.length === 0) {
			return [];
		}

		const ids = rows.map((row) => row.id);

		const [media, notes, tags, stocks, collections] = await Promise.all([
			this.loadMedia(ids),
			this.loadNotes(ids),
			this.loadTags(ids),
			this.loadStocks(ids),
			this.loadCollections(ids),
		]);

		return rows.map((row) => ({
			...row,
			media: media.get(row.id) ?? [],
			notes: notes.get(row.id) ?? [],
			tags: tags.get(row.id) ?? [],
			stock: stocks.get(row.id) ?? null,
			collections: collections.get(row.id) ?? [],
		}));
	}

	private async loadCollections(
		productIds: string[],
	): Promise<Map<string, ProductCollectionSummary[]>> {
		const rows = await this.db.instance<CollectionJoinRow>('collections')
			.select(
				'collections.id',
				'collections.name',
				'collections.slug',
				'collections.is_active as isActive',
				'product_collections.product_id as productId',
			)
			.join(
				'product_collections',
				'collections.id',
				'product_collections.collection_id',
			)
			.whereIn('product_collections.product_id', productIds)
			.orderBy('collections.name', 'asc');

		return this.groupBy(rows, 'productId');
	}

	private async loadMedia(
		productIds: string[],
	): Promise<Map<string, Image[]>> {
		const rows = await this.db.instance<ProductImageJoinRow>('images')
			.select(
				'images.*',
				'product_images.product_id as productId',
			)
			.join(
				'product_images',
				'images.id',
				'product_images.image_id',
			)
			.whereIn('product_images.product_id', productIds)
			.orderBy('product_images.sort_order', 'asc');

		return this.groupBy(rows, 'productId');
	}

	private async loadNotes(
		productIds: string[],
	): Promise<Map<string, ProductNoteRow[]>> {
		const rows = await this.db.instance<ProductNoteRow>('product_notes')
			.select('*')
			.whereIn('productId', productIds)
			.orderBy('createdAt', 'asc');

		return this.groupBy(rows, 'productId');
	}

	private async loadTags(
		productIds: string[],
	): Promise<Map<string, ProductTagRow[]>> {
		const rows = await this.db.instance<ProductTagRow>('product_tags')
			.select('*')
			.whereIn('productId', productIds)
			.orderBy('name', 'asc');

		return this.groupBy(rows, 'productId');
	}

	private async loadStocks(
		productIds: string[],
	): Promise<Map<string, ProductStock>> {
		const [stocks, alerts] = await Promise.all([
			this.db.instance<StockRow>('product_stocks')
				.select('*')
				.whereIn('id', productIds),

			this.db.instance<StockAlertRow>('stock_alerts')
				.select('*')
				.whereIn('productStockId', productIds),
		]);

		const alertsByStock = this.groupBy(alerts, 'productStockId');

		return new Map(
			stocks.map((stock) => [
				stock.id,
				{
					...stock,
					alerts: alertsByStock.get(stock.id) ?? [],
				},
			]),
		);
	}

	private groupBy<T, K extends keyof T>(
		rows: T[],
		key: K,
	): Map<string, T[]> {
		const grouped = new Map<string, T[]>();

		for (const row of rows) {
			const groupKey = String(row[key]);
			const bucket = grouped.get(groupKey);

			if (bucket) {
				bucket.push(row);
			} else {
				grouped.set(groupKey, [row]);
			}
		}

		return grouped;
	}

	private removeUndefined(
		product: Partial<ProductRow>,
	): Partial<ProductRow> {
		return Object.fromEntries(
			Object.entries(product).filter(
				([, value]) => value !== undefined,
			),
		);
	}
}

export default new ProductDAO();
