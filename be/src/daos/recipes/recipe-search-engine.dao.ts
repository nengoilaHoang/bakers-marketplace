import db from '#/db/index.js';
import { Recipe } from '#/models/recipes.model.js';

const MIN_RANK_SCORE = 0.05;

type RecipeSearchRow = Recipe & {
  rankScore: number | string;
};

export type RecipeSearchCandidate = Recipe & {
  id: string;
  rankScore: number;
};

class RecipeSearchEngineDAO {
  private readonly recipesTableName = 'recipes';
  private readonly searchTableName = 'recipe_search';
  private db = db;

  public async search(query: string): Promise<RecipeSearchCandidate[]> {
    const normalizedQuery = query.trim();
    //Empty Query Case
    if (!normalizedQuery) {
      const data = await this.db.instance<RecipeSearchRow>(
        `${this.recipesTableName} as r`,
      )
        .select('r.*')
        .select(this.db.instance.raw('0::real AS rank_score'))
        .where('r.isPublic', true)
        .andWhere('r.isSnapshot', false)
        .orderBy('r.createdAt', 'desc')
        .orderBy('r.id', 'desc')
        .limit(30);

      return data.map((recipe) => this.toSearchCandidate(recipe));
    }

    const data = await this.db.instance<RecipeSearchRow>(
      `${this.recipesTableName} as r`,
    )
      .select('r.*')
      .select(
        this.db.instance.raw(
          'ts_rank(rs.search_vector, recipe_search_query(?)) AS rank_score',
          [normalizedQuery],
        ),
      )
      .innerJoin(
        `${this.searchTableName} as rs`,
        'r.id',
        'rs.recipeId',
      )
      .whereRaw(
        'rs.search_vector @@ recipe_search_query(?)',
        [normalizedQuery],
      )
      .andWhereRaw(
        'ts_rank(rs.search_vector, recipe_search_query(?)) > ?',
        [normalizedQuery, MIN_RANK_SCORE],
      )
      .andWhere('r.isPublic', true)
      .andWhere('r.isSnapshot', false)
      .orderBy('rankScore', 'desc');

    return data.map((recipe) => this.toSearchCandidate(recipe));
  }

  private toSearchCandidate(
    data: RecipeSearchRow,
  ): RecipeSearchCandidate {
    if (!data.id) {
      throw new Error('Search result is missing recipe id');
    }

    return {
      ...new Recipe(data),
      id: data.id,
      rankScore: Number(data.rankScore),
    };
  }
}

export default new RecipeSearchEngineDAO();
