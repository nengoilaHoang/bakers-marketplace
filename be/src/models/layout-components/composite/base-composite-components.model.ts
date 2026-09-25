import { z } from 'zod';
import {
	LayoutComponentSchema,
	UpdateLayoutComponentSchema,
	CreateLayoutComponentSchema,
} from '../layout-components.model.js';
import {
	BaseLayoutComponentSchema,
	ComponentTypeSchema,
	CreateBaseLayoutComponentSchema,
	UpdateBaseLayoutComponentSchema,
} from '../base-layout-components.model.js';

export const CompositeComponentTypeSchema = z.enum([
	'GRID',
	'COLUMN',
	'ROW',
	'CAROUSEL',
]);

export const ResponsiveValueSchema = <T extends z.ZodType>(valueSchema: T) =>
	z.object({
		mobile: valueSchema,
		tablet: valueSchema,
		desktop: valueSchema,
	});

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
const createChildrenMapSchema = <T extends z.ZodType>(childSchema: T) =>
	z.preprocess(
		(value) => {
			if (value instanceof Map) {
				return Object.fromEntries(value.entries());
			}
			return value;
		},
		z.record(z.string(), childSchema),
	);

const ChildrenSchema = ResponsiveValueSchema(
	createChildrenMapSchema(z.lazy((): z.ZodType => LayoutComponentSchema)),
);

const UpdateChildrenSchema = ResponsiveValueSchema(
	createChildrenMapSchema(
		z.lazy(
			(): z.ZodType =>
				z
					.union([UpdateLayoutComponentSchema, CreateLayoutComponentSchema])
					.optional(),
		),
	),
);

export const BaseCompositeComponentSchema = BaseLayoutComponentSchema.extend({
	type: z.literal(ComponentTypeSchema.enum.COMPOSITE).readonly(),
	componentType: CompositeComponentTypeSchema.readonly(),
	children: ChildrenSchema,
});

export const UpdateBaseCompositeComponentSchema =
	UpdateBaseLayoutComponentSchema.extend({
		type: z.literal(ComponentTypeSchema.enum.COMPOSITE).readonly(),
		componentType: CompositeComponentTypeSchema.readonly(),
		children: UpdateChildrenSchema,
	});

export const CreateBaseCompositeComponentSchema =
	CreateBaseLayoutComponentSchema.extend({
		type: z.literal(ComponentTypeSchema.enum.COMPOSITE).readonly(),
		componentType: CompositeComponentTypeSchema.readonly(),
		children: ResponsiveValueSchema(
			createChildrenMapSchema(
				z.lazy(
					(): z.ZodType =>
						z.union([UpdateLayoutComponentSchema, CreateLayoutComponentSchema]),
				),
			),
		).optional(),
	});
