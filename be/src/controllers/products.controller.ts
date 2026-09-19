import type {
	Request,
	Response,
	NextFunction,
} from 'express';

import { z } from 'zod';

import productService from '#/services/products.service.js';

import {
	ProductCreateSchema,
	ProductUpdateSchema,
	StockAlertEnum,
} from '#/models/products/products.model.js';

type IdParams = { id: string };
type SlugParams = { slug: string };
type BrandIdParams = { brandId: string };
type NoteParams = { id: string; noteId: string };
type TagParams = { id: string; tagId: string };
type ProductTagParams = { id: string; name: string };
type CollectionParams = { id: string; collectionId: string };
type ImageParams = { id: string; imageId: string };
type AlertParams = {
	id: string;
	alertType: 'MAXIMUM' | 'REORDER' | 'MINIMUM';
};

const AddImageSchema = z.object({
	imageId: z.uuidv4(),
	sortOrder: z.number().int().positive().optional(),
});

const ReorderImagesSchema = z.object({
	imageIds: z.array(z.uuidv4()),
});

const NoteBodySchema = z.object({
	content: z.string().min(1),
});

const TagBodySchema = z.object({
	name: z.string().min(1).max(100),
});

const StockBodySchema = z.object({
	stock: z.number().int().nonnegative(),
});

const AlertBodySchema = z.object({
	alertType: StockAlertEnum,
	threshold: z.number().int().nonnegative(),
});

const AssignCollectionSchema = z.object({
	collectionId: z.uuidv4(),
});

class ProductController {
	private productService = productService;

	public getAll = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const products = await this.productService.getAll();

