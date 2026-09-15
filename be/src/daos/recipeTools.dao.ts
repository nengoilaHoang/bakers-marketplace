import db from '#/db/index.js';
import {
  RecipeTool,
  type RecipeToolCreate,
  type RecipeToolUpdate,
} from '#/models/recipeTools.model.js';

class RecipeToolDAO {
  private readonly tableName = 'recipe_tools';
  private db = db;

  public async create(data: RecipeToolCreate): Promise<RecipeTool> {
    const [created] = await this.db.instance<RecipeTool>(this.tableName).insert(data).returning('*');
    return new RecipeTool(created);
  }

  public async read(id: string): Promise<RecipeTool | null> {
    const data = await this.db.instance<RecipeTool>(this.tableName).where('id', id).first();
    return data ? new RecipeTool(data) : null;
  }

  public async update(id: string, data: RecipeToolUpdate): Promise<RecipeTool | null> {
    const updateData = this.removeUndefined(data);
    delete updateData.id;
    delete updateData.recipeId;
    delete updateData.createdAt;
    if (Object.keys(updateData).length === 0) return this.read(id);
    const [updated] = await this.db.instance<RecipeTool>(this.tableName)
      .where('id', id).update(updateData).returning('*');
    return updated ? new RecipeTool(updated) : null;
  }

  public async delete(id: string): Promise<RecipeTool | null> {
    const [deleted] = await this.db.instance<RecipeTool>(this.tableName).where('id', id).del().returning('*');
    return deleted ? new RecipeTool(deleted) : null;
  }

  private removeUndefined(data: RecipeToolCreate | RecipeToolUpdate): Partial<RecipeTool> {
    return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
  }
}

export default new RecipeToolDAO();