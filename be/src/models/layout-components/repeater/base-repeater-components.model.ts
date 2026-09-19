import { z } from 'zod';
import {
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

export const BaseRepeaterComponentSchema = BaseLayoutComponentSchema.extend({
	type: z.literal(ComponentTypeSchema.enum.REPEATER).readonly(),
	componentType: RepeaterComponentTypeSchema.readonly(),
	itemTemplate: z.lazy((): z.ZodType => LayoutComponentSchema),
});

export const UpdateBaseRepeaterComponentSchema =
	UpdateBaseLayoutComponentSchema.extend({
		type: z.literal(ComponentTypeSchema.enum.REPEATER).readonly(),
		componentType: RepeaterComponentTypeSchema.readonly(),
		itemTemplate: z
			.lazy(
				(): z.ZodType =>
					z.union([UpdateLayoutComponentSchema, CreateLayoutComponentSchema]),
			)
			.optional(),
	});

export const CreateBaseRepeaterComponentSchema =
	CreateBaseLayoutComponentSchema.extend({
		type: z.literal(ComponentTypeSchema.enum.REPEATER).readonly(),
		componentType: RepeaterComponentTypeSchema.readonly(),
		itemTemplate: z
			.lazy(
				(): z.ZodType =>
					z.union([UpdateLayoutComponentSchema, CreateLayoutComponentSchema]),
			)
			.optional(),
	});
