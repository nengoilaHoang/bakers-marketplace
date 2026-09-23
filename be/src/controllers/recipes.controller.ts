import type { Request, Response, NextFunction } from 'express';

import recipeService from '#/services/recipes.service.js';
import stepsService from '#/services/recipe-steps.service.js';
import type {
	RecipeCreatePayload,
	RecipeUpdatePayload,
} from '#/services/recipes.service.js';

import {
	RecipeCreateSchema,
	RecipeUpdateSchema,
	type RecipeCursor,
} from '#/models/recipes.model.js';

type RecipeIdParams = {
	id: string;
};
type RecipeUserIdParams = {
	userId: string;
};

const CURRENT_USER_ID = '11111111-1111-4111-8111-111111111111';

class RecipeController {
	private recipeService = recipeService;
	private stepsService = stepsService;
	public getAll = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const recipes = await this.recipeService.getAll();

			res.status(200).json({
				data: recipes,
			});
		} catch (error) {
			next(error);
		}
	};

	public getRecipes = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
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
		} catch (error) {
			next(error);
		}
	};

	public getById = async (
		req: Request<RecipeIdParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
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
		} catch (error) {
			next(error);
		}
	};

	public getByUserId = async (
		req: Request<RecipeUserIdParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const { userId } = req.params;

			const recipes = await recipeService.getByUserId(userId);

			res.status(200).json({
				data: recipes,
			});
		} catch (error) {
			next(error);
		}
	};

	public getMine = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const recipes = await recipeService.getByUserId(CURRENT_USER_ID);

			res.status(200).json({
				data: recipes,
			});
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
			const parsedRecipe = RecipeCreateSchema.parse(req.body);
			const recipe = {
				...parsedRecipe,
				...req.body,
			} as RecipeCreatePayload;
			//hard code userId
			const userId = CURRENT_USER_ID;
			if (!userId) {
				throw new Error('userId is required');
			}
			recipe.isSnapshot = false;
			const createdRecipe = await recipeService.set(userId, recipe);

			res.status(201).json({
				data: createdRecipe,
			});
		} catch (error) {
			next(error);
		}
	};

	public createSnapshot = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const parsedRecipe = RecipeCreateSchema.parse(req.body);
			const recipe = {
				...parsedRecipe,
				...req.body,
			} as RecipeCreatePayload;
			const userId = CURRENT_USER_ID;
			recipe.isSnapshot = true;
			recipe.isPublic = true;
			const createdRecipe = await recipeService.set(userId, recipe);

			res.status(201).json({
				data: createdRecipe,
			});
		} catch (error) {
			next(error);
		}
	};

	public update = async (
		req: Request<RecipeIdParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const parsedRecipe = RecipeUpdateSchema.parse(req.body);
			const recipe = {
				...parsedRecipe,
				...req.body,
			} as RecipeUpdatePayload;
			const userId: string = CURRENT_USER_ID;
			if (!recipe.id) {
				throw new Error('recipe id is required');
			}
			const isOwner = await this.recipeService.checkRecipeOwner(
				userId,
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
		} catch (error) {
			next(error);
		}
	};

	public delete = async (
		req: Request<RecipeIdParams>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const { id } = req.params;
			const userId: string = CURRENT_USER_ID;
			const isOwner = await this.recipeService.checkRecipeOwner(userId, id);
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
		} catch (error) {
			next(error);
		}
	};
}

export default new RecipeController();
