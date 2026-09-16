import db from '#/db/index.js';
import type { Knex } from 'knex';
import {
  Recipe,
  type RecipeCreate,
  type RecipeUpdate,
} from '#/models/recipes.model.js';

class RecipeDAO {
  private readonly tableName = 'recipes';
  private db = db;

  public async getAll(): Promise<Recipe[]> {
    const data = await this.db.instance<Recipe>(this.tableName)
      .select('*')
      .where({isPublic: true, isSnapshot: false})
      .orderBy('createdAt', 'desc');
    return data.map(
      (recipe) => new Recipe(recipe),
    );
  }

  public async getById(
    id: string,
  ): Promise<Recipe | null> {
    const data = await this.db.instance<Recipe>(this.tableName)
      .select('*')
      .where('id', id)
      .first();

    if (!data) {
      return null;
    }

    return new Recipe(data);
  }

  public async getByUserId(
    userId: string,
  ): Promise<Recipe[]> {
    const data = await this.db.instance<Recipe>(this.tableName)
      .select('*')
      .where({userId: userId, isSnapshot: false})
      .orderBy('createdAt', 'desc');

    return data.map(
      (recipe) => new Recipe(recipe),
    );
  }

  public async create(
    userId: string,
    recipe: RecipeCreate,
    trx?: Knex.Transaction,
  ): Promise<Recipe> {
    const data = {
      ...this.removeUndefined(recipe),
      userId,
    };

    const query = (trx ?? this.db.instance)<Recipe>(
      this.tableName,
    ).insert(data).returning('*');
    const [createdRecipe] = await query;

    return new Recipe(createdRecipe);
  }

  public async update(
    id: string,
    recipe: RecipeUpdate,
    trx?: Knex.Transaction,
  ): Promise<Recipe | null> {
    const data = this.removeUndefined(recipe);
    delete data.id;
    delete data.createdAt;
    delete data.updatedAt;

    if (Object.keys(data).length === 0) {
      return this.getById(id);
    }

    const [updatedRecipe] = await (trx ?? this.db.instance)<Recipe>(
      this.tableName,
    )
      .where('id', id)
      .update({
        ...data,
        updatedAt: (trx ?? this.db.instance).fn.now(),
      })
      .returning('*');

    if (!updatedRecipe) {
      return null;
    }

    return new Recipe(updatedRecipe);
  }

  public async delete(
    id: string,
  ): Promise<Recipe | null> {
    const [deletedRecipe] = await this.db.instance<Recipe>(
      this.tableName,
    )
      .where('id', id)
      .del()
      .returning('*');

    if (!deletedRecipe) {
      return null;
    }

    return new Recipe(deletedRecipe);
  }

  public async checkRecipeOwner(
    userId:string,
    recipeId: string,
  ): Promise<boolean>{
    return Boolean(
      await this.db.instance<Recipe>(this.tableName)
        .select('id')
        .where({ id: recipeId, userId })
        .first(),
    );
  }

  private removeUndefined(
    recipe: RecipeCreate | RecipeUpdate,
  ): Partial<Recipe> {
    return Object.fromEntries(
      Object.entries(recipe).filter(
        ([, value]) => value !== undefined,
      ),
    );
  }
}

export default new RecipeDAO();