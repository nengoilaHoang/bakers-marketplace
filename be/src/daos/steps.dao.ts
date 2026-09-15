import db from '#/db/index.js';
import {
  Step,
  type StepCreate,
  type StepUpdate,
} from '#/models/steps.model.js';

class StepDAO {
  private readonly tableName = 'steps';
  private db = db;

  public async create(data: StepCreate): Promise<Step> {
    const [created] = await this.db.instance<Step>(this.tableName)
      .insert(data)
      .returning('*');
    return new Step(created);
  }

  public async read(id: string): Promise<Step | null> {
    const data = await this.db.instance<Step>(this.tableName)
      .where('id', id)
      .first();
    return data ? new Step(data) : null;
  }

  public async update(id: string, data: StepUpdate): Promise<Step | null> {
    const updateData = this.removeUndefined(data);

    if (Object.keys(updateData).length === 0) {
      return this.read(id);
    }

    const [updated] = await this.db.instance<Step>(this.tableName)
      .where('id', id)
      .update(updateData)
      .returning('*');
    return updated ? new Step(updated) : null;
  }

  public async delete(id: string): Promise<Step | null> {
    const [deleted] = await this.db.instance<Step>(this.tableName)
      .where('id', id)
      .del()
      .returning('*');
    return deleted ? new Step(deleted) : null;
  }

  private removeUndefined(data: StepCreate | StepUpdate): Partial<Step> {
    return Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    );
  }
}

export default new StepDAO();