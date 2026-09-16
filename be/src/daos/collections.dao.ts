import db from '#/db/index.js';
import type {
	Collection,
	CollectionRow,
} from '#/models/products/collections.model.js';

import productDAO from '#/daos/products.dao.js';

class CollectionDAO {
	private readonly tableName = 'collections';
	private db = db;

	public async getAll(
		onlyActive = false,
	): Promise<CollectionRow[]> {
		const query = this.db.instance<CollectionRow>(this.tableName)
			.select('*')
			.orderBy('createdAt', 'desc');

		if (onlyActive) {
			query.where('isActive', true);
		}

		return query;
	}

	public async getById(id: string): Promise<Collection | null> {
		const row = await this.db.instance<CollectionRow>(this.tableName)
			.select('*')
			.where('id', id)
			.first();

		if (!row) {
			return null;
		}

		return {
			...row,
			products: await productDAO.getByCollectionId(row.id),
		};
	}

	public async getBySlug(slug: string): Promise<Collection | null> {
		const row = await this.db.instance<CollectionRow>(this.tableName)
			.select('*')
			.where('slug', slug)
			.first();

		if (!row) {
			return null;
		}

		return {
			...row,
			products: await productDAO.getByCollectionId(row.id),
		};
	}

	public async create(
		collection: Partial<CollectionRow>,
	): Promise<CollectionRow> {
		const data = this.removeUndefined(collection);

		const [created] = await this.db.instance<CollectionRow>(this.tableName)
			.insert(data)
			.returning('*');

		return created;
	}

	public async update(
		id: string,
		collection: Partial<CollectionRow>,
	): Promise<CollectionRow | null> {
		const data = this.removeUndefined(collection);
		delete data.id;
		delete data.createdAt;

		if (Object.keys(data).length === 0) {
			return this.getRowById(id);
		}

		const [updated] = await this.db.instance<CollectionRow>(this.tableName)
			.where('id', id)
			.update(data)
			.returning('*');

		return updated ?? null;
	}

	public async delete(id: string): Promise<CollectionRow | null> {
		const [deleted] = await this.db.instance<CollectionRow>(this.tableName)
			.where('id', id)
			.del()
			.returning('*');

		return deleted ?? null;
	}

	public async existsById(id: string): Promise<boolean> {
		return Boolean(await this.getRowById(id));
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

	private async getRowById(
		id: string,
	): Promise<CollectionRow | null> {
		const row = await this.db.instance<CollectionRow>(this.tableName)
			.select('*')
			.where('id', id)
			.first();

		return row ?? null;
	}

	private removeUndefined(
		collection: Partial<CollectionRow>,
	): Partial<CollectionRow> {
		return Object.fromEntries(
			Object.entries(collection).filter(
				([, value]) => value !== undefined,
			),
		);
	}
}

export default new CollectionDAO();
