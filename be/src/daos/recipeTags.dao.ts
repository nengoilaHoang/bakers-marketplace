import db from '#/db/index.js';
import {
  RecipeTag,
  type RecipeTagCreate,
  type RecipeTagUpdate,
} from '#/models/recipeTags.model.js';

class RecipeTagDAO {
  private readonly tableName = 'recipe_tags';
  private db = db;

  public async create(data: RecipeTagCreate): Promise<RecipeTag> {
    const [created] = await this.db.instance<RecipeTag>(this.tableName).insert(data).returning('*');
    return new RecipeTag(created);
  }

  public async read(id: string): Promise<RecipeTag | null> {
    const data = await this.db.instance<RecipeTag>(this.tableName).where('id', id).first();
    return data ? new RecipeTag(data) : null;
  }

  public async update(id: string, data: RecipeTagUpdate): Promise<RecipeTag | null> {
    const updateData = this.removeUndefined(data);
    delete updateData.id;
    delete updateData.recipeId;
    delete updateData.createdAt;
    if (Object.keys(updateData).length === 0) return this.read(id);
    const [updated] = await this.db.instance<RecipeTag>(this.tableName)
      .where('id', id).update(updateData).returning('*');
    return updated ? new RecipeTag(updated) : null;
  }

  public async delete(id: string): Promise<RecipeTag | null> {
    const [deleted] = await this.db.instance<RecipeTag>(this.tableName).where('id', id).del().returning('*');
    return deleted ? new RecipeTag(deleted) : null;
  }

  private removeUndefined(data: RecipeTagCreate | RecipeTagUpdate): Partial<RecipeTag> {
    return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
  }
}

export default new RecipeTagDAO();