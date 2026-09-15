import db from '#/db/index.js';
import {
  RecipeIngredient,
  type RecipeIngredientCreate,
} from '#/models/recipeIngredients.model.js';

class RecipeIngredientDAO {
  private readonly tableName = 'recipe_ingredients';
  private db = db;

  public async create(data: RecipeIngredientCreate[]): Promise<RecipeIngredient[]> {
    const created = await this.db.instance<RecipeIngredient>(this.tableName).insert(data).returning('*');
    return created.map((ingredient) => new RecipeIngredient(ingredient));
  }

  public async getAllByRecipeId(recipeId: string): Promise<RecipeIngredient[]> {
    const data = await this.db.instance<RecipeIngredient>(this.tableName)
      .where('recipeId', recipeId)
      .orderBy('createdAt', 'desc');
    return data.map((ingredient) => new RecipeIngredient(ingredient));
  }

  public async deleteByRecipeId(recipeId: string): Promise<RecipeIngredient[]> {
    const deleted = await this.db.instance<RecipeIngredient>(this.tableName)
      .where('recipeId', recipeId).del().returning('*');
    return deleted.map((ingredient) => new RecipeIngredient(ingredient));
  }
}

export default new RecipeIngredientDAO();