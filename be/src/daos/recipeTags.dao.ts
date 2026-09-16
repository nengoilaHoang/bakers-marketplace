import db from '#/db/index.js';
import {
  RecipeTag,
  type RecipeTagCreate,
  type RecipeTagUpdate,
} from '#/models/recipeTags.model.js';

type RecipeTagUpdateItem = RecipeTagUpdate & { id: string };

class RecipeTagDAO {
  private readonly tableName = 'recipe_tags';
  private db = db;

  public async create(data: RecipeTagCreate[]): Promise<RecipeTag[]> {
    const created = await this.db.instance<RecipeTag>(this.tableName).insert(data).returning('*');
    return created.map((tag) => new RecipeTag(tag));
  }

  public async update(data: RecipeTagUpdateItem[]): Promise<RecipeTag[]> {
    return this.db.instance.transaction(async (trx) => {
      const updated = [] as RecipeTag[];

      for (const { id, ...changes } of data) {
        const [tag] = await trx<RecipeTag>(this.tableName)
          .where('id', id)
          .update(changes)
          .returning('*');

        if (tag) {
          updated.push(tag);
        }
      }

      return updated.map((tag) => new RecipeTag(tag));
    });
  }

  public async delete(ids: string[]): Promise<RecipeTag[]> {
    const deleted = await this.db.instance<RecipeTag>(this.tableName)
      .whereIn('id', ids)
      .del()
      .returning('*');
    return deleted.map((tag) => new RecipeTag(tag));
  }

  public async getAllByRecipeId(recipeId: string): Promise<RecipeTag[]> {
    const data = await this.db.instance<RecipeTag>(this.tableName)
      .where('recipeId', recipeId)
      .orderBy('createdAt', 'desc');
    return data.map((tag) => new RecipeTag(tag));
  }

  public async deleteByRecipeId(recipeId: string): Promise<RecipeTag[]> {
    const deleted = await this.db.instance<RecipeTag>(this.tableName)
      .where('recipeId', recipeId).del().returning('*');
    return deleted.map((tag) => new RecipeTag(tag));
  }
}

export default new RecipeTagDAO();