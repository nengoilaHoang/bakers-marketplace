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

export const StorefrontReleaseSummarySchema = z.object({
  id: z.uuidv4().readonly(),
  version: z.uint32().min(1),
  displayName: z.string().min(3).max(255),
  storefrontId: z.uuidv4(),
  themeSettings: ThemeSettingsSchema,
  createdAt: z.date().readonly(),
  updatedAt: z.date(),
  isActive: z.boolean(),
});

export const StorefrontReleaseSchema = StorefrontReleaseSummarySchema.extend({
  layouts: z.array(PageLayoutSchema),
});
export type StorefrontReleaseSummary = z.infer<
  typeof StorefrontReleaseSummarySchema
>;

export type StorefrontReleaseRow = z.infer<typeof StorefrontReleaseTableSchema>;
export type StorefrontRelease = z.infer<typeof StorefrontReleaseSchema>;
