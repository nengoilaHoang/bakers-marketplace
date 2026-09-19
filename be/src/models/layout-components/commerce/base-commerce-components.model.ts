import { z } from 'zod';
import {
	BaseLayoutComponentSchema,
	ComponentTypeSchema,
	CreateBaseLayoutComponentSchema,
	UpdateBaseLayoutComponentSchema,
} from '../base-layout-components.model.js';

export const CommerceComponentTypeSchema = z.enum([
	'HERO_BANNER',
	'IMAGE_BANNER',
	'PRODUCT_CARD',
	'PRODUCT_DETAILS',
	'REVIEW_GRID',
	'CONTACT_FORM',
	'FAQ',
]);

export const CommerceComponentTableSchema = z.object({
	id: z.uuidv4().readonly(),
	componentType: CommerceComponentTypeSchema,
});

export type CommerceComponentRow = z.infer<typeof CommerceComponentTableSchema>;

export const BaseCommerceComponentSchema = BaseLayoutComponentSchema.extend({
	type: z.literal(ComponentTypeSchema.enum.COMMERCE).readonly(),
	componentType: CommerceComponentTypeSchema.readonly(),
});

export const UpdateBaseCommerceComponentSchema =
	UpdateBaseLayoutComponentSchema.extend({
		type: z.literal(ComponentTypeSchema.enum.COMMERCE).readonly(),
		componentType: CommerceComponentTypeSchema,
	});

export const CreateBaseCommerceComponentSchema =
	CreateBaseLayoutComponentSchema.extend({
		type: z.literal(ComponentTypeSchema.enum.COMMERCE).readonly(),
		componentType: CommerceComponentTypeSchema,
	});
