import recipeDAO from '#/daos/recipes.dao.js';
import {
    Recipe,
    type RecipeCreate,
    type RecipeUpdate,
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

    public async create(
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
        const createdRecipe = await this.recipeDAO.create(userId, recipe);
        const recipeId = createdRecipe.id;

        if (!recipeId) {
            return createdRecipe as RecipeWithDetails;
        }

        await Promise.all([
            stepsService.setSteps(recipeId, steps ?? { create: [], update: [], delete: [] }),
            recipeNotesService.setRecipeNotes(recipeId, recipeNotes ?? { create: [], update: [], delete: [] }),
            recipeTagsService.setRecipeTags(recipeId, recipeTags ?? { create: [], update: [], delete: [] }),
            recipeToolsService.setRecipeTools(recipeId, recipeTools ?? { create: [], update: [], delete: [] }),
            recipeIngredientsService.setRecipeIngredients(recipeId, recipeIngredients ?? { create: [], update: [], delete: [] }),
        ]);

        return this.getById(recipeId);
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
        const updatedRecipe = await this.recipeDAO.update(id, recipe);

        if (!updatedRecipe) {
            return null;
        }

        const detailUpdates: Promise<unknown>[] = [];
        if (steps !== undefined) detailUpdates.push(stepsService.setSteps(id, steps));
        if (recipeNotes !== undefined) detailUpdates.push(recipeNotesService.setRecipeNotes(id, recipeNotes));
        if (recipeTags !== undefined) detailUpdates.push(recipeTagsService.setRecipeTags(id, recipeTags));
        if (recipeTools !== undefined) detailUpdates.push(recipeToolsService.setRecipeTools(id, recipeTools));
        if (recipeIngredients !== undefined) detailUpdates.push(recipeIngredientsService.setRecipeIngredients(id, recipeIngredients));

        await Promise.all(detailUpdates);
        return this.getById(id);
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