			res.status(200).json({ data: products });
		} catch (error) {
			next(error);
		}
	};

	public search = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const keyword = String(req.query.q ?? '');

			const products = await this.productService.search(keyword);

			res.status(200).json({ data: products });
		} catch (error) {
			next(error);
		}
	};

	public getById = async (
		req: Request<IdParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const product = await this.productService.getById(
				req.params.id,
			);

			if (!product) {
				res.status(404).json({ message: 'Product not found' });

				return;
			}

			res.status(200).json({ data: product });
		} catch (error) {
			next(error);
		}
	};

	public getBySlug = async (
		req: Request<SlugParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const product = await this.productService.getBySlug(
				req.params.slug,
			);

			if (!product) {
				res.status(404).json({ message: 'Product not found' });

				return;
			}

			res.status(200).json({ data: product });
		} catch (error) {
			next(error);
		}
	};

	public getByBrandId = async (
		req: Request<BrandIdParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const products = await this.productService.getByBrandId(
				req.params.brandId,
			);

			res.status(200).json({ data: products });
		} catch (error) {
			next(error);
		}
	};

	public create = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const input = ProductCreateSchema.parse(req.body);

			const product = await this.productService.create(input);

			res.status(201).json({ data: product });
		} catch (error) {
			next(error);
		}
	};

	public update = async (
		req: Request<IdParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const input = ProductUpdateSchema.parse(req.body);

			const product = await this.productService.update(
				req.params.id,
				input,
			);

			if (!product) {
				res.status(404).json({ message: 'Product not found' });

				return;
			}

			res.status(200).json({ data: product });
		} catch (error) {
			next(error);
		}
	};

	public delete = async (
		req: Request<IdParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const product = await this.productService.delete(
				req.params.id,
			);

			if (!product) {
				res.status(404).json({ message: 'Product not found' });

				return;
			}

			res.status(200).json({ data: product });
		} catch (error) {
			next(error);
		}
	};

	// ---------- media ----------

	public addImage = async (
		req: Request<IdParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const { imageId, sortOrder } = AddImageSchema.parse(req.body);

			const product = await this.productService.addImage(
				req.params.id,
				imageId,
				sortOrder,
			);

			res.status(201).json({ data: product });
		} catch (error) {
			next(error);
		}
	};

	public reorderImages = async (
		req: Request<IdParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const { imageIds } = ReorderImagesSchema.parse(req.body);

			const product = await this.productService.reorderImages(
				req.params.id,
				imageIds,
			);

			res.status(200).json({ data: product });
		} catch (error) {
			next(error);
		}
	};

	public removeImage = async (
		req: Request<ImageParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const product = await this.productService.removeImage(
				req.params.id,
				req.params.imageId,
			);

			res.status(200).json({ data: product });
		} catch (error) {
			next(error);
		}
	};

	// ---------- notes ----------

	public addNote = async (
		req: Request<IdParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const { content } = NoteBodySchema.parse(req.body);

			const note = await this.productService.addNote(
				req.params.id,
				content,
			);

			res.status(201).json({ data: note });
		} catch (error) {
			next(error);
		}
	};

	public updateNote = async (
		req: Request<NoteParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const { content } = NoteBodySchema.parse(req.body);

			const note = await this.productService.updateNote(
				req.params.noteId,
				content,
			);

			if (!note) {
				res.status(404).json({ message: 'Note not found' });

				return;
			}

			res.status(200).json({ data: note });
		} catch (error) {
			next(error);
		}
	};

	public removeNote = async (
		req: Request<NoteParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const removed = await this.productService.removeNote(
				req.params.noteId,
			);

			if (!removed) {
				res.status(404).json({ message: 'Note not found' });

				return;
			}

			res.status(204).send();
		} catch (error) {
			next(error);
		}
	};

	// ---------- tags ----------

	public addTag = async (
		req: Request<IdParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const { name } = TagBodySchema.parse(req.body);

			const tag = await this.productService.addTag(
				req.params.id,
				name,
			);

			res.status(201).json({ data: tag });
		} catch (error) {
			next(error);
		}
	};

	public updateTag = async (
		req: Request<TagParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const { name } = TagBodySchema.parse(req.body);

			const tag = await this.productService.updateTag(
				req.params.tagId,
				name,
			);

			if (!tag) {
				res.status(404).json({ message: 'Tag not found' });

				return;
			}

			res.status(200).json({ data: tag });
		} catch (error) {
			next(error);
		}
	};

	public removeTag = async (
		req: Request<ProductTagParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const removed = await this.productService.removeTag(
				req.params.id,
				req.params.name,
			);

			if (!removed) {
				res.status(404).json({ message: 'Tag not found' });

				return;
			}

			res.status(204).send();
		} catch (error) {
			next(error);
		}
	};

	// ---------- stock ----------

	public updateStock = async (
		req: Request<IdParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const { stock } = StockBodySchema.parse(req.body);

			const updated = await this.productService.updateStock(
				req.params.id,
				stock,
			);

			res.status(200).json({ data: updated });
		} catch (error) {
			next(error);
		}
	};

	public setAlert = async (
		req: Request<IdParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const { alertType, threshold } = AlertBodySchema.parse(
				req.body,
			);

			const alert = await this.productService.setAlert(
				req.params.id,
				alertType,
				threshold,
			);

			res.status(200).json({ data: alert });
		} catch (error) {
			next(error);
		}
	};

	public removeAlert = async (
		req: Request<AlertParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const removed = await this.productService.removeAlert(
				req.params.id,
				req.params.alertType,
			);

			if (!removed) {
				res.status(404).json({ message: 'Alert not found' });

				return;
			}

			res.status(204).send();
		} catch (error) {
			next(error);
		}
	};

	// ---------- collections ----------

	public assignToCollection = async (
		req: Request<IdParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const { collectionId } = AssignCollectionSchema.parse(
				req.body,
			);

			const product = await this.productService.assignToCollection(
				req.params.id,
				collectionId,
			);

			res.status(201).json({ data: product });
		} catch (error) {
			next(error);
		}
	};

	public removeFromCollection = async (
		req: Request<CollectionParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const product =
				await this.productService.removeFromCollection(
					req.params.id,
					req.params.collectionId,
				);

			res.status(200).json({ data: product });
		} catch (error) {
			next(error);
		}
	};
}

export default new ProductController();
