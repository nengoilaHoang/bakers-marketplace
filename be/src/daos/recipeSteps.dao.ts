import db from '#/db/index.js';
import {
  Step,
  type StepCreate,
  type StepUpdate,
} from '#/models/recipeSteps.model.js';

type StepUpdateItem = StepUpdate & { id: string };

class StepDAO {
  private readonly tableName = 'recipe_steps';
  private db = db;

  public async create(data: StepCreate[]): Promise<Step[]> {
    const created = await this.db.instance<Step>(this.tableName)
      .insert(data)
      .returning('*');
    return created.map((step) => new Step(step));
  }

  public async update(data: StepUpdateItem[]): Promise<Step[]> {
    return this.db.instance.transaction(async (trx) => {
      const updated = [] as Step[];

      for (const { id, ...changes } of data) {
        const [step] = await trx<Step>(this.tableName)
          .where('id', id)
          .update(changes)
          .returning('*');

        if (step) {
          updated.push(step);
        }
      }

      return updated.map((step) => new Step(step));
    });
  }

  public async delete(ids: string[]): Promise<Step[]> {
    const deleted = await this.db.instance<Step>(this.tableName)
      .whereIn('id', ids)
      .del()
      .returning('*');
    return deleted.map((step) => new Step(step));
  }

  public async getAllByRecipeId(recipeId: string): Promise<Step[]> {
    const data = await this.db.instance<Step>(this.tableName)
      .where('recipeId', recipeId)
      .orderBy('stepOrder', 'asc');
    return data.map((step) => new Step(step));
  }

  public async deleteByRecipeId(recipeId: string): Promise<Step[]> {
    const deleted = await this.db.instance<Step>(this.tableName)
      .where('recipeId', recipeId)
      .del()
      .returning('*');
    return deleted.map((step) => new Step(step));
  }
}

export default new StepDAO();