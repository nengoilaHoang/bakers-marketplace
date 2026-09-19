import recipeDAO from '#/daos/recipes.dao.js';
import db from '#/db/index.js';
import {
    Recipe,
    type RecipeCreate,
    type RecipeUpdate,
    type RecipeCursor,
    type GetRecipesResult
} from '#/models/recipes.model.js';
import stepsService from '#/services/recipeSteps.service.js';
import recipeNotesService from '#/services/recipeNotes.service.js';
import recipeTagsService from '#/services/recipeTags.service.js';
import recipeToolsService from '#/services/recipeTools.service.js';
import recipeIngredientsService from '#/services/recipeIngredients.service.js';
import type { StepSet } from '#/services/recipeSteps.service.js';
import type { RecipeNoteSet } from '#/services/recipeNotes.service.js';
import type { RecipeTagSet } from '#/services/recipeTags.service.js';
import type { RecipeToolSet } from '#/services/recipeTools.service.js';
import type { RecipeIngredientSet } from '#/services/recipeIngredients.service.js';

type RecipeWithDetails = Recipe & {
    steps: Awaited<ReturnType<typeof stepsService.getAllByRecipeId>>;
    recipeNotes: Awaited<ReturnType<typeof recipeNotesService.getAllByRecipeId>>;
    recipeTags: Awaited<ReturnType<typeof recipeTagsService.getAllByRecipeId>>;
    recipeTools: Awaited<ReturnType<typeof recipeToolsService.getAllByRecipeId>>;
    recipeIngredients: Awaited<ReturnType<typeof recipeIngredientsService.getAllByRecipeId>>;
};

export type RecipeDetails = {
    steps?: StepSet;
    recipeNotes?: RecipeNoteSet;
    recipeTags?: RecipeTagSet;
    recipeTools?: RecipeToolSet;
    recipeIngredients?: RecipeIngredientSet;
};

export type RecipeCreatePayload = RecipeCreate & RecipeDetails;
export type RecipeUpdatePayload = RecipeUpdate & RecipeDetails;

class RecipeService {
    private recipeDAO = recipeDAO;
    public async getAll(): Promise<Recipe[]> {
        return this.recipeDAO.getAll();
    }

    public async getRecipes(cursor?: RecipeCursor,): Promise<GetRecipesResult> {
        return this.recipeDAO.getRecipes(cursor);
    }

    public async getById(
        id: string,
    ): Promise<RecipeWithDetails | null> {
        const recipe = await this.recipeDAO.getById(id);

        if (!recipe) {
            return null;
        }

        const [steps, recipeNotes, recipeTags, recipeTools, recipeIngredients] =
            await Promise.all([
                stepsService.getAllByRecipeId(id),
                recipeNotesService.getAllByRecipeId(id),
                recipeTagsService.getAllByRecipeId(id),
                recipeToolsService.getAllByRecipeId(id),
                recipeIngredientsService.getAllByRecipeId(id),
            ]);

        return {
            ...recipe,
            steps,
            recipeNotes,
            recipeTags,
            recipeTools,
            recipeIngredients,
        };
    }

    public async getByUserId(
        userId: string,
    ): Promise<Recipe[]> {
        return this.recipeDAO.getByUserId(userId);
    }

    public async set(
        userId: string,
        payload: RecipeCreatePayload,
    ): Promise<RecipeWithDetails | null> {
        const {
            steps,
            recipeNotes,
            recipeTags,
            recipeTools,
            recipeIngredients,
            ...recipe
        } = payload;
        const recipeId = await db.instance.transaction(async (trx) => {
            const createdRecipe = await this.recipeDAO.create(userId, recipe, trx);
            const recipeId = createdRecipe.id;

            if (!recipeId) {
                return null;
            }

            await Promise.all([
                stepsService.setSteps(recipeId, steps ?? { create: [], update: [], delete: [] }, trx),
                recipeNotesService.setRecipeNotes(recipeId, recipeNotes ?? { create: [], update: [], delete: [] }, trx),
                recipeTagsService.setRecipeTags(recipeId, recipeTags ?? { create: [], update: [], delete: [] }, trx),
                recipeToolsService.setRecipeTools(recipeId, recipeTools ?? { create: [], update: [], delete: [] }, trx),
                recipeIngredientsService.setRecipeIngredients(recipeId, recipeIngredients ?? { create: [], update: [], delete: [] }, trx),
            ]);

            return recipeId;
        });

        return recipeId ? this.getById(recipeId) : null;
    }
    
    public async checkRecipeOwner(
        userId: string,
        recipeId: string,
    ): Promise<boolean> {
        return this.recipeDAO.checkRecipeOwner(userId, recipeId);
    }
    
    public async update(
        id: string,
        payload: RecipeUpdatePayload,
    ): Promise<RecipeWithDetails | null> {
        const existingRecipe =
        await this.recipeDAO.getById(id);

        if (!existingRecipe) {
        return null;
        }

        const {
            steps,
            recipeNotes,
            recipeTags,
            recipeTools,
            recipeIngredients,
            ...recipe
        } = payload;
        const updatedRecipe = await db.instance.transaction(async (trx) => {
            const updatedRecipe = await this.recipeDAO.update(id, recipe, trx);

            if (!updatedRecipe) {
                return null;
            }

            if (steps !== undefined) {
                await stepsService.setSteps(id, steps, trx);
            }
            if (recipeNotes !== undefined) {
                await recipeNotesService.setRecipeNotes(id, recipeNotes, trx);
            }
            if (recipeTags !== undefined) {
                await recipeTagsService.setRecipeTags(id, recipeTags, trx);
            }
            if (recipeTools !== undefined) {
                await recipeToolsService.setRecipeTools(id, recipeTools, trx);
            }
            if (recipeIngredients !== undefined) {
                await recipeIngredientsService.setRecipeIngredients(id, recipeIngredients, trx);
            }

            return updatedRecipe;
        });

        return updatedRecipe ? this.getById(id) : null;
    }

    public async delete(
        id: string,
    ): Promise<Recipe | null> {
        const existingRecipe =
        await this.recipeDAO.getById(id);

        if (!existingRecipe) {
        return null;
        }

        return this.recipeDAO.delete(id);
    }
}

export default new RecipeService();