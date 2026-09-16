import recipeToolsDAO from '#/daos/recipeTools.dao.js';
import { RecipeTool, type RecipeToolCreate, type RecipeToolUpdate } from '#/models/recipeTools.model.js';

export type RecipeToolSet = {
  create: Omit<RecipeToolCreate, 'recipeId'>[];
  update: (RecipeToolUpdate & { id: string })[];
  delete: string[];
};

class RecipeToolService {
  private recipeToolDAO = recipeToolsDAO;

  public async getAllByRecipeId(recipeId: string): Promise<RecipeTool[]> {
    return this.recipeToolDAO.getAllByRecipeId(recipeId);
  }

  public async setRecipeTools(
    recipeId: string,
    data: RecipeToolSet,
  ): Promise<RecipeTool[]> {
    const tools = data.create.map((tool) => ({
      ...tool,
      recipeId,
    }));
    const [created, updated, deleted] = await Promise.all([
      tools.length ? this.recipeToolDAO.create(tools) : [],
      data.update.length ? this.recipeToolDAO.update(data.update) : [],
      data.delete.length ? this.recipeToolDAO.delete(data.delete) : [],
    ]);

    return [...created, ...updated, ...deleted];
  }
}

export default new RecipeToolService();