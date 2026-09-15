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
    return this.recipeNoteDAO.create(data);
  }
}

export default new RecipeNoteService();