import { z } from 'zod';
import { ImageSchema } from '../files/images.model.js';

export const BrandTableSchema = z.object({
  id: z.uuidv4().readonly(),
  name: z.string().min(3).max(100).nullable(),
  vendorId: z.uuidv4().nullable(),
  domain: z.string().max(253).nullable(),
  logo: z.uuidv4().nullable(),
  favicon: z.uuidv4().nullable(),
  createdAt: z.coerce.date().readonly(),
  updatedAt: z.coerce.date(),
});

export const BrandSchema = BrandTableSchema.omit({
  logo: true,
  favicon: true,
}).extend({
  logo: ImageSchema,
  favicon: ImageSchema,
});

export const BrandPublicViewSchema = BrandTableSchema.omit({
  logo: true,
  favicon: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  logoUrl: z.url().nullable(),
  faviconUrl: z.url().nullable(),
});

export type BrandRow = z.infer<typeof BrandTableSchema>;
export type Brand = z.infer<typeof BrandPublicViewSchema>;
export type BrandPublicView = z.infer<typeof BrandPublicViewSchema>;
