import db from '#/db/index.js';
import type { Knex } from 'knex';
import {
  RecipeTool,
  type RecipeToolCreate,
  type RecipeToolUpdate,
} from '#/models/recipe-tools.model.js';

type RecipeToolUpdateItem = RecipeToolUpdate & { id: string };

class RecipeToolDAO {
  private readonly tableName = 'recipe_tools';
  private db = db;

  public async create(data: RecipeToolCreate[], trx?: Knex.Transaction): Promise<RecipeTool[]> {
    if (trx) {
      const created = await trx<RecipeTool>(this.tableName).insert(data).returning('*');
      return created.map((tool) => new RecipeTool(tool));
    }

    return this.db.instance.transaction((transaction) => this.create(data, transaction));
  }

  public async update(data: RecipeToolUpdateItem[], trx?: Knex.Transaction): Promise<RecipeTool[]> {
    if (trx) {
      const updated = [] as RecipeTool[];

      for (const { id, ...changes } of data) {
        const [tool] = await trx<RecipeTool>(this.tableName)
          .where('id', id)
          .update(changes)
          .returning('*');

        if (tool) {
          updated.push(tool);
        }
      }

      return updated.map((tool) => new RecipeTool(tool));
    }

    return this.db.instance.transaction((transaction) => this.update(data, transaction));
  }

  public async delete(ids: string[], trx?: Knex.Transaction): Promise<RecipeTool[]> {
    if (trx) {
      const deleted = await trx<RecipeTool>(this.tableName)
        .whereIn('id', ids)
        .del()
        .returning('*');
      return deleted.map((tool) => new RecipeTool(tool));
    }

    return this.db.instance.transaction((transaction) => this.delete(ids, transaction));
  }

  public async getAllByRecipeId(recipeId: string): Promise<RecipeTool[]> {
    const data = await this.db.instance<RecipeTool>(this.tableName)
      .where('recipeId', recipeId)
      .orderBy('createdAt', 'desc');
    return data.map((tool) => new RecipeTool(tool));
  }

  public async getAllByRecipeIds(recipeIds: string[]): Promise<RecipeTool[]> {
    if (recipeIds.length === 0) {
      return [];
    }

    const data = await this.db.instance<RecipeTool>(this.tableName)
      .whereIn('recipeId', recipeIds)
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
