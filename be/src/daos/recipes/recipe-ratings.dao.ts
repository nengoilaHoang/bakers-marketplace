import type { Knex } from 'knex';
import {
  RecipeRating, type RecipeRatingCreate, type RecipeRatingUpdate, type RecipeRatingCursor, type RecipeRatingSummary,
} from '#/models/recipes/recipe-ratings.model.js';
import ratingDAO from '#/daos/ratings/ratings.dao.js';

type RatingRow = {
  id: string; recipeId: string; raterId: string; raterName: string;
  rating: number; comment: string | null; ratedAt: Date; updatedAt: Date;
};

class RecipeRatingsDAO {
  public async lockPublicRecipe(trx: Knex.Transaction, recipeId: string, mode: 'read' | 'write') {
    const query = trx('recipes').select('id', 'userId').where({ id: recipeId, isPublic: true });
    return (mode === 'write' ? query.forUpdate() : query.forShare()).first();
  }

  public async getSummary(trx: Knex.Transaction, recipeId: string): Promise<RecipeRatingSummary> {
    const row = await trx('recipe_ratings as rr').join('ratings as r', 'r.id', 'rr.id').where('rr.recipeId', recipeId).select(
      trx.raw('COALESCE(AVG(r.rating), 0)::float8 AS average'),
      trx.raw('COUNT(*)::int AS count'),
      // Fractional values use the nearest integer bucket; every review is counted.
      ...[1, 2, 3, 4, 5].map((star) => trx.raw('COUNT(*) FILTER (WHERE floor(r.rating + 0.5) = ?)::int AS ??', [star, `s${star}`])),
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
    const row = await this.reviewQuery(trx, recipeId).where('r.raterId', userId).first();
    return row ? (await this.toReviews(trx, [row]))[0] : null;
  }

  public async getReviews(trx: Knex.Transaction, recipeId: string, limit: number, cursor?: RecipeRatingCursor) {
    const query = this.reviewQuery(trx, recipeId);
    if (cursor) {
      query.andWhere((builder) => {
        builder.where('r.ratedAt', '<', new Date(cursor.ratedAt)).orWhere((tied) => {
          tied.where('r.ratedAt', new Date(cursor.ratedAt)).andWhere('r.id', '<', cursor.id);
        });
      });
    }
    const rows = await query.orderBy('r.ratedAt', 'desc').orderBy('r.id', 'desc').limit(limit + 1);
    const reviews = await this.toReviews(trx, rows.slice(0, limit));
    const last = reviews.at(-1);
    const nextCursor = rows.length > limit && last
      ? Buffer.from(JSON.stringify({ ratedAt: last.ratedAt.toISOString(), id: last.id })).toString('base64url')
      : null;
    return { reviews, nextCursor };
  }

  public async create(trx: Knex.Transaction, recipeId: string, userId: string, data: RecipeRatingCreate): Promise<void> {
    const id = await ratingDAO.create(trx, userId, data);
    await trx('recipe_ratings').insert({ id, recipeId, raterId: userId });
  }

  public async update(trx: Knex.Transaction, recipeId: string, userId: string, data: RecipeRatingUpdate): Promise<number> {
    const row = await trx('recipe_ratings').select('id').where({ recipeId, raterId: userId }).first();
    return row ? ratingDAO.update(trx, row.id, data) : 0;
  }

  public async delete(trx: Knex.Transaction, recipeId: string, userId: string): Promise<number> {
    const row = await trx('recipe_ratings').select('id').where({ recipeId, raterId: userId }).first();
    return row ? ratingDAO.delete(trx, row.id) : 0;
  }

  private reviewQuery(trx: Knex.Transaction, recipeId: string) {
    return trx<RatingRow>('recipe_ratings as rr').join('ratings as r', 'r.id', 'rr.id')
      .join('users as u', 'u.id', 'r.raterId')
      .select('r.*', 'rr.recipeId', { raterName: 'u.displayname' }).where('rr.recipeId', recipeId);
  }

  private async toReviews(trx: Knex.Transaction, rows: RatingRow[]): Promise<RecipeRating[]> {
    const media = await ratingDAO.getMedia(trx, rows.map((row) => row.id));
    return rows.map((row) => new RecipeRating({
      id: row.id, rating: row.rating, comment: row.comment,
      ratedAt: row.ratedAt, updatedAt: row.updatedAt,
      rater: { id: row.raterId, displayName: row.raterName },
      target: { id: row.recipeId }, media: media.get(row.id) ?? [],
    }));
  }
}

export default new RecipeRatingsDAO();
