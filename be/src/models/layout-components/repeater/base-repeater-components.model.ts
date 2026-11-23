import { z } from 'zod';
import {
	BaseLayoutComponentConfigSchema,
	BaseLayoutComponentSchema,
	ComponentTypeSchema,
	CreateBaseLayoutComponentSchema,
	UpdateBaseLayoutComponentSchema,
} from '../base-layout-components.model.js';
import {
	CreateLayoutComponentSchema,
	LayoutComponentSchema,
	UpdateLayoutComponentSchema,
} from '../layout-components.model.js';

export const RepeaterComponentTypeSchema = z.enum([
  'COLLECTION_GRID',
  'COLLECTION_CAROUSEL',
]);

export const RepeaterComponentTableSchema = z.object({
  id: z.uuidv4().readonly(),
  itemTemplateId: z.uuidv4().nullable(),
  componentType: RepeaterComponentTypeSchema.readonly(),
});

export type RepeaterComponentRow = z.infer<typeof RepeaterComponentTableSchema>;

export const CollectionDataSourceSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('route'),
    mode: z.enum(['route_query', 'related_products']),
  }),
  z.object({
    type: z.literal('preset'),
    preset: z.enum(['best_sellers', 'new_arrivals']),
  }),
  z.object({
    type: z.literal('collection'),
    collectionSlug: z.string().min(1),
  }),
  z.object({
    type: z.literal('query'),
    tag: z.string().optional(),
    minPrice: z.number().nonnegative().optional(),
    maxPrice: z.number().nonnegative().optional(),
    sort: z.enum(['newest', 'price_asc', 'price_desc', 'popular']).optional(),
    inStockOnly: z.boolean().optional(),
  }),
]);

export const BaseRepeaterComponentConfigSchema =
  BaseLayoutComponentConfigSchema.extend({
    dataSource: CollectionDataSourceSchema,
  });

export const BaseRepeaterComponentSchema = BaseLayoutComponentSchema.extend({
  type: z.literal(ComponentTypeSchema.enum.REPEATER).readonly(),
  componentType: RepeaterComponentTypeSchema.readonly(),
  itemTemplate: z.lazy((): z.ZodType => LayoutComponentSchema),
});

const UpdateItemTemplateSchema = z
  .lazy(
    (): z.ZodType =>
      z.union([UpdateLayoutComponentSchema, CreateLayoutComponentSchema]),
  )
  .optional();

export const UpdateBaseRepeaterComponentSchema =
  UpdateBaseLayoutComponentSchema.extend({
    type: z.literal(ComponentTypeSchema.enum.REPEATER).readonly(),
    componentType: RepeaterComponentTypeSchema.readonly(),
    itemTemplate: UpdateItemTemplateSchema,
  });

export const CreateBaseRepeaterComponentSchema =
  CreateBaseLayoutComponentSchema.extend({
    type: z.literal(ComponentTypeSchema.enum.REPEATER).readonly(),
    componentType: RepeaterComponentTypeSchema.readonly(),
    itemTemplate: UpdateItemTemplateSchema,
  });
