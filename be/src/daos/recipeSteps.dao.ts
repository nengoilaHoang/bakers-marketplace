import db from '#/db/index.js';
import type { Knex } from 'knex';
import {
  Step,
  type StepCreate,
  type StepUpdate,
} from '#/models/recipeSteps.model.js';

type StepUpdateItem = StepUpdate & { id: string };

class StepDAO {
  private readonly tableName = 'recipe_steps';
  private db = db;

  public async create(
    data: StepCreate[],
    trx?: Knex.Transaction,
  ): Promise<Step[]> {
    if (trx) {
      const created = await trx<Step>(this.tableName)
        .insert(data)
        .returning('*');
      return created.map((step) => new Step(step));
    }

    return this.db.instance.transaction((transaction) =>
      this.create(data, transaction),
    );
  }

  public async update(
    data: StepUpdateItem[],
    trx?: Knex.Transaction,
  ): Promise<Step[]> {
    if (trx) {
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
    }

    return this.db.instance.transaction((transaction) =>
      this.update(data, transaction),
    );
  }

  public async delete(
    ids: string[],
    trx?: Knex.Transaction,
  ): Promise<Step[]> {
    if (trx) {
      const deleted = await trx<Step>(this.tableName)
        .whereIn('id', ids)
        .del()
        .returning('*');
      return deleted.map((step) => new Step(step));
    }

    return this.db.instance.transaction((transaction) =>
      this.delete(ids, transaction),
    );
  }

  public async getAllByRecipeId(recipeId: string): Promise<Step[]> {
    const data = await this.db.instance<Step>(this.tableName)
      .where('recipeId', recipeId)
      .orderBy('stepOrder', 'asc');
    return data.map((step) => new Step(step));
  }

  public async deleteByRecipeId(recipeId: string): Promise<Step[]> {
    return this.db.instance.transaction(async (trx) => {
      const deleted = await trx<Step>(this.tableName)
        .where('recipeId', recipeId)
        .del()
        .returning('*');
      return deleted.map((step) => new Step(step));
    });
  }
}

export default new StepDAO();