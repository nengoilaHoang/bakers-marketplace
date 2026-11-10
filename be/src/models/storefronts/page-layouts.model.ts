import { z } from 'zod';
import { CompositeComponentSchema } from '../layout-components/composite/composite-components.model.js';

export const PageLayoutTypeSchema = z.enum([
  'HOME',
  'ABOUT_US',
  'SEARCH',
  'COLLECTION',
  'COLLECTION_LIST',
  'PRODUCT',
  'CUSTOM',
]);

export const PageLayoutSchema = z.object({
  id: z.uuidv4().readonly(),
  name: z.string().trim().min(1).max(255),
  type: PageLayoutTypeSchema,
  root: CompositeComponentSchema.nullable(),
});

export const PageLayoutTableSchema = z.object({
  id: z.uuidv4().readonly(),
  name: z.string().trim().min(1).max(255),
  type: PageLayoutTypeSchema,
  rootComponentId: z.uuidv4().nullable(),
});

export type PageLayout = z.infer<typeof PageLayoutSchema>;
export type PageLayoutRow = z.infer<typeof PageLayoutTableSchema>;
