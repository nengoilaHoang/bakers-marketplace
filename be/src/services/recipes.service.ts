import recipeDAO from '#/daos/recipes.dao.js';
import {
    Recipe,
    type RecipeCreate,
    type RecipeUpdate,
} from '#/models/recipes.model.js';
import stepsService from '#/services/steps.service.js';
import recipeNotesService from '#/services/recipeNotes.service.js';
import recipeTagsService from '#/services/recipeTags.service.js';
import recipeToolsService from '#/services/recipeTools.service.js';
import recipeIngredientsService from '#/services/recipeIngredients.service.js';

type RecipeWithDetails = Recipe & {
    steps: Awaited<ReturnType<typeof stepsService.getAllByRecipeId>>;
    recipeNotes: Awaited<ReturnType<typeof recipeNotesService.getAllByRecipeId>>;
    recipeTags: Awaited<ReturnType<typeof recipeTagsService.getAllByRecipeId>>;
    recipeTools: Awaited<ReturnType<typeof recipeToolsService.getAllByRecipeId>>;
    recipeIngredients: Awaited<ReturnType<typeof recipeIngredientsService.getAllByRecipeId>>;
};

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
        recipe: RecipeCreate,
    ): Promise<Recipe> {
        return this.recipeDAO.create(userId, recipe);
    }
    
    public async checkRecipeOwner(
        userId: string,
        recipeId: string,
    ): Promise<boolean> {
        return this.recipeDAO.checkRecipeOwner(userId, recipeId);
    }
    
    public async update(
        id: string,
        recipe: RecipeUpdate,
    ): Promise<Recipe | null> {
        const existingRecipe =
        await this.recipeDAO.getById(id);

        if (!existingRecipe) {
        return null;
        }

        return this.recipeDAO.update(
        id,
        recipe,
        );
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