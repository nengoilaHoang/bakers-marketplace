import { z } from 'zod';
import {
	CreateGridCompositeComponentSchema,
	GridCompositeComponentSchema,
	UpdateGridCompositeComponentSchema,
} from './grid-composite-components.model.js';

export const CompositeComponentSchema = z.discriminatedUnion('componentType', [
  GridCompositeComponentSchema,
]);
export type CompositeComponent = z.infer<typeof CompositeComponentSchema>;

export const UpdateCompositeComponentSchema = z.discriminatedUnion(
  'componentType',
  [UpdateGridCompositeComponentSchema],
);
export type UpdateCompositeComponent = z.infer<
  typeof UpdateCompositeComponentSchema
>;

export const CreateCompositeComponentSchema = z.discriminatedUnion(
  'componentType',
  [CreateGridCompositeComponentSchema],
);
export type CreateCompositeComponent = z.infer<
  typeof CreateCompositeComponentSchema
>;

export const PutCompositeComponentSchema = z.union([
  UpdateCompositeComponentSchema,
  CreateCompositeComponentSchema,
]);
export type PutCompositeComponent = z.infer<typeof PutCompositeComponentSchema>;
