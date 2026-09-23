import productDAO from '#/daos/products.dao.js';
import collectionDAO from '#/daos/collections.dao.js';

import {
	BadRequestError,
	ConflictError,
	NotFoundError,
} from '#/utils/http-errors.js';

import type {
	Product,
	ProductCreateInput,
	ProductUpdateInput,
	ProductNoteRow,
	ProductTagRow,
	ProductStock,
	StockAlertRow,
} from '#/models/products/products.model.js';

class ProductService {
	private productDAO = productDAO;
	private collectionDAO = collectionDAO;

	public async getAll(): Promise<Product[]> {
		return this.productDAO.getAll();
	}

	public async search(keyword: string): Promise<Product[]> {
		const trimmed = keyword.trim();

		if (!trimmed) {
			throw new BadRequestError('Search keyword is required');
		}

		return this.productDAO.search(trimmed);
	}

	public async getById(id: string): Promise<Product | null> {
		return this.productDAO.getById(id);
	}

	public async getBySlug(slug: string): Promise<Product | null> {
		return this.productDAO.getBySlug(slug);
	}

	public async getByBrandId(brandId: string): Promise<Product[]> {
		return this.productDAO.getByBrandId(brandId);
	}

	public async create(input: ProductCreateInput): Promise<Product> {
		this.assertPriceIsSane(input.unitPrice, input.unitCost);

		if (await this.productDAO.isSlugTaken(input.slug)) {
			throw new ConflictError(`Slug "${input.slug}" is already in use`);
		}

		return this.productDAO.create(input);
	}

	public async update(
		id: string,
		input: ProductUpdateInput,
	): Promise<Product | null> {
		const existing = await this.productDAO.getById(id);

		if (!existing) {
			return null;
		}

		this.assertPriceIsSane(
			input.unitPrice ?? existing.unitPrice,
			input.unitCost ?? existing.unitCost,
		);

		if (input.slug && (await this.productDAO.isSlugTaken(input.slug, id))) {
			throw new ConflictError(`Slug "${input.slug}" is already in use`);
		}

		return this.productDAO.update(id, input);
	}

	public async delete(id: string): Promise<Product | null> {
		return this.productDAO.delete(id);
	}

	// ---------- media ----------

	public async addImage(
		productId: string,
		imageId: string,
		sortOrder?: number,
	): Promise<Product> {
		await this.assertProductExists(productId);
		await this.productDAO.addImage(productId, imageId, sortOrder);

		return this.getExistingProduct(productId);
	}

	public async removeImage(
		productId: string,
		imageId: string,
	): Promise<Product> {
		const removed = await this.productDAO.removeImage(productId, imageId);

		if (!removed) {
			throw new NotFoundError('Image is not attached to this product');
		}

		return this.getExistingProduct(productId);
	}

	public async reorderImages(
		productId: string,
		imageIds: string[],
	): Promise<Product> {
		await this.assertProductExists(productId);

		const unique = new Set(imageIds);

		if (unique.size !== imageIds.length) {
			throw new BadRequestError('Image list contains duplicated ids');
		}

		await this.productDAO.reorderImages(productId, imageIds);

		return this.getExistingProduct(productId);
	}

	// ---------- notes ----------

	public async addNote(
		productId: string,
		content: string,
	): Promise<ProductNoteRow> {
		await this.assertProductExists(productId);

		const trimmed = content.trim();

		if (!trimmed) {
			throw new BadRequestError('Note content is required');
		}

		return this.productDAO.addNote(productId, trimmed);
	}

	public async updateNote(
		noteId: string,
		content: string,
	): Promise<ProductNoteRow | null> {
		const trimmed = content.trim();

		if (!trimmed) {
			throw new BadRequestError('Note content is required');
		}

		return this.productDAO.updateNote(noteId, trimmed);
	}

	public async removeNote(noteId: string): Promise<boolean> {
		return this.productDAO.removeNote(noteId);
	}

	// ---------- tags ----------

	public async addTag(productId: string, name: string): Promise<ProductTagRow> {
		await this.assertProductExists(productId);

		const trimmed = name.trim();

		if (!trimmed) {
			throw new BadRequestError('Tag name is required');
		}

		try {
			return await this.productDAO.addTag(productId, trimmed);
		} catch {
			throw new ConflictError(
				`Tag "${trimmed}" already exists on this product`,
			);
		}
	}

	public async updateTag(
		tagId: string,
		name: string,
	): Promise<ProductTagRow | null> {
		const trimmed = name.trim();

		if (!trimmed) {
			throw new BadRequestError('Tag name is required');
		}

		try {
			return await this.productDAO.updateTag(tagId, trimmed);
		} catch {
			throw new ConflictError(
				`Tag "${trimmed}" already exists on this product`,
			);
		}
	}

	public async removeTag(productId: string, name: string): Promise<boolean> {
		return this.productDAO.removeTag(productId, name);
	}

	// ---------- stock ----------

	public async updateStock(
		productId: string,
		stock: number,
	): Promise<ProductStock> {
		if (!Number.isInteger(stock) || stock < 0) {
			throw new BadRequestError('Stock must be a non-negative integer');
		}

		const updated = await this.productDAO.updateStock(productId, stock);

		if (!updated) {
			throw new NotFoundError('Product stock not found');
		}

		return updated;
	}

	public async setAlert(
		productId: string,
		alertType: StockAlertRow['alertType'],
		threshold: number,
	): Promise<StockAlertRow> {
		await this.assertProductExists(productId);

		if (!Number.isInteger(threshold) || threshold < 0) {
			throw new BadRequestError('Threshold must be a non-negative integer');
		}

		return this.productDAO.setAlert(productId, alertType, threshold);
	}

	public async removeAlert(
		productId: string,
		alertType: StockAlertRow['alertType'],
	): Promise<boolean> {
		return this.productDAO.removeAlert(productId, alertType);
	}

	// ---------- collections ----------

	public async assignToCollection(
		productId: string,
		collectionId: string,
	): Promise<Product> {
		await this.assertProductExists(productId);

		if (!(await this.collectionDAO.existsById(collectionId))) {
			throw new NotFoundError('Collection not found');
		}

		await this.productDAO.assignToCollection(productId, collectionId);

		return this.getExistingProduct(productId);
	}

	public async removeFromCollection(
		productId: string,
		collectionId: string,
	): Promise<Product> {
		const removed = await this.productDAO.removeFromCollection(
			productId,
			collectionId,
		);

		if (!removed) {
			throw new NotFoundError('Product is not in this collection');
		}

		return this.getExistingProduct(productId);
	}

	// ---------- helpers ----------

	private assertPriceIsSane(unitPrice: number, unitCost: number): void {
		if (unitPrice < unitCost) {
			throw new BadRequestError('Unit price must not be lower than unit cost');
		}
	}

	private async assertProductExists(id: string): Promise<void> {
		if (!(await this.productDAO.existsById(id))) {
			throw new NotFoundError('Product not found');
		}
	}

	private async getExistingProduct(id: string): Promise<Product> {
		const product = await this.productDAO.getById(id);

		if (!product) {
			throw new NotFoundError('Product not found');
		}

		return product;
	}
}

export default new ProductService();
