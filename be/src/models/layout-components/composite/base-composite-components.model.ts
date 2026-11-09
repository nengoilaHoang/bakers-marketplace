import { z } from 'zod';
import {
	BaseLayoutComponentSchema,
	ComponentTypeSchema,
	CreateBaseLayoutComponentSchema,
	DeviceBreakpoint,
	UpdateBaseLayoutComponentSchema,
} from '../base-layout-components.model.js';
import {
	CreateLayoutComponentSchema,
	LayoutComponentSchema,
	UpdateLayoutComponentSchema,
} from '../layout-components.model.js';

export const CompositeComponentTypeSchema = z.enum([
  'GRID',
  'COLUMN',
  'ROW',
  'CAROUSEL',
]);

// Table Schemas
export const CompositeComponentTableSchema = z.object({
  id: z.uuidv4().readonly(),
  componentType: CompositeComponentTypeSchema.readonly(),
});
export type CompositeComponentRow = z.infer<
  typeof CompositeComponentTableSchema
>;

export const CompositeComponentChildrenTableSchema = z.object({
  compositeId: z.uuidv4().readonly(),
  childId: z.uuidv4().readonly(),
  breakpoint: DeviceBreakpoint,
  sortOrder: z.uint32(),
});
export type CompositeComponentChildrenRow = z.infer<
  typeof CompositeComponentChildrenTableSchema
>;

export const ComponentTemplateTableSchema = z.object({
  id: z.uuidv4().readonly(),
  name: z.string().min(3).max(255),
  ownerId: z.uuidv4().readonly(),
});
export type ComponentTemplateRow = z.infer<typeof ComponentTemplateTableSchema>;

// Domain Definitions
export const BreakpointSlotMapSchema = z
  .record(
    z.string().regex(/^\d+$/, 'Slot key must be a positive integer'),
    z.uuidv4('Child ID must be a valid UUID'),
  )
  .superRefine((slotMap, ctx) => {
    const seenChildIds = new Set<string>();

    for (const [order, childId] of Object.entries(slotMap)) {
      if (seenChildIds.has(childId)) {
        ctx.addIssue({
          code: 'custom',
          message: `Child component "${childId}" cannot be assigned more than once in the same view (duplicated at sort order ${order}).`,
          path: [order],
        });
      }
      seenChildIds.add(childId);
    }
  });

export type BreakpointSlotMap = z.infer<typeof BreakpointSlotMapSchema>;

export const CompositeSlotsSchema = z.object({
  desktop: BreakpointSlotMapSchema,
  tablet: BreakpointSlotMapSchema.optional(),
  mobile: BreakpointSlotMapSchema.optional(),
});

export type CompositeSlots = z.infer<typeof CompositeSlotsSchema>;

export const BaseCompositeComponentSchema = BaseLayoutComponentSchema.extend({
  type: z.literal(ComponentTypeSchema.enum.COMPOSITE).readonly(),
  componentType: CompositeComponentTypeSchema.readonly(),
  children: z.array(z.lazy((): z.ZodType => LayoutComponentSchema)),
  slots: CompositeSlotsSchema.optional(),
}).superRefine((data, ctx) => {
  if (!data.slots) return;

  const validChildIds = new Set(
    data.children
      .map((child) => (child as { id?: string }).id)
      .filter((id): id is string => Boolean(id)),
  );
  const breakpoints = ['desktop', 'tablet', 'mobile'] as const;

  for (const bp of breakpoints) {
    const slotMap = data.slots[bp];
    if (!slotMap) continue;

    for (const [order, childId] of Object.entries(slotMap)) {
      if (!validChildIds.has(childId)) {
        ctx.addIssue({
          code: 'custom',
          message: `Slot at order ${order} references child ID "${childId}", but it is not defined in the children array.`,
          path: ['slots', bp, order],
        });
      }
    }
  }
});

export const BreakpointIndexSlotMapSchema = z
  .record(
    z.string().regex(/^\d+$/, 'Slot key must be a positive integer'),
    z.number().int().nonnegative('Child reference must be an array index'),
  )
  .superRefine((slotMap, ctx) => {
    const seenIndices = new Set<number>();
    for (const [order, childIndex] of Object.entries(slotMap)) {
      if (seenIndices.has(childIndex)) {
        ctx.addIssue({
          code: 'custom',
          message: `Child at index [${childIndex}] is assigned more than once in the same view at sort order ${order}.`,
          path: [order],
        });
      }
      seenIndices.add(childIndex);
    }
  });

export const CompositePutSlotSchema = z.object({
  desktop: z.union([BreakpointSlotMapSchema, BreakpointIndexSlotMapSchema]),
  tablet: z
    .union([BreakpointSlotMapSchema, BreakpointIndexSlotMapSchema])
    .optional(),
  mobile: z
    .union([BreakpointSlotMapSchema, BreakpointIndexSlotMapSchema])
    .optional(),
});

export const UpdateBaseCompositeComponentSchema =
  UpdateBaseLayoutComponentSchema.extend({
    type: z.literal(ComponentTypeSchema.enum.COMPOSITE).readonly(),
    componentType: CompositeComponentTypeSchema.readonly(),
    children: z
      .array(
        z.lazy(
          (): z.ZodType =>
            z.union([UpdateLayoutComponentSchema, CreateLayoutComponentSchema]),
        ),
      )
      .optional(),
    slots: CompositePutSlotSchema.optional(),
  });

export const CreateBaseCompositeComponentSchema =
  CreateBaseLayoutComponentSchema.extend({
    type: z.literal(ComponentTypeSchema.enum.COMPOSITE).readonly(),
    componentType: CompositeComponentTypeSchema.readonly(),
    children: z
      .array(
        z.lazy(
          (): z.ZodType =>
            z.union([UpdateLayoutComponentSchema, CreateLayoutComponentSchema]),
        ),
      )
      .default([]),
    slots: CompositePutSlotSchema.optional(),
  }).superRefine((data, ctx) => {
    if (!data.slots) return;
    const maxIndex = data.children.length - 1;

    for (const bp of ['desktop', 'tablet', 'mobile'] as const) {
      const slotMap = data.slots[bp];
      if (!slotMap) continue;

      for (const [order, childIndex] of Object.entries(slotMap)) {
        if (typeof childIndex !== 'number') continue;
        if (childIndex > maxIndex) {
          ctx.addIssue({
            code: 'custom',
            message: `Slot order ${order} points to child index [${childIndex}], but children only has ${data.children.length} elements.`,
            path: ['slots', bp, order],
          });
        }
      }
    }
  });
