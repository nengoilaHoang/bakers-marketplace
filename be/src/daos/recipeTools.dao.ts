import db from '#/db/index.js';
import {
  RecipeTool,
  type RecipeToolCreate,
} from '#/models/recipeTools.model.js';

class RecipeToolDAO {
  private readonly tableName = 'recipe_tools';
  private db = db;

  public async create(data: RecipeToolCreate[]): Promise<RecipeTool[]> {
    const created = await this.db.instance<RecipeTool>(this.tableName).insert(data).returning('*');
    return created.map((tool) => new RecipeTool(tool));
  }

  public async getAllByRecipeId(recipeId: string): Promise<RecipeTool[]> {
    const data = await this.db.instance<RecipeTool>(this.tableName)
      .where('recipeId', recipeId)
      .orderBy('createdAt', 'desc');
    return data.map((tool) => new RecipeTool(tool));
  }

  public async deleteByRecipeId(recipeId: string): Promise<RecipeTool[]> {
    const deleted = await this.db.instance<RecipeTool>(this.tableName)
      .where('recipeId', recipeId).del().returning('*');
    return deleted.map((tool) => new RecipeTool(tool));
  }
}

export default new RecipeToolDAO();