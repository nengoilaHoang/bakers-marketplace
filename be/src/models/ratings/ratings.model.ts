import { z } from 'zod';
import type { Image } from '#/models/images.model.js';

export const RatingValueSchema = z.number().min(1).max(5);
export const RatingCreateSchema = z.object({
  rating: RatingValueSchema,
  comment: z.string().trim().max(2000).nullable().optional()
    .transform((value) => value === '' ? null : value),
  mediaIds: z.array(z.uuidv4().transform((id) => id.toLowerCase())).max(10)
    .refine((ids) => new Set(ids).size === ids.length, 'Không được lặp ảnh.').optional(),
}).strict();
export type RatingCreate = z.infer<typeof RatingCreateSchema>;
export type RatingUpdate = Partial<RatingCreate>;

export type RatingRater = { id: string; displayName: string };
export type RatingData = {
  id: string;
  rater: RatingRater;
  rating: number;
  comment: string | null;
  ratedAt: Date;
  media: Image[];
  // Editing metadata extends the diagram without changing ratedAt.
  updatedAt: Date;
};

export class Rating implements RatingData {
  id!: string;
  rater!: RatingRater;
  rating!: number;
  comment!: string | null;
  ratedAt!: Date;
  media!: Image[];
  updatedAt!: Date;

  constructor(data: RatingData) { Object.assign(this, data); }
}
