import db from '#/db/index.js';
import { Recipe } from '#/models/recipes.model.js';

class RecipeDAO {
  private readonly tableName = 'recipes';
  private db = db;

  public async getAll(): Promise<Recipe[]> {
    const data = await this.db.instance<Recipe>(this.tableName)
      .select('*')
      .orderBy('created_at', 'desc');

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
      .where('user_id', userId)
      .orderBy('created_at', 'desc');

    return data.map(
      (recipe) => new Recipe(recipe),
    );
  }

  public async create(
    recipe: Recipe,
  ): Promise<Recipe> {
    const data = this.removeUndefined(recipe);

    const [createdRecipe] = await this.db.instance<Recipe>(
      this.tableName,
    )
      .insert(data)
      .returning('*');

    return new Recipe(createdRecipe);
  }

  public async update(
    id: string,
    recipe: Recipe,
  ): Promise<Recipe | null> {
    const data = this.removeUndefined(recipe);
    delete data.id;
    delete data.created_at;
    delete data.updated_at;

    if (Object.keys(data).length === 0) {
      return this.getById(id);
    }

    const [updatedRecipe] = await this.db.instance<Recipe>(
      this.tableName,
    )
      .where('id', id)
      .update({
        ...data,
        updated_at: db.instance.fn.now(),
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

  private removeUndefined(
    recipe: Recipe,
  ): Partial<Recipe> {
    return Object.fromEntries(
      Object.entries(recipe).filter(
        ([, value]) => value !== undefined,
      ),
    );
  }
}

export default new RecipeDAO();