import db from '#/db/index.js';
import {
  RecipeNote,
  type RecipeNoteCreate,
} from '#/models/recipeNotes.model.js';

class RecipeNoteDAO {
  private readonly tableName = 'recipe_notes';
  private db = db;

  public async create(data: RecipeNoteCreate[]): Promise<RecipeNote[]> {
    const created = await this.db.instance<RecipeNote>(this.tableName)
      .insert(data)
      .returning('*');
    return created.map((note) => new RecipeNote(note));
  }

  public async getAllByRecipeId(recipeId: string): Promise<RecipeNote[]> {
    const data = await this.db.instance<RecipeNote>(this.tableName)
      .where('recipeId', recipeId)
      .orderBy('createdAt', 'desc');
    return data.map((note) => new RecipeNote(note));
  }

  public async deleteByRecipeId(recipeId: string): Promise<RecipeNote[]> {
    const deleted = await this.db.instance<RecipeNote>(this.tableName)
      .where('recipeId', recipeId).del().returning('*');
    return deleted.map((note) => new RecipeNote(note));
  }
}

export default new RecipeNoteDAO();