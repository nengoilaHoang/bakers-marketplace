import { z } from 'zod';

import {
	CommerceComponentSchema,
	CreateCommerceComponentSchema,
	UpdateCommerceComponentSchema,
} from './commerce/commerce-components.model.js';
import {
	CreateCompositeComponentSchema,
	UpdateCompositeComponentSchema,
} from './composite/composite-components.model.js';
import { GridCompositeComponentSchema } from './composite/grid-composite-components.model.js';
import {
	CreateLeafComponentSchema,
	LeafComponentSchema,
	UpdateLeafComponentSchema,
} from './leaf/leaf-components.model.js';
import {
	CreateRepeaterComponentSchema,
	RepeaterComponentSchema,
	UpdateRepeaterComponentSchema,
} from './repeater/repeater-components.model.js';

export const LayoutComponentSchema = z.discriminatedUnion('type', [
  GridCompositeComponentSchema,
  LeafComponentSchema,
  RepeaterComponentSchema,
  CommerceComponentSchema,
]);
export type LayoutComponent = z.infer<typeof LayoutComponentSchema>;

export const UpdateLayoutComponentSchema = z.discriminatedUnion('type', [
  UpdateCompositeComponentSchema,
  UpdateLeafComponentSchema,
  UpdateRepeaterComponentSchema,
  UpdateCommerceComponentSchema,
]);
export type UpdateLayoutComponent = z.infer<typeof UpdateLayoutComponentSchema>;

export const CreateLayoutComponentSchema = z.discriminatedUnion('type', [
  CreateCompositeComponentSchema,
  CreateLeafComponentSchema,
  CreateRepeaterComponentSchema,
  CreateCommerceComponentSchema,
]);
export type CreateLayoutComponent = z.infer<typeof CreateLayoutComponentSchema>;

export const PutLayoutComponentSchema = z.union([
  CreateLayoutComponentSchema,
  UpdateLayoutComponentSchema,
]);
export type PutLayoutComponent = z.infer<typeof PutLayoutComponentSchema>;

export const BatchLayoutComponentPayloadSchema = z.object({
  components: z.array(PutLayoutComponentSchema).default([]),
  deleteIds: z.array(z.uuidv4()).default([]),
});

export type BatchLayoutComponentPayload = z.infer<
  typeof BatchLayoutComponentPayloadSchema
>;
