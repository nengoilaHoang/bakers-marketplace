import stepsDAO from '#/daos/recipes/recipeSteps.dao.js';
import type { Knex } from 'knex';
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

  public async setSteps(
    recipeId: string,
    data: StepSet,
    trx?: Knex.Transaction,
  ): Promise<Step[]> {
    const steps = data.create.map((step) => ({
      ...step,
      recipeId,
    }));
    const deleted = data.delete.length
      ? await this.stepDAO.delete(data.delete, trx)
      : [];
    const updated = data.update.length
      ? await this.stepDAO.update(data.update, trx)
      : [];
    const created = steps.length
      ? await this.stepDAO.create(steps, trx)
      : [];

    return [...created, ...updated, ...deleted];
  }
}

export default new StepService();
