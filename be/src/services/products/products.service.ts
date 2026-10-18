import type { Knex } from 'knex';

import db from '#/db/index.js';
import productDAO, { type LockedStock } from '#/daos/products/products.dao.js';
import collectionDAO from '#/daos/products/collections.dao.js';

import {
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
} from '#/utils/http-errors.js';
import { getThresholdOrderError } from '#/utils/stock-alerts.js';

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

	public async getByVendorId(vendorId: string): Promise<Product[]> {
		return this.productDAO.getByVendorId(vendorId);
	}

	public async updateStock(
		vendorId: string,
		productId: string,
		stock: number,
	): Promise<ProductStock> {
		return this.changeStock(vendorId, productId, () => stock);
	}

	public async adjustStock(
		vendorId: string,
		productId: string,
		delta: number,
	): Promise<ProductStock> {
		return this.changeStock(vendorId, productId, (stock) => stock + delta);
	}

	/** Sets or changes a threshold, keeping MINIMUM < REORDER < MAXIMUM. */
	public async setAlert(
		vendorId: string,
		productId: string,
		alertType: StockAlertRow['alertType'],
		threshold: number,
	): Promise<StockAlertRow> {
		if (!Number.isInteger(threshold) || threshold < 0) {
			throw new BadRequestError('Threshold must be a non-negative integer');
		}

		return db.instance.transaction(async (trx) => {
			const current = await this.lockOwnStock(vendorId, productId, trx);
			const orderError = getThresholdOrderError([
				...current.alerts.filter((alert) => alert.alertType !== alertType),
				{ alertType, threshold },
			]);

			if (orderError) {
				throw new BadRequestError(orderError);
			}

			return this.productDAO.setAlert(productId, alertType, threshold, trx);
		});
	}

	public async removeAlert(
		vendorId: string,
		productId: string,
		alertType: StockAlertRow['alertType'],
	): Promise<boolean> {
		await this.assertProductOwner(vendorId, productId);

		return this.productDAO.removeAlert(productId, alertType);
	}

	/** Locks the stock so concurrent adjustments are applied one after another. */
	private async changeStock(
		vendorId: string,
		productId: string,
		getNextStock: (stock: number) => number,
	): Promise<ProductStock> {
		await db.instance.transaction(async (trx) => {
			const current = await this.lockOwnStock(vendorId, productId, trx);
			const nextStock = getNextStock(current.stock);

			if (!Number.isInteger(nextStock) || nextStock < 0) {
				throw new BadRequestError('Stock must be a non-negative integer');
			}

			await this.productDAO.updateStock(productId, nextStock, trx);
		});

		const stock = await this.productDAO.getStock(productId);

		if (!stock) {
			throw new NotFoundError('Product stock not found');
		}

		return stock;
	}

	private async lockOwnStock(
		vendorId: string,
		productId: string,
		trx: Knex.Transaction,
	): Promise<LockedStock> {
		const current = await this.productDAO.lockStock(productId, trx);

		if (!current) {
			throw new NotFoundError('Product stock not found');
		}

		if (current.vendorId !== vendorId) {
			throw new ForbiddenError('You do not have permission to manage this product');
		}

		return current;
	}

	private async assertProductOwner(
		vendorId: string,
		productId: string,
	): Promise<void> {
		const ownerId = await this.productDAO.getVendorId(productId);

		if (ownerId === undefined) {
			throw new NotFoundError('Product not found');
		}

		if (ownerId !== vendorId) {
			throw new ForbiddenError('You do not have permission to manage this product');
		}
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
