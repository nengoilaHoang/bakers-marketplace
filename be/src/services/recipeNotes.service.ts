import recipeNotesDAO from '#/daos/recipeNotes.dao.js';
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
  ): Promise<RecipeNote[]> {
    const notes = data.create.map((note) => ({
      ...note,
      recipeId,
    }));
    const [created, updated, deleted] = await Promise.all([
      notes.length ? this.recipeNoteDAO.create(notes) : [],
      data.update.length ? this.recipeNoteDAO.update(data.update) : [],
      data.delete.length ? this.recipeNoteDAO.delete(data.delete) : [],
    ]);

    return [...created, ...updated, ...deleted];
  }
}

export default new RecipeNoteService();