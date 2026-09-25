import recipeIngredientsDAO from '#/daos/recipes/recipe-ingredients.dao.js';
import type { Knex } from 'knex';
import {
  RecipeIngredient,
  type RecipeIngredientCreate,
  type RecipeIngredientUpdate,
} from '#/models/recipes/recipe-ingredients.model.js';

export type RecipeIngredientSet = {
  create: Omit<RecipeIngredientCreate, 'recipeId'>[];
  update: (RecipeIngredientUpdate & { id: string })[];
  delete: string[];
};

class RecipeIngredientService {
  private recipeIngredientDAO = recipeIngredientsDAO;

  public async getAllByRecipeId(recipeId: string): Promise<RecipeIngredient[]> {
    return this.recipeIngredientDAO.getAllByRecipeId(recipeId);
  }

  public async getAllByRecipeIds(recipeIds: string[]): Promise<RecipeIngredient[]> {
    return this.recipeIngredientDAO.getAllByRecipeIds(recipeIds);
  }

  public async setRecipeIngredients(
    recipeId: string,
    data: RecipeIngredientSet,
    trx?: Knex.Transaction,
  ): Promise<RecipeIngredient[]> {
    const ingredients = data.create.map((ingredient) => ({
      ...ingredient,
      recipeId,
    }));
    const deleted = data.delete.length
      ? await this.recipeIngredientDAO.delete(data.delete, trx)
      : [];
    const updated = data.update.length
      ? await this.recipeIngredientDAO.update(data.update, trx)
      : [];
    const created = ingredients.length
      ? await this.recipeIngredientDAO.create(ingredients, trx)
      : [];

    return [...created, ...updated, ...deleted];
  }
}

export default new RecipeIngredientService();
