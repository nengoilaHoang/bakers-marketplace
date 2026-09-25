import recipeToolsDAO from '#/daos/recipes/recipe-tools.dao.js';
import type { Knex } from 'knex';
import { RecipeTool, type RecipeToolCreate, type RecipeToolUpdate } from '#/models/recipes/recipe-tools.model.js';

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

  public async getAllByRecipeIds(recipeIds: string[]): Promise<RecipeTool[]> {
    return this.recipeToolDAO.getAllByRecipeIds(recipeIds);
  }

  public async setRecipeTools(
    recipeId: string,
    data: RecipeToolSet,
    trx?: Knex.Transaction,
  ): Promise<RecipeTool[]> {
    const tools = data.create.map((tool) => ({
      ...tool,
      recipeId,
    }));
    const deleted = data.delete.length
      ? await this.recipeToolDAO.delete(data.delete, trx)
      : [];
    const updated = data.update.length
      ? await this.recipeToolDAO.update(data.update, trx)
      : [];
    const created = tools.length
      ? await this.recipeToolDAO.create(tools, trx)
      : [];

    return [...created, ...updated, ...deleted];
  }
}

export default new RecipeToolService();
