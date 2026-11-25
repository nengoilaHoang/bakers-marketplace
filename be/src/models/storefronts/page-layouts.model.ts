import { z } from 'zod';
import {
	CompositeComponentSchema,
	CreateCompositeComponentSchema,
} from '../layout-components/composite/composite-components.model.js';

export const PageLayoutTypeSchema = z.enum([
  'HOME',
  'ABOUT_US',
  'SEARCH',
  'COLLECTION',
  'COLLECTION_LIST',
  'PRODUCT',
  'CUSTOM',
]);

export const PageLayoutTableSchema = z.object({
  id: z.uuidv4().readonly(),
  storefrontReleaseId: z.uuidv4().readonly(),
  name: z.string().trim().min(1).max(255),
  slug: z.string().trim().min(1).max(255),
  type: PageLayoutTypeSchema.readonly(),
  rootComponentId: z.uuidv4().nullable(),
});

export const PageLayoutSchema = z.object({
  id: z.uuidv4().readonly(),
  name: z.string().trim().min(1).max(255),
  slug: z.string().trim().min(1).max(255),
  type: PageLayoutTypeSchema.readonly(),
  root: CompositeComponentSchema.nullable(),
});

export const PageLayoutSummarySchema = PageLayoutSchema.omit({
  root: true,
});

export const DEFAULT_ROOT_COMPOSITE_COMPONENT: z.output<
  typeof CreateCompositeComponentSchema
> = {
  name: 'Root Grid',
  description: null,
  type: 'COMPOSITE',
  componentType: 'GRID',
  children: [],
  config: {
    w: 'full',
    h: 'auto',
    alignSelfX: 'left',
    alignSelfY: 'top',
    padding: {
      top: 'none',
      bottom: 'none',
      left: 'none',
      right: 'none',
    },
    surfaceTheme: 'default',
    layout: 'UNIFORM',
    cols: {
      desktop: 1,
      tablet: 1,
      mobile: 1,
    },
    rowHeight: {
      desktop: { mode: 'auto', minHeightPx: 120 },
      tablet: { mode: 'auto', minHeightPx: 120 },
      mobile: { mode: 'auto', minHeightPx: 120 },
    },
    densePacking: true,
    gap: {
      desktop: 16,
      tablet: 16,
      mobile: 12,
    },
    borderRadius: undefined,
  },
};

export const CreatePageLayoutSchema = PageLayoutSchema.omit({
  id: true,
  root: true,
}).extend({
  root: CreateCompositeComponentSchema.nullable()
    .optional()
    .transform((val) => val ?? DEFAULT_ROOT_COMPOSITE_COMPONENT),
});

export const InsertPageLayoutRecordSchema = PageLayoutTableSchema.omit({
  id: true,
});

export const UpdatePageLayoutRecordSchema =
  InsertPageLayoutRecordSchema.partial();

export type PageLayout = z.infer<typeof PageLayoutSchema>;
export type PageLayoutSummary = z.infer<typeof PageLayoutSummarySchema>;
export type PageLayoutRow = z.infer<typeof PageLayoutTableSchema>;

export type CreatePageLayout = z.infer<typeof CreatePageLayoutSchema>;
export type InsertPageLayoutRecord = z.infer<
  typeof InsertPageLayoutRecordSchema
>;
export type UpdatePageLayoutRecord = z.infer<
  typeof UpdatePageLayoutRecordSchema
>;
