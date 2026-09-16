import recipeIngredientsDAO from '#/daos/recipeIngredients.dao.js';
import {
  RecipeIngredient,
  type RecipeIngredientCreate,
  type RecipeIngredientUpdate,
} from '#/models/recipeIngredients.model.js';

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

  public async setRecipeIngredients(
    recipeId: string,
    data: RecipeIngredientSet,
  ): Promise<RecipeIngredient[]> {
    const ingredients = data.create.map((ingredient) => ({
      ...ingredient,
      recipeId,
    }));
    const [created, updated, deleted] = await Promise.all([
      ingredients.length ? this.recipeIngredientDAO.create(ingredients) : [],
      data.update.length ? this.recipeIngredientDAO.update(data.update) : [],
      data.delete.length ? this.recipeIngredientDAO.delete(data.delete) : [],
    ]);

    return [...created, ...updated, ...deleted];
  }
}

export default new RecipeIngredientService();