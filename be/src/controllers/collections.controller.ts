import type {
	Request,
	Response,
	NextFunction,
} from 'express';

import collectionService from '#/services/collections.service.js';

import {
	CollectionCreateSchema,
	CollectionUpdateSchema,
} from '#/models/products/collections.model.js';

type IdParams = { id: string };
type SlugParams = { slug: string };

class CollectionController {
	private collectionService = collectionService;

	public getAll = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const onlyActive = req.query.active === 'true';

			const collections = await this.collectionService.getAll(
				onlyActive,
			);

			res.status(200).json({ data: collections });
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
			const collection = await this.collectionService.getById(
				req.params.id,
			);

			if (!collection) {
				res.status(404).json({
					message: 'Collection not found',
				});

				return;
			}

			res.status(200).json({ data: collection });
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
			const collection = await this.collectionService.getBySlug(
				req.params.slug,
			);

			if (!collection) {
				res.status(404).json({
					message: 'Collection not found',
				});

				return;
			}

			res.status(200).json({ data: collection });
		} catch (error) {
			next(error);
		}
	};

	public getProducts = async (
		req: Request<IdParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const products = await this.collectionService.getProducts(
				req.params.id,
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
			const input = CollectionCreateSchema.parse(req.body);

			const collection = await this.collectionService.create(input);

			res.status(201).json({ data: collection });
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
			const input = CollectionUpdateSchema.parse(req.body);

			const collection = await this.collectionService.update(
				req.params.id,
				input,
			);

			if (!collection) {
				res.status(404).json({
					message: 'Collection not found',
				});

				return;
			}

			res.status(200).json({ data: collection });
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
			const collection = await this.collectionService.delete(
				req.params.id,
			);

			if (!collection) {
				res.status(404).json({
					message: 'Collection not found',
				});

				return;
			}

			res.status(200).json({ data: collection });
		} catch (error) {
			next(error);
		}
	};
}

export default new CollectionController();
