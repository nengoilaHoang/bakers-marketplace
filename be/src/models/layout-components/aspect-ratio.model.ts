import { z } from 'zod';

/** Standard editorial aspect ratio tokens */
export const StandardAspectRatioSchema = z.enum([
  'auto',
  '1:1', // Square (Product cards, avatars)
  '4:3', // Classic photo
  '16:9', // Standard widescreen video/hero
  '21:9', // Cinematic ultrawide banner
  '9:16', // Vertical story/shorts
  '4:5', // Social portrait feed
  '3:2', // Standard landscape photo
]);

/** Custom ratio format: e.g. "16/9", "16:9", "2.35:1" */
const CUSTOM_RATIO_REGEX = /^\d+(\.\d+)?\s*[:/]\s*\d+(\.\d+)?$/;

export const CustomAspectRatioSchema = z
  .string()
  .trim()
  .regex(CUSTOM_RATIO_REGEX, {
    message:
      'Aspect ratio must be a recognized token or formatted as "width:height" (e.g. "16:9", "4/5")',
  });

export const AspectRatioValueSchema = z.union([
  StandardAspectRatioSchema,
  CustomAspectRatioSchema,
  z.number().positive(), // Supports decimal float ratios like 1.777
]);

export const MediaFitSchema = z
  .enum(['cover', 'contain', 'fill', 'none', 'scale-down'])
  .default('cover');

export const MediaFocalPointSchema = z
  .object({
    x: z.number().min(0).max(100).default(50), // Percentage (0-100)
    y: z.number().min(0).max(100).default(50),
  })
  .default({ x: 50, y: 50 });

export type AspectRatioValue = z.infer<typeof AspectRatioValueSchema>;
export type MediaFit = z.infer<typeof MediaFitSchema>;
