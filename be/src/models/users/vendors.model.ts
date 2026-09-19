import { z } from 'zod';
import { UserTableSchema } from './users.model.js';

export const VendorTableSchema = UserTableSchema.extend({
	taxCode: z.string().min(10).max(13),
	registeredAt: z.date().nullable().readonly(),
});

export const VendorSchema = VendorTableSchema;

export type VendorRow = z.infer<typeof VendorTableSchema>;
export type Vendor = z.infer<typeof VendorSchema>;
