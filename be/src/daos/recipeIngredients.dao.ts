import db from '#/db/index.js';
import {
  RecipeIngredient,
  type RecipeIngredientCreate,
  type RecipeIngredientUpdate,
} from '#/models/recipeIngredients.model.js';

type RecipeIngredientUpdateItem = RecipeIngredientUpdate & { id: string };

class RecipeIngredientDAO {
  private readonly tableName = 'recipe_ingredients';
  private db = db;

  public async create(data: RecipeIngredientCreate[]): Promise<RecipeIngredient[]> {
    const created = await this.db.instance<RecipeIngredient>(this.tableName).insert(data).returning('*');
    return created.map((ingredient) => new RecipeIngredient(ingredient));
  }

  public async update(data: RecipeIngredientUpdateItem[]): Promise<RecipeIngredient[]> {
    return this.db.instance.transaction(async (trx) => {
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
    });
  }

  public async delete(ids: string[]): Promise<RecipeIngredient[]> {
    const deleted = await this.db.instance<RecipeIngredient>(this.tableName)
      .whereIn('id', ids)
      .del()
      .returning('*');
    return deleted.map((ingredient) => new RecipeIngredient(ingredient));
  }

  public async getAllByRecipeId(recipeId: string): Promise<RecipeIngredient[]> {
    const data = await this.db.instance<RecipeIngredient>(this.tableName)
      .where('recipeId', recipeId)
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