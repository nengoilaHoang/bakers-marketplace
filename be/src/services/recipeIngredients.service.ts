import recipeIngredientsDAO from '#/daos/recipeIngredients.dao.js';
import {
  RecipeIngredient,
  type RecipeIngredientCreate,
} from '#/models/recipeIngredients.model.js';

class RecipeIngredientService {
  private recipeIngredientDAO = recipeIngredientsDAO;

  public async getAllByRecipeId(recipeId: string): Promise<RecipeIngredient[]> {
    return this.recipeIngredientDAO.getAllByRecipeId(recipeId);
  }

  public async setRecipeIngredients(
    recipeId: string,
    data: RecipeIngredientCreate[],
  ): Promise<RecipeIngredient[]> {
    await this.recipeIngredientDAO.deleteByRecipeId(recipeId);
    const ingredients = data.map((ingredient) => ({
      ...ingredient,
      recipeId,
    }));
    return this.recipeIngredientDAO.create(ingredients);
  }
}

export default new RecipeIngredientService();