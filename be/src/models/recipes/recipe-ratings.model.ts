import { z } from 'zod';
import { Rating, RatingCreateSchema, type RatingData } from '#/models/ratings/ratings.model.js';

export const RecipeRatingCreateSchema = RatingCreateSchema;

export const RecipeRatingUpdateSchema = RecipeRatingCreateSchema.partial().refine(
  (value) => Object.values(value).some((field) => field !== undefined),
  { message: 'Cần cung cấp số sao hoặc nhận xét để cập nhật.' },
);

export const RecipeRatingsQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.int().min(1).max(50)).default(10),
  cursor: z.string().min(1).max(512).regex(/^[A-Za-z0-9_-]+$/).optional(),
}).strict();

export const RecipeRatingCursorSchema = z.object({
  ratedAt: z.iso.datetime({ offset: true }),
  id: z.uuidv4().transform((value) => value.toLowerCase()),
}).strict();

export type RecipeRatingCreate = z.infer<typeof RecipeRatingCreateSchema>;
export type RecipeRatingUpdate = z.infer<typeof RecipeRatingUpdateSchema>;
export type RecipeRatingCursor = z.infer<typeof RecipeRatingCursorSchema>;
export type RecipeRatingsQuery = z.infer<typeof RecipeRatingsQuerySchema>;
export type RecipeRatingMutation =
  | { kind: 'create'; data: RecipeRatingCreate }
  | { kind: 'update'; data: RecipeRatingUpdate }
  | { kind: 'delete' };

export class RecipeRating extends Rating {
  // Association reference; full recipe details remain a separate API.
  target: { id: string };

  constructor(data: RatingData & { target: { id: string } }) {
    super(data);
    this.target = data.target;
  }
}

export type RecipeRatingSummary = {
  average: number;
  count: number;
  distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
};

export type RecipeRatingsPage = {
  summary: RecipeRatingSummary;
  myRating: RecipeRating | null;
  reviews: RecipeRating[];
  nextCursor: string | null;
};
