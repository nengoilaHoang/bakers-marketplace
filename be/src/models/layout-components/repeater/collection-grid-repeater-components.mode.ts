import { z } from 'zod';
import {
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

export const BaseCollectionGridConfigSchema = z.object({
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
		config: z
			.union([
				InfiniteScrollCollectionGridConfigSchema.partial(),
				PaginationCollectionGridConfigSchema.partial(),
			])
			.optional(),
	});

// Create Schemas

export const CreateCollectionGridSchema =
	CreateBaseRepeaterComponentSchema.extend({
		componentType: z
			.literal(RepeaterComponentTypeSchema.enum.COLLECTION_GRID)
			.readonly(),
		config: CollectionGridConfigSchema,
	});
