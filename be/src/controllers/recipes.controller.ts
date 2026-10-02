import type { Request, Response } from 'express';

import asyncHandler from '#/utils/asyncHandler.js';

import recipeService from '#/services/recipes/recipes.service.js';
import stepsService from '#/services/recipes/recipe-steps.service.js';
import type {
	RecipeCreatePayload,
	RecipeUpdatePayload,
} from '#/services/recipes/recipes.service.js';

import {
	RecipeCreateSchema,
	RecipeUpdateSchema,
	type RecipeCursor,
} from '#/models/recipes/recipes.model.js';
import { AuthenticatedRequest } from '#/types/request.types.js';

type RecipeIdParams = {
	id: string;
};
type RecipeUserIdParams = {
	userId: string;
};

class RecipeController {
	private recipeService = recipeService;
	private stepsService = stepsService;
	public getAll = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const recipes = await this.recipeService.getAll();

			res.status(200).json({
				data: recipes,
			});
		},
	);

	public getRecipes = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { createdAt, id } = req.query;
			let recipes;
			if (typeof createdAt !== 'string' || typeof id !== 'string') {
				recipes = await this.recipeService.getRecipes();
			} else {
				const recipeCursor: RecipeCursor = {
					createdAt: new Date(createdAt),
					id,
				};
				recipes = await this.recipeService.getRecipes(recipeCursor);
			}
			res.status(200).json({
				data: recipes,
			});
		},
	);

	public getById = asyncHandler(
		async (
			req: Request<RecipeIdParams>,
			res: Response,
		): Promise<void> => {
			const { id } = req.params;

			const recipe = await recipeService.getById(id);

			if (!recipe) {
				res.status(404).json({
					message: 'Recipe not found',
				});

				return;
			}

			res.status(200).json({
				data: recipe,
			});
		},
	);

	public getByUserId = asyncHandler(
		async (
			req: Request<RecipeUserIdParams>,
			res: Response,
		): Promise<void> => {
			const { userId } = req.params;

			const recipes = await recipeService.getByUserId(userId);

			res.status(200).json({
				data: recipes,
			});
		},
	);

	public getMine = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const recipes = await recipeService.getByUserId(req.user.id);

			res.status(200).json({
				data: recipes,
			});
		},
	);

	public create = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const parsedRecipe = RecipeCreateSchema.parse(req.body);
			const recipe = {
				...parsedRecipe,
				...req.body,
			} as RecipeCreatePayload;
			recipe.isSnapshot = false;
			const createdRecipe = await recipeService.set(req.user.id, recipe);

			res.status(201).json({
				data: createdRecipe,
			});
		},
	);

	public createSnapshot = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const parsedRecipe = RecipeCreateSchema.parse(req.body);
			const recipe = {
				...parsedRecipe,
				...req.body,
			} as RecipeCreatePayload;
			recipe.isSnapshot = true;
			recipe.isPublic = true;
			const createdRecipe = await recipeService.set(req.user.id, recipe);

			res.status(201).json({
				data: createdRecipe,
			});
		},
	);

	public update = asyncHandler(
		async (
			req: AuthenticatedRequest<RecipeIdParams>,
			res: Response,
		): Promise<void> => {
			const parsedRecipe = RecipeUpdateSchema.parse(req.body);
			const recipe = {
				...parsedRecipe,
				...req.body,
			} as RecipeUpdatePayload;
			if (!recipe.id) {
				throw new Error('recipe id is required');
			}
			const isOwner = await this.recipeService.checkRecipeOwner(
				req.user.id,
				recipe.id,
			);
			if (!isOwner) {
				throw new Error('you dont have permission');
			}
			const id: string = recipe.id;
			const updatedRecipe = await recipeService.update(id, recipe);
			if (!updatedRecipe) {
				res.status(404).json({
					message: 'Recipe not found',
				});

				return;
			}
			res.status(200).json({
				data: updatedRecipe,
			});
		},
	);

	public delete = asyncHandler(
		async (
			req: AuthenticatedRequest<RecipeIdParams>,
			res: Response,
		): Promise<void> => {
			const { id } = req.params;
			const isOwner = await this.recipeService.checkRecipeOwner(req.user.id, id);
			if (!isOwner) {
				throw new Error('you dont have permission');
			}
			const deletedRecipe = await recipeService.delete(id);
			if (!deletedRecipe) {
				res.status(404).json({
					message: 'Recipe not found',
				});
				return;
			}
			res.status(200).json({
				data: deletedRecipe,
			});
		},
	);
}

export default new RecipeController();
