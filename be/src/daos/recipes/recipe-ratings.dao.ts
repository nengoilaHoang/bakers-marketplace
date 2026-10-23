import type { Knex } from 'knex';
import type {
  RecipeRating, RecipeRatingCreate, RecipeRatingUpdate, RecipeRatingCursor, RecipeRatingSummary,
} from '#/models/recipes/recipe-ratings.model.js';

type RatingRow = Omit<RecipeRating, 'author'> & { authorId: string; authorName: string };

class RecipeRatingsDAO {
  public async lockPublicRecipe(trx: Knex.Transaction, recipeId: string, mode: 'read' | 'write') {
    const query = trx('recipes').select('id', 'userId').where({ id: recipeId, isPublic: true });
    return (mode === 'write' ? query.forUpdate() : query.forShare()).first();
  }

  public async getSummary(trx: Knex.Transaction, recipeId: string): Promise<RecipeRatingSummary> {
    const row = await trx('recipe_ratings').where({ recipeId }).select(
      trx.raw('COALESCE(AVG(rating), 0)::float8 AS average'),
      trx.raw('COUNT(*)::int AS count'),
      ...[1, 2, 3, 4, 5].map((star) => trx.raw('COUNT(*) FILTER (WHERE rating = ?)::int AS ??', [star, `s${star}`])),
    ).first();
    return {
      average: Math.round(Number(row?.average ?? 0) * 10) / 10,
      count: Number(row?.count ?? 0),
      distribution: {
        '1': Number(row?.s1 ?? 0), '2': Number(row?.s2 ?? 0), '3': Number(row?.s3 ?? 0),
        '4': Number(row?.s4 ?? 0), '5': Number(row?.s5 ?? 0),
      },
    };
  }

  public async getMyRating(trx: Knex.Transaction, recipeId: string, userId: string): Promise<RecipeRating | null> {
    const row = await this.reviewQuery(trx, recipeId).where('rr.userId', userId).first();
    return row ? this.toReview(row) : null;
  }

  public async getReviews(trx: Knex.Transaction, recipeId: string, limit: number, cursor?: RecipeRatingCursor) {
    const query = this.reviewQuery(trx, recipeId);
    if (cursor) {
      query.andWhere((builder) => {
        builder.where('rr.createdAt', '<', new Date(cursor.createdAt)).orWhere((tied) => {
          tied.where('rr.createdAt', new Date(cursor.createdAt)).andWhere('rr.id', '<', cursor.id);
        });
      });
    }
    const rows = await query.orderBy('rr.createdAt', 'desc').orderBy('rr.id', 'desc').limit(limit + 1);
    const reviews = rows.slice(0, limit).map((row) => this.toReview(row));
    const last = reviews.at(-1);
    const nextCursor = rows.length > limit && last
      ? Buffer.from(JSON.stringify({ createdAt: last.createdAt.toISOString(), id: last.id })).toString('base64url')
      : null;
    return { reviews, nextCursor };
  }

  public async create(trx: Knex.Transaction, recipeId: string, userId: string, data: RecipeRatingCreate): Promise<void> {
    await trx('recipe_ratings').insert({ recipeId, userId, rating: data.rating, comment: data.comment ?? null });
  }

  public async update(trx: Knex.Transaction, recipeId: string, userId: string, data: RecipeRatingUpdate): Promise<number> {
    const changes: Record<string, unknown> = { updatedAt: trx.fn.now() };
    if (data.rating !== undefined) changes.rating = data.rating;
    if (data.comment !== undefined) changes.comment = data.comment;
    return trx('recipe_ratings').where({ recipeId, userId }).update(changes);
  }

  public async delete(trx: Knex.Transaction, recipeId: string, userId: string): Promise<number> {
    return trx('recipe_ratings').where({ recipeId, userId }).delete();
  }

  private reviewQuery(trx: Knex.Transaction, recipeId: string) {
    return trx<RatingRow>('recipe_ratings as rr').join('users as u', 'u.id', 'rr.userId')
      .select('rr.*', { authorId: 'u.id', authorName: 'u.displayname' }).where('rr.recipeId', recipeId);
  }

  private toReview(row: RatingRow): RecipeRating {
    const { authorId, authorName, ...review } = row;
    return { ...review, author: { id: authorId, displayName: authorName } };
  }
}

export default new RecipeRatingsDAO();
