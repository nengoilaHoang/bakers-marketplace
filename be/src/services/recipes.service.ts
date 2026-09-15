import recipeDAO from '#/daos/recipes.dao.js';
import {
    Recipe,
    type RecipeCreate,
    type RecipeUpdate,
} from '#/models/recipes.model.js';

class RecipeService {
    private recipeDAO = recipeDAO;
    public async getAll(): Promise<Recipe[]> {
        return this.recipeDAO.getAll();
    }

    public async getById(
        id: string,
    ): Promise<Recipe | null> {
        return this.recipeDAO.getById(id);
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