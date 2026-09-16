import stepsDAO from '#/daos/recipeSteps.dao.js';
import { Step, type StepCreate, type StepUpdate } from '#/models/recipeSteps.model.js';

export type StepSet = {
  create: StepCreate[];
  update: (StepUpdate & { id: string })[];
  delete: string[];
};

class StepService {
  private stepDAO = stepsDAO;

  public async getAllByRecipeId(recipeId: string): Promise<Step[]> {
    return this.stepDAO.getAllByRecipeId(recipeId);
  }

  public async setSteps(recipeId: string, data: StepSet): Promise<Step[]> {
    const steps = data.create.map((step) => ({
      ...step,
      recipeId,
    }));
    const [created, updated, deleted] = await Promise.all([
      steps.length ? this.stepDAO.create(steps) : [],
      data.update.length ? this.stepDAO.update(data.update) : [],
      data.delete.length ? this.stepDAO.delete(data.delete) : [],
    ]);

    return [...created, ...updated, ...deleted];
  }
}

export default new StepService();