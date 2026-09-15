import db from '#/db/index.js';
import {
  RecipeNote,
  type RecipeNoteCreate,
  type RecipeNoteUpdate,
} from '#/models/recipeNotes.model.js';

class RecipeNoteDAO {
  private readonly tableName = 'recipe_notes';
  private db = db;

  public async create(data: RecipeNoteCreate): Promise<RecipeNote> {
    const [created] = await this.db.instance<RecipeNote>(this.tableName)
      .insert(data)
      .returning('*');
    return new RecipeNote(created);
  }

  public async read(id: string): Promise<RecipeNote | null> {
    const data = await this.db.instance<RecipeNote>(this.tableName)
      .where('id', id)
      .first();
    return data ? new RecipeNote(data) : null;
  }

  public async getAllByRecipeId(recipeId: string): Promise<RecipeNote[]> {
    const data = await this.db.instance<RecipeNote>(this.tableName)
      .where('recipeId', recipeId)
      .orderBy('createdAt', 'desc');
    return data.map((note) => new RecipeNote(note));
  }

  public async update(id: string, data: RecipeNoteUpdate): Promise<RecipeNote | null> {
    const updateData = this.removeUndefined(data);
    delete updateData.id;
    delete updateData.recipeId;
    delete updateData.createdAt;
    if (Object.keys(updateData).length === 0) return this.read(id);
    const [updated] = await this.db.instance<RecipeNote>(this.tableName)
      .where('id', id).update(updateData).returning('*');
    return updated ? new RecipeNote(updated) : null;
  }

  public async delete(id: string): Promise<RecipeNote | null> {
    const [deleted] = await this.db.instance<RecipeNote>(this.tableName)
      .where('id', id).del().returning('*');
    return deleted ? new RecipeNote(deleted) : null;
  }

  private removeUndefined(data: RecipeNoteCreate | RecipeNoteUpdate): Partial<RecipeNote> {
    return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
  }
}

export default new RecipeNoteDAO();