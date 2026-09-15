import stepsDAO from '#/daos/steps.dao.js';
import { Step, type StepCreate } from '#/models/steps.model.js';

class StepService {
  private stepDAO = stepsDAO;

  public async getAllByRecipeId(recipeId: string): Promise<Step[]> {
    return this.stepDAO.getAllByRecipeId(recipeId);
  }

  public async setSteps(recipeId: string, data: StepCreate[]): Promise<Step[]> {
    await this.stepDAO.deleteByRecipeId(recipeId);
    return this.stepDAO.create(data);
  }
}

export default new StepService();