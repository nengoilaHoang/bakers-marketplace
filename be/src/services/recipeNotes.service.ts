import recipeNotesDAO from '#/daos/recipeNotes.dao.js';
import type { Knex } from 'knex';
import { RecipeNote, type RecipeNoteCreate } from '#/models/recipeNotes.model.js';
import type { RecipeNoteUpdate } from '#/models/recipeNotes.model.js';

export type RecipeNoteSet = {
  create: Omit<RecipeNoteCreate, 'recipeId'>[];
  update: (RecipeNoteUpdate & { id: string })[];
  delete: string[];
};

class RecipeNoteService {
  private recipeNoteDAO = recipeNotesDAO;

  public async getAllByRecipeId(recipeId: string): Promise<RecipeNote[]> {
    return this.recipeNoteDAO.getAllByRecipeId(recipeId);
  }

  public async setRecipeNotes(
    recipeId: string,
    data: RecipeNoteSet,
    trx?: Knex.Transaction,
  ): Promise<RecipeNote[]> {
    const notes = data.create.map((note) => ({
      ...note,
      recipeId,
    }));
    const deleted = data.delete.length
      ? await this.recipeNoteDAO.delete(data.delete, trx)
      : [];
    const updated = data.update.length
      ? await this.recipeNoteDAO.update(data.update, trx)
      : [];
    const created = notes.length
      ? await this.recipeNoteDAO.create(notes, trx)
      : [];

    return [...created, ...updated, ...deleted];
  }
}

export default new RecipeNoteService();