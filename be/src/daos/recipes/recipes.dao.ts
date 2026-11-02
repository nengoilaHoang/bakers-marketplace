import db from '#/db/index.js';
import type { Knex } from 'knex';
import {
  Recipe,
  type RecipeCreate,
  type RecipeUpdate,
  type RecipeCursor,
  type GetRecipesResult
} from '#/models/recipes/recipes.model.js';

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

  public async getRecipes( cursor?: RecipeCursor,): Promise<GetRecipesResult> 
  {
    const query = this.db.instance<Recipe>(this.tableName)
      .select('*')
      .where({
        isPublic: true,
        isSnapshot: false,
      });
      
    if (cursor) {
      query.andWhere((builder) => {
        builder
          .where('createdAt', '<', cursor.createdAt)
          .orWhere((subBuilder) => {
            subBuilder
              .where('createdAt', '=', cursor.createdAt)
              .andWhere('id', '<', cursor.id);
          });
      });
    }

    const data = await query
      .orderBy('createdAt', 'desc')
      .orderBy('id', 'desc')
      .limit(20);

    const recipes = data.map(
      (recipe) => new Recipe(recipe),
    );

    const lastRecipe = data.at(-1);

    return {
      data: recipes,
      cursor: lastRecipe
        ? {
            createdAt: lastRecipe.createdAt,
            id: lastRecipe.id,
          }
        : null,
    };
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

  /**
   * Copies a recipe with its ingredients, tools, steps, notes and tags into a
   * new public snapshot, the one a post is attached to. Returns the snapshot id.
   */
  public async createSnapshot(
    recipeId: string,
    trx: Knex.Transaction,
  ): Promise<string> {
    const result = await trx.raw(
      `INSERT INTO recipes (cover_img_id, user_id, title, description, portion, is_public, is_snapshot)
       SELECT cover_img_id, user_id, title, description, portion, TRUE, TRUE
       FROM recipes
       WHERE id = ?
       RETURNING id`,
      [recipeId],
    );
    const snapshotId: string = result.rows[0].id;

    await trx.raw(
      `INSERT INTO recipe_ingredients (recipe_id, cover_img_id, name, amount, unit)
       SELECT ?, cover_img_id, name, amount, unit FROM recipe_ingredients WHERE recipe_id = ?`,
      [snapshotId, recipeId],
    );
    await trx.raw(
      `INSERT INTO recipe_tools (recipe_id, cover_img_id, name, amount)
       SELECT ?, cover_img_id, name, amount FROM recipe_tools WHERE recipe_id = ?`,
      [snapshotId, recipeId],
    );
    await trx.raw(
      `INSERT INTO recipe_steps (recipe_id, step_order, description)
       SELECT ?, step_order, description FROM recipe_steps WHERE recipe_id = ?`,
      [snapshotId, recipeId],
    );
    await trx.raw(
      `INSERT INTO recipe_notes (recipe_id, note_order, content)
       SELECT ?, note_order, content FROM recipe_notes WHERE recipe_id = ?`,
      [snapshotId, recipeId],
    );
    await trx.raw(
      `INSERT INTO recipe_tags (recipe_id, name)
       SELECT ?, name FROM recipe_tags WHERE recipe_id = ?`,
      [snapshotId, recipeId],
    );

    return snapshotId;
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
