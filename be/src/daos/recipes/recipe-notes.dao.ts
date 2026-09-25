import db from '#/db/index.js';
import type { Knex } from 'knex';
import {
  RecipeNote,
  type RecipeNoteCreate,
  type RecipeNoteUpdate,
} from '#/models/recipes/recipe-notes.model.js';

type RecipeNoteUpdateItem = RecipeNoteUpdate & { id: string };

class RecipeNoteDAO {
  private readonly tableName = 'recipe_notes';
  private db = db;

  public async create(
    data: RecipeNoteCreate[],
    trx?: Knex.Transaction,
  ): Promise<RecipeNote[]> {
    if (trx) {
      const created = await trx<RecipeNote>(this.tableName)
        .insert(data)
        .returning('*');
      return created.map((note) => new RecipeNote(note));
    }

    return this.db.instance.transaction((transaction) =>
      this.create(data, transaction),
    );
  }

  public async update(
    data: RecipeNoteUpdateItem[],
    trx?: Knex.Transaction,
  ): Promise<RecipeNote[]> {
    if (trx) {
      const updated = [] as RecipeNote[];

      for (const { id, ...changes } of data) {
        const [note] = await trx<RecipeNote>(this.tableName)
          .where('id', id)
          .update(changes)
          .returning('*');

        if (note) {
          updated.push(note);
        }
      }

      return updated.map((note) => new RecipeNote(note));
    }

    return this.db.instance.transaction((transaction) =>
      this.update(data, transaction),
    );
  }

  public async delete(
    ids: string[],
    trx?: Knex.Transaction,
  ): Promise<RecipeNote[]> {
    if (trx) {
      const deleted = await trx<RecipeNote>(this.tableName)
        .whereIn('id', ids)
        .del()
        .returning('*');
      return deleted.map((note) => new RecipeNote(note));
    }

    return this.db.instance.transaction((transaction) =>
      this.delete(ids, transaction),
    );
  }

  public async getAllByRecipeId(recipeId: string): Promise<RecipeNote[]> {
    const data = await this.db.instance<RecipeNote>(this.tableName)
      .where('recipeId', recipeId)
      .orderBy('noteOrder', 'asc');
    return data.map((note) => new RecipeNote(note));
  }

  public async deleteByRecipeId(recipeId: string): Promise<RecipeNote[]> {
    return this.db.instance.transaction(async (trx) => {
      const deleted = await trx<RecipeNote>(this.tableName)
        .where('recipeId', recipeId)
        .del()
        .returning('*');
      return deleted.map((note) => new RecipeNote(note));
    });
  }
}

export default new RecipeNoteDAO();
