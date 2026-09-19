import { z } from 'zod';
import {
	BaseLayoutComponentSchema,
	ComponentTypeSchema,
	CreateBaseLayoutComponentSchema,
	UpdateBaseLayoutComponentSchema,
} from '../base-layout-components.model.js';

export const LeafComponentTypeSchema = z.enum([
	'CARD',
	'FORM',
	'BUTTON',
	'SEARCH_BAR',
	'FILTER',
	'RICH_TEXT',
	'IMAGE',
	'GALLERY',
	'VIDEO_PLAYER',
	'DIVIDER',
]);

// Table Definitions
export const LeafComponentTableSchema = z.object({
	id: z.uuidv4().readonly(),
	componentType: LeafComponentTypeSchema.readonly(),
});
export type LeafComponentRow = z.infer<typeof LeafComponentTableSchema>;

// Domain Definitions
export const BaseLeafComponentSchema = BaseLayoutComponentSchema.extend({
	type: z.literal(ComponentTypeSchema.enum.LEAF).readonly(),
	componentType: LeafComponentTypeSchema.readonly(),
});

export const UpdateBaseLeafComponentSchema =
	UpdateBaseLayoutComponentSchema.extend({
		type: z.literal(ComponentTypeSchema.enum.LEAF).readonly(),
		componentType: LeafComponentTypeSchema.readonly(),
	});

export const CreateBaseLeafComponentSchema =
	CreateBaseLayoutComponentSchema.extend({
		type: z.literal(ComponentTypeSchema.enum.LEAF).readonly(),
		componentType: LeafComponentTypeSchema.readonly(),
	});
