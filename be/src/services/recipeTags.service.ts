import recipeTagsDAO from '#/daos/recipeTags.dao.js';
import type { Knex } from 'knex';
import { RecipeTag, type RecipeTagCreate, type RecipeTagUpdate } from '#/models/recipeTags.model.js';

export type RecipeTagSet = {
  create: Omit<RecipeTagCreate, 'recipeId'>[];
  update: (RecipeTagUpdate & { id: string })[];
  delete: string[];
};

class RecipeTagService {
  private recipeTagDAO = recipeTagsDAO;

  public async getAllByRecipeId(recipeId: string): Promise<RecipeTag[]> {
    return this.recipeTagDAO.getAllByRecipeId(recipeId);
  }

  public async setRecipeTags(
    recipeId: string,
    data: RecipeTagSet,
    trx?: Knex.Transaction,
  ): Promise<RecipeTag[]> {
    const tags = data.create.map((tag) => ({
      ...tag,
      recipeId,
    }));
    const deleted = data.delete.length
      ? await this.recipeTagDAO.delete(data.delete, trx)
      : [];
    const updated = data.update.length
      ? await this.recipeTagDAO.update(data.update, trx)
      : [];
    const created = tags.length
      ? await this.recipeTagDAO.create(tags, trx)
      : [];

    return [...created, ...updated, ...deleted];
  }
}

export default new RecipeTagService();