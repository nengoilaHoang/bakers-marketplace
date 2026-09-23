import db from '#/db/index.js';
import type { Knex } from 'knex';
import {
  RecipeIngredient,
  type RecipeIngredientCreate,
  type RecipeIngredientUpdate,
} from '#/models/recipe-ingredients.model.js';

type RecipeIngredientUpdateItem = RecipeIngredientUpdate & { id: string };

class RecipeIngredientDAO {
  private readonly tableName = 'recipe_ingredients';
  private db = db;

  public async create(data: RecipeIngredientCreate[], trx?: Knex.Transaction): Promise<RecipeIngredient[]> {
    if (trx) {
      const created = await trx<RecipeIngredient>(this.tableName).insert(data).returning('*');
      return created.map((ingredient) => new RecipeIngredient(ingredient));
    }

    return this.db.instance.transaction((transaction) => this.create(data, transaction));
  }

  public async update(data: RecipeIngredientUpdateItem[], trx?: Knex.Transaction): Promise<RecipeIngredient[]> {
    if (trx) {
      const updated = [] as RecipeIngredient[];

      for (const { id, ...changes } of data) {
        const [ingredient] = await trx<RecipeIngredient>(this.tableName)
          .where('id', id)
          .update(changes)
          .returning('*');

        if (ingredient) {
          updated.push(ingredient);
        }
      }

      return updated.map((ingredient) => new RecipeIngredient(ingredient));
    }

    return this.db.instance.transaction((transaction) => this.update(data, transaction));
  }

  public async delete(ids: string[], trx?: Knex.Transaction): Promise<RecipeIngredient[]> {
    if (trx) {
      const deleted = await trx<RecipeIngredient>(this.tableName)
        .whereIn('id', ids)
        .del()
        .returning('*');
      return deleted.map((ingredient) => new RecipeIngredient(ingredient));
    }

    return this.db.instance.transaction((transaction) => this.delete(ids, transaction));
  }

  public async getAllByRecipeId(recipeId: string): Promise<RecipeIngredient[]> {
    const data = await this.db.instance<RecipeIngredient>(this.tableName)
      .where('recipeId', recipeId)
      .orderBy('createdAt', 'desc');
    return data.map((ingredient) => new RecipeIngredient(ingredient));
  }

  public async getAllByRecipeIds(recipeIds: string[]): Promise<RecipeIngredient[]> {
    if (recipeIds.length === 0) {
      return [];
    }

    const data = await this.db.instance<RecipeIngredient>(this.tableName)
      .whereIn('recipeId', recipeIds)
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
