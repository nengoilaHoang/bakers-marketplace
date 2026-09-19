import { z } from 'zod';
import {
	BaseCompositeComponentSchema,
	CompositeComponentTypeSchema,
	CreateBaseCompositeComponentSchema,
	UpdateBaseCompositeComponentSchema,
} from './base-composite-components.model.js';
import { BaseLayoutComponentConfigSchema } from '../base-layout-components.model.js';

export const GridLayoutTypeSchema = z.enum(['UNIFORM', 'BENTO']);

// The start position of each cell is counted linearly from left to right, downwards.
export const BaseGridConfigSchema = BaseLayoutComponentConfigSchema.extend({
	layout: GridLayoutTypeSchema,
	rows: z.uint32().min(1).max(50),
	cols: z.uint32().min(1).max(50),
	gap: z.uint32().min(0), // in px
	borderRadius: z.union([
		z.undefined(),
		z.uint32(), // in px
		z.string().regex(/^\d+(\.\d+)?%/), // in %
	]),
});

export const UniformGridConfigSchema = BaseGridConfigSchema.extend({
	layout: z.literal(GridLayoutTypeSchema.enum.UNIFORM),
});

export const BentoGridConfigSchema = BaseGridConfigSchema.extend({
	layout: z.literal(GridLayoutTypeSchema.enum.BENTO),
});

export const GridConfigSchema = z.discriminatedUnion('layout', [
	UniformGridConfigSchema,
	BentoGridConfigSchema,
]);

export const GridCompositeComponentSchema = BaseCompositeComponentSchema.extend(
	{
		componentType: z.literal(CompositeComponentTypeSchema.enum.GRID).readonly(),
		config: GridConfigSchema,
	},
);

// Update Schemas

export const UpdateGridCompositeComponentSchema =
	UpdateBaseCompositeComponentSchema.extend({
		componentType: z.literal(CompositeComponentTypeSchema.enum.GRID).readonly(),
		config: z
			.union([
				UniformGridConfigSchema.partial(),
				BentoGridConfigSchema.partial(),
			])
			.optional(),
	});

// Create Schemas

export const CreateGridCompositeComponentSchema =
	CreateBaseCompositeComponentSchema.extend({
		componentType: z.literal(CompositeComponentTypeSchema.enum.GRID).readonly(),
		config: GridConfigSchema,
	});
