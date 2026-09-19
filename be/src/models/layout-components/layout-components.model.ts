import { z } from 'zod';

import { GridCompositeComponentSchema } from './composite/grid-composite-components.model.js';
import {
	LeafComponentSchema,
	UpdateLeafComponentSchema,
	CreateLeafComponentSchema,
} from './leaf/leaf-components.model.js';
import {
	RepeaterComponentSchema,
	UpdateRepeaterComponentSchema,
	CreateRepeaterComponentSchema,
} from './repeater/repeater-components.model.js';
import {
	CommerceComponentSchema,
	UpdateCommerceComponentSchema,
	CreateCommerceComponentSchema,
} from './commerce/commerce-components.model.js';
import {
	UpdateCompositeComponentSchema,
	CreateCompositeComponentSchema,
} from './composite/composite-components.model.js';

export const LayoutComponentSchema = z.lazy(() =>
	z.discriminatedUnion('type', [
		GridCompositeComponentSchema,
		LeafComponentSchema,
		RepeaterComponentSchema,
		CommerceComponentSchema,
	]),
);
export type LayoutComponent = z.infer<typeof LayoutComponentSchema>;

export const UpdateLayoutComponentSchema = z.lazy(() =>
	z.discriminatedUnion('type', [
		UpdateCompositeComponentSchema,
		UpdateLeafComponentSchema,
		UpdateRepeaterComponentSchema,
		UpdateCommerceComponentSchema,
	]),
);
export type UpdateLayoutComponent = z.infer<typeof UpdateLayoutComponentSchema>;

export const CreateLayoutComponentSchema = z.lazy(() =>
	z.discriminatedUnion('type', [
		CreateCompositeComponentSchema,
		CreateLeafComponentSchema,
		CreateRepeaterComponentSchema,
		CreateCommerceComponentSchema,
	]),
);
export type CreateLayoutComponent = z.infer<typeof CreateLayoutComponentSchema>;
