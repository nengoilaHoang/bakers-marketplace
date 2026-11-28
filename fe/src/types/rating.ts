import type { RatingImage } from '@/types/media';

export type Rating = {
  id: string;
  rater: { id: string; displayName: string };
  rating: number;
  comment: string | null;
  ratedAt: string;
  updatedAt: string;
  media: RatingImage[];
};
