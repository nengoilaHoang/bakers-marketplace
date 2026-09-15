import db from '#/db/index.js';
import {
  Step,
  type StepCreate,
} from '#/models/steps.model.js';

class StepDAO {
  private readonly tableName = 'steps';
  private db = db;

  public async create(data: StepCreate[]): Promise<Step[]> {
    const created = await this.db.instance<Step>(this.tableName)
      .insert(data)
      .returning('*');
    return created.map((step) => new Step(step));
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