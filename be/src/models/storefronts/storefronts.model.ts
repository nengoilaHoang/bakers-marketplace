import { z } from 'zod';
import { BrandSchema } from './brands.model.js';
import { StorefrontReleaseSchema } from './storefront-releases.model.js';

export const StorefrontTableSchema = z.object({
	id: z.uuidv4().readonly(),
	brandId: z.uuidv4(),
	createdAt: z.date().readonly(),
});

export const StorefrontSchema = z.object({
	id: z.uuidv4().readonly(),
	brand: BrandSchema,
	versions: z.array(StorefrontReleaseSchema),
	createdAt: z.date().readonly(),
});

export type StorefrontRow = z.infer<typeof StorefrontTableSchema>;
export type Storefront = z.infer<typeof StorefrontSchema>;
