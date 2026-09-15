import recipeToolsDAO from '#/daos/recipeTools.dao.js';
import { RecipeTool, type RecipeToolCreate } from '#/models/recipeTools.model.js';

class RecipeToolService {
  private recipeToolDAO = recipeToolsDAO;

  public async getAllByRecipeId(recipeId: string): Promise<RecipeTool[]> {
    return this.recipeToolDAO.getAllByRecipeId(recipeId);
  }

  public async setRecipeTools(
    recipeId: string,
    data: RecipeToolCreate[],
  ): Promise<RecipeTool[]> {
    await this.recipeToolDAO.deleteByRecipeId(recipeId);
    return this.recipeToolDAO.create(data);
  }
}

export default new RecipeToolService();