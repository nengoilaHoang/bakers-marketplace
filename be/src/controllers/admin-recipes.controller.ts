import type { Response } from 'express';

import { z } from 'zod';

import asyncHandler from '#/utils/asyncHandler.js';

import adminRecipeService from '#/services/admin/admin-recipes.service.js';

import { AdminRecipeQuerySchema } from '#/models/admin/admin.model.js';
import { AuthenticatedRequest } from '#/types/request.types.js';

const RecipeIdParamsSchema = z.object({
	id: z.uuidv4(),
});

class AdminRecipeController {
	private adminRecipeService = adminRecipeService;

	public getPage = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const query = AdminRecipeQuerySchema.parse(req.query);

			const page = await this.adminRecipeService.getPage(query);

			res.status(200).json(page);
		},
	);

	public getById = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = RecipeIdParamsSchema.parse(req.params);

			const recipe = await this.adminRecipeService.getById(id);

			res.status(200).json({ data: recipe });
		},
	);
}

export default new AdminRecipeController();
