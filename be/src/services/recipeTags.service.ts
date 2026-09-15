import recipeTagsDAO from '#/daos/recipeTags.dao.js';
import { RecipeTag, type RecipeTagCreate } from '#/models/recipeTags.model.js';

class RecipeTagService {
  private recipeTagDAO = recipeTagsDAO;

  public async getAllByRecipeId(recipeId: string): Promise<RecipeTag[]> {
    return this.recipeTagDAO.getAllByRecipeId(recipeId);
  }

  public async setRecipeTags(
    recipeId: string,
    data: RecipeTagCreate[],
  ): Promise<RecipeTag[]> {
    await this.recipeTagDAO.deleteByRecipeId(recipeId);
    const tags = data.map((tag) => ({
      ...tag,
      recipeId,
    }));
    return this.recipeTagDAO.create(tags);
  }
}

export default new RecipeTagService();