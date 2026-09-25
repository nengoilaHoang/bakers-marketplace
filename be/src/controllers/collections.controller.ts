import type { Request, Response } from 'express';

import collectionService from '#/services/collections.service.js';
import asyncHandler from '#/utils/asyncHandler.js';

import {
	CollectionCreateSchema,
	CollectionUpdateSchema,
} from '#/models/products/collections.model.js';

type IdParams = { id: string };
type SlugParams = { slug: string };

class CollectionController {
	private collectionService = collectionService;

	public getAll = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const onlyActive = req.query.active === 'true';

			const collections = await this.collectionService.getAll(
				onlyActive,
			);

			res.status(200).json({ data: collections });
		},
	);

	public getById = asyncHandler(
		async (req: Request<IdParams>, res: Response): Promise<void> => {
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
		},
	);

	public getBySlug = asyncHandler(
		async (req: Request<SlugParams>, res: Response): Promise<void> => {
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
		},
	);

	public getProducts = asyncHandler(
		async (req: Request<IdParams>, res: Response): Promise<void> => {
			const products = await this.collectionService.getProducts(
				req.params.id,
			);

			res.status(200).json({ data: products });
		},
	);

	public create = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const input = CollectionCreateSchema.parse(req.body);

			const collection = await this.collectionService.create(input);

			res.status(201).json({ data: collection });
		},
	);

	public update = asyncHandler(
		async (req: Request<IdParams>, res: Response): Promise<void> => {
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
		},
	);

	public delete = asyncHandler(
		async (req: Request<IdParams>, res: Response): Promise<void> => {
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
		},
	);
}

export default new CollectionController();
