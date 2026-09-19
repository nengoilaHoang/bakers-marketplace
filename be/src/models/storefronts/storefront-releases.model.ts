import { z } from 'zod';
import { PageLayoutSchema } from './page-layouts.model.js';
import { ThemeSettingsSchema } from './theme-settings.js';

export const StorefrontReleaseTableSchema = z.object({
	id: z.uuidv4().readonly(),
	version: z.uint32().min(1),
	displayName: z.string().min(3).max(255),
	storefrontId: z.uuidv4(),
	createdAt: z.date().readonly(),
	updatedAt: z.date(),
	isActive: z.boolean(),
});

export const StorefrontReleaseSchema = z.object({
	id: z.uuidv4().readonly(),
	version: z.uint32().min(1),
	displayName: z.string().min(3).max(255),
	layouts: z.array(PageLayoutSchema),
	themeSettings: ThemeSettingsSchema,
	createdAt: z.date().readonly(),
	updatedAt: z.date(),
	isActive: z.boolean(),
});

export type StorefrontReleaseRow = z.infer<typeof StorefrontReleaseTableSchema>;
export type StorefrontRelease = z.infer<typeof StorefrontReleaseSchema>;
