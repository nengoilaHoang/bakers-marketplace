import recipeNotesDAO from '#/daos/recipeNotes.dao.js';
import { RecipeNote, type RecipeNoteCreate } from '#/models/recipeNotes.model.js';

class RecipeNoteService {
  private recipeNoteDAO = recipeNotesDAO;

  public async getAllByRecipeId(recipeId: string): Promise<RecipeNote[]> {
    return this.recipeNoteDAO.getAllByRecipeId(recipeId);
  }

  public async setRecipeNotes(
    recipeId: string,
    data: RecipeNoteCreate[],
  ): Promise<RecipeNote[]> {
    await this.recipeNoteDAO.deleteByRecipeId(recipeId);
    const notes = data.map((note) => ({
      ...note,
      recipeId,
    }));
    return this.recipeNoteDAO.create(notes);
  }
}

export default new RecipeNoteService();