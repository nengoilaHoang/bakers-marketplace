import db from '#/db/index.js';
import type { Knex } from 'knex';
import {
  RecipeTag,
  type RecipeTagCreate,
  type RecipeTagUpdate,
} from '#/models/recipeTags.model.js';

type RecipeTagUpdateItem = RecipeTagUpdate & { id: string };

class RecipeTagDAO {
  private readonly tableName = 'recipe_tags';
  private db = db;

  public async create(data: RecipeTagCreate[], trx?: Knex.Transaction): Promise<RecipeTag[]> {
    if (trx) {
      const created = await trx<RecipeTag>(this.tableName).insert(data).returning('*');
      return created.map((tag) => new RecipeTag(tag));
    }

    return this.db.instance.transaction((transaction) => this.create(data, transaction));
  }

  public async update(data: RecipeTagUpdateItem[], trx?: Knex.Transaction): Promise<RecipeTag[]> {
    if (trx) {
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
    }

    return this.db.instance.transaction((transaction) => this.update(data, transaction));
  }

  public async delete(ids: string[], trx?: Knex.Transaction): Promise<RecipeTag[]> {
    if (trx) {
      const deleted = await trx<RecipeTag>(this.tableName)
        .whereIn('id', ids)
        .del()
        .returning('*');
      return deleted.map((tag) => new RecipeTag(tag));
    }

    return this.db.instance.transaction((transaction) => this.delete(ids, transaction));
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