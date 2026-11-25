import { z } from 'zod';
import {
	BoxStyleConfigSchema,
	ResponsiveProp,
} from '../base-layout-components.model.js';
import {
	BaseRepeaterComponentConfigSchema,
	BaseRepeaterComponentSchema,
	CreateBaseRepeaterComponentSchema,
	RepeaterComponentTypeSchema,
	UpdateBaseRepeaterComponentSchema,
} from './base-repeater-components.model.js';

export const CollectionGridLayoutType = z.enum([
  'infinite_scroll',
  'pagination',
]);

// Client side props: mode, paramKey, filters, sortBy
// Automatically conform to a uniform grid
export const CollectionGridDataProvider = z.object({
  sourceType: z.enum(['SEARCH', 'COLLECTION', 'MANUAL']),
  colMax: z.uint32().min(0).max(10),
  colMin: z.uint32().min(0).max(10),
});

export const BaseCollectionGridConfigSchema =
  BaseRepeaterComponentConfigSchema.extend({
    ...BoxStyleConfigSchema.shape,
    cols: ResponsiveProp(z.uint32().min(1).max(12)).default({
      desktop: 4,
      tablet: 2,
      mobile: 1,
    }),
    gap: ResponsiveProp(z.uint32().min(0)).default({
      desktop: 16,
      tablet: 16,
      mobile: 12,
    }),
    layout: CollectionGridLayoutType,
  });

export const InfiniteScrollCollectionGridConfigSchema =
  BaseCollectionGridConfigSchema.extend({
    layout: z.literal(CollectionGridLayoutType.enum.infinite_scroll),
  });

export const PaginationCollectionGridConfigSchema =
  BaseCollectionGridConfigSchema.extend({
    layout: z.literal(CollectionGridLayoutType.enum.pagination),
    pageSize: z.uint32().min(1),
  });

export const CollectionGridConfigSchema = z.discriminatedUnion('layout', [
  InfiniteScrollCollectionGridConfigSchema,
  PaginationCollectionGridConfigSchema,
]);

export const CollectionGridSchema = BaseRepeaterComponentSchema.extend({
  componentType: z
    .literal(RepeaterComponentTypeSchema.enum.COLLECTION_GRID)
    .readonly(),
  config: CollectionGridConfigSchema,
});

// Update Schemas

export const UpdateCollectionGridSchema =
  UpdateBaseRepeaterComponentSchema.extend({
    componentType: z
      .literal(RepeaterComponentTypeSchema.enum.COLLECTION_GRID)
      .readonly(),
    config: CollectionGridConfigSchema.optional(),
  });

// Create Schemas

export const CreateCollectionGridSchema =
  CreateBaseRepeaterComponentSchema.extend({
    componentType: z
      .literal(RepeaterComponentTypeSchema.enum.COLLECTION_GRID)
      .readonly(),
    config: CollectionGridConfigSchema,
  });
