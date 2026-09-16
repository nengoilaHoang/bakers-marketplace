import recipeTagsDAO from '#/daos/recipeTags.dao.js';
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
  ): Promise<RecipeTag[]> {
    const tags = data.create.map((tag) => ({
      ...tag,
      recipeId,
    }));
    const [created, updated, deleted] = await Promise.all([
      tags.length ? this.recipeTagDAO.create(tags) : [],
      data.update.length ? this.recipeTagDAO.update(data.update) : [],
      data.delete.length ? this.recipeTagDAO.delete(data.delete) : [],
    ]);

    return [...created, ...updated, ...deleted];
  }
}

export default new RecipeTagService();