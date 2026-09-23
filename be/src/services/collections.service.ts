import collectionDAO from '#/daos/collections.dao.js';
import productDAO from '#/daos/products.dao.js';

import { ConflictError } from '#/utils/http-errors.js';

import type {
	Collection,
	CollectionRow,
	CollectionCreateInput,
	CollectionUpdateInput,
} from '#/models/products/collections.model.js';
import type { Product } from '#/models/products/products.model.js';

class CollectionService {
	private collectionDAO = collectionDAO;
	private productDAO = productDAO;

	public async getAll(onlyActive = false): Promise<CollectionRow[]> {
		return this.collectionDAO.getAll(onlyActive);
	}

	public async getById(id: string): Promise<Collection | null> {
		return this.collectionDAO.getById(id);
	}

	public async getBySlug(slug: string): Promise<Collection | null> {
		return this.collectionDAO.getBySlug(slug);
	}

	public async getProducts(collectionId: string): Promise<Product[]> {
		return this.productDAO.getByCollectionId(collectionId);
	}

	public async create(input: CollectionCreateInput): Promise<CollectionRow> {
		if (await this.collectionDAO.isSlugTaken(input.slug)) {
			throw new ConflictError(`Slug "${input.slug}" is already in use`);
		}

		return this.collectionDAO.create(input);
	}

	public async update(
		id: string,
		input: CollectionUpdateInput,
	): Promise<CollectionRow | null> {
		if (!(await this.collectionDAO.existsById(id))) {
			return null;
		}

		if (input.slug && (await this.collectionDAO.isSlugTaken(input.slug, id))) {
			throw new ConflictError(`Slug "${input.slug}" is already in use`);
		}

		return this.collectionDAO.update(id, input);
	}

	public async delete(id: string): Promise<CollectionRow | null> {
		return this.collectionDAO.delete(id);
	}
}

export default new CollectionService();
