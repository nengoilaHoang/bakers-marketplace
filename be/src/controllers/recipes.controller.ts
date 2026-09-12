import type {
  Request,
  Response,
  NextFunction,
} from 'express';

import recipeService from '#/services/recipes.service.js';
import { Recipe } from '#/models/recipes.model.js';

type RecipeIdParams = {
  id: string;
};
type RecipeUserIdParams = {
  userId: string;
};

class RecipeController {
    private recipeService = recipeService;
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

        const recipes =
            await recipeService.getByUserId(userId);

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
        const recipe = new Recipe(req.body);

        const createdRecipe =
            await recipeService.create(recipe);

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
        const recipe = new Recipe(req.body);
        console.log(recipe);
        recipe.is_snapshot = true;
        recipe.is_public = true;
        const createdRecipe =
            await recipeService.create(recipe);

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
        const { id } = req.params;

        const recipe = new Recipe(req.body);

        const updatedRecipe =
            await recipeService.update(
            id,
            recipe,
            );

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

        const deletedRecipe =
            await recipeService.delete(id);

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