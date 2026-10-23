import db from '#/db/index.js';
import recipeRatingsDAO from '#/daos/recipes/recipe-ratings.dao.js';
import {
  RecipeRatingCursorSchema,
  type RecipeRatingCursor, type RecipeRatingMutation, type RecipeRatingsPage, type RecipeRatingsQuery,
} from '#/models/recipes/recipe-ratings.model.js';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '#/utils/http-errors.js';

class RecipeRatingsService {
  public async getPage(recipeId: string, query: RecipeRatingsQuery, viewerId?: string): Promise<RecipeRatingsPage> {
    let cursor: RecipeRatingCursor | undefined;
    if (query.cursor) {
      try {
        cursor = RecipeRatingCursorSchema.parse(JSON.parse(Buffer.from(query.cursor, 'base64url').toString('utf8')));
      } catch {
        throw new BadRequestError('Cursor đánh giá không hợp lệ.');
      }
    }
    return db.instance.transaction(async (trx) => {
      const recipe = await recipeRatingsDAO.lockPublicRecipe(trx, recipeId, 'read');
      if (!recipe) throw new NotFoundError('Không tìm thấy công thức công khai.');
      const [summary, page, myRating] = await Promise.all([
        recipeRatingsDAO.getSummary(trx, recipeId),
        recipeRatingsDAO.getReviews(trx, recipeId, query.limit, cursor),
        viewerId ? recipeRatingsDAO.getMyRating(trx, recipeId, viewerId) : Promise.resolve(null),
      ]);
      return { summary, myRating, ...page };
    });
  }

  public async mutate(recipeId: string, actorId: string, mutation: RecipeRatingMutation) {
    try {
      return await db.instance.transaction(async (trx) => {
        // Serialize ratings with each other and with public/private recipe updates.
        const recipe = await recipeRatingsDAO.lockPublicRecipe(trx, recipeId, 'write');
        if (!recipe) throw new NotFoundError('Không tìm thấy công thức công khai.');
        if (recipe.userId?.toLowerCase() === actorId.toLowerCase()) {
          throw new ForbiddenError('Bạn không thể tự đánh giá công thức của mình.');
        }
        if (mutation.kind === 'create') {
          await recipeRatingsDAO.create(trx, recipeId, actorId, mutation.data);
        } else {
          const affected = mutation.kind === 'update'
            ? await recipeRatingsDAO.update(trx, recipeId, actorId, mutation.data)
            : await recipeRatingsDAO.delete(trx, recipeId, actorId);
          if (!affected) throw new NotFoundError('Bạn chưa có đánh giá cho công thức này.');
        }
        const [myRating, summary] = await Promise.all([
          recipeRatingsDAO.getMyRating(trx, recipeId, actorId),
          recipeRatingsDAO.getSummary(trx, recipeId),
        ]);
        return { myRating, summary };
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
        throw new ConflictError('Bạn đã đánh giá công thức này. Hãy chỉnh sửa đánh giá hiện có.');
      }
      throw error;
    }
  }
}

export default new RecipeRatingsService();
