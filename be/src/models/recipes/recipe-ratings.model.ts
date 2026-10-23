import { z } from 'zod';

export const RecipeRatingCreateSchema = z.object({
  rating: z.int().min(1).max(5),
  comment: z.string().trim().max(2000).nullable().optional().transform((value) => value === '' ? null : value),
}).strict();

export const RecipeRatingUpdateSchema = RecipeRatingCreateSchema.partial().refine(
  (value) => Object.values(value).some((field) => field !== undefined),
  { message: 'Cần cung cấp số sao hoặc nhận xét để cập nhật.' },
);

export const RecipeRatingsQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.int().min(1).max(50)).default(10),
  cursor: z.string().min(1).max(512).regex(/^[A-Za-z0-9_-]+$/).optional(),
}).strict();

export const RecipeRatingCursorSchema = z.object({
  createdAt: z.iso.datetime({ offset: true }),
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

export type RecipeRating = {
  id: string;
  recipeId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; displayName: string };
};

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
