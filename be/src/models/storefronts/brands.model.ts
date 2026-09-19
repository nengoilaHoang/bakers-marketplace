import { z } from 'zod';
import { VendorSchema } from '../users/vendors.model.js';
import { ImageSchema } from '../images.model.js';

export const BrandTableSchema = z.object({
	id: z.uuidv4().readonly(),
	name: z.string().max(3).max(100).nullable(),
	vendorId: z.uuidv4().nullable(),
	logo: z.uuidv4().nullable(),
	favicon: z.uuidv4().nullable(),
	createdAt: z.date().readonly(),
	updatedAt: z.date(),
});

export const BrandSchema = BrandTableSchema.omit({
	vendorId: true,
	logo: true,
	favicon: true,
}).extend({
	vendor: VendorSchema,
	logo: ImageSchema,
	favicon: ImageSchema,
});

export type BrandRow = z.infer<typeof BrandTableSchema>;
export type Brand = z.infer<typeof BrandSchema>;
