import db from '#/db/index.js';
import {
  RecipeIngredient,
  type RecipeIngredientCreate,
  type RecipeIngredientUpdate,
} from '#/models/recipeIngredients.model.js';

class RecipeIngredientDAO {
  private readonly tableName = 'recipe_ingredients';
  private db = db;

  public async create(data: RecipeIngredientCreate): Promise<RecipeIngredient> {
    const [created] = await this.db.instance<RecipeIngredient>(this.tableName).insert(data).returning('*');
    return new RecipeIngredient(created);
  }

  public async read(id: string): Promise<RecipeIngredient | null> {
    const data = await this.db.instance<RecipeIngredient>(this.tableName).where('id', id).first();
    return data ? new RecipeIngredient(data) : null;
  }

  public async update(id: string, data: RecipeIngredientUpdate): Promise<RecipeIngredient | null> {
    const updateData = this.removeUndefined(data);
    delete updateData.id;
    delete updateData.recipeId;
    delete updateData.createdAt;
    if (Object.keys(updateData).length === 0) return this.read(id);
    const [updated] = await this.db.instance<RecipeIngredient>(this.tableName)
      .where('id', id).update(updateData).returning('*');
    return updated ? new RecipeIngredient(updated) : null;
  }

  public async delete(id: string): Promise<RecipeIngredient | null> {
    const [deleted] = await this.db.instance<RecipeIngredient>(this.tableName).where('id', id).del().returning('*');
    return deleted ? new RecipeIngredient(deleted) : null;
  }

  private removeUndefined(data: RecipeIngredientCreate | RecipeIngredientUpdate): Partial<RecipeIngredient> {
    return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
  }
}

export default new RecipeIngredientDAO();