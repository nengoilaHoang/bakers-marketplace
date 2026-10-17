import { z } from 'zod';
import {
	BaseLayoutComponentConfigSchema,
	BoxStyleConfigSchema,
} from '../base-layout-components.model.js';
import {
	BaseCompositeComponentSchema,
	CompositeComponentTypeSchema,
	CreateBaseCompositeComponentSchema,
	ResponsiveValueSchema,
	UpdateBaseCompositeComponentSchema,
} from './base-composite-components.model.js';

export const GridLayoutTypeSchema = z.enum(['UNIFORM', 'BENTO']);

export const RowHeightModeSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('fixed'),
    baseHeightPx: z.number().min(60).max(600).default(180),
  }),
  z.object({
    mode: z.literal('aspect_ratio'),
    ratio: z.enum(['1:1', '4:3', '16:9']).default('1:1'),
  }),
  z.object({
    mode: z.literal('auto'),
    minHeightPx: z.number().min(0).default(120),
  }),
]);

// The start position of each cell is counted linearly from left to right, downwards.
export const BaseGridConfigSchema = BaseLayoutComponentConfigSchema.extend({
  ...BoxStyleConfigSchema.shape,
  layout: GridLayoutTypeSchema,
  cols: ResponsiveValueSchema(z.uint32().min(1).max(12)),
  rows: ResponsiveValueSchema(z.uint32().min(1).max(50)).optional(),
  rowHeight: ResponsiveValueSchema(RowHeightModeSchema).default({
    desktop: { mode: 'fixed', baseHeightPx: 180 },
    tablet: { mode: 'fixed', baseHeightPx: 160 },
    mobile: { mode: 'auto', minHeightPx: 120 },
  }),
  densePacking: z.boolean().default(true), // grid-auto-flow: dense
  gap: ResponsiveValueSchema(z.uint32().min(0)), // in px
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
