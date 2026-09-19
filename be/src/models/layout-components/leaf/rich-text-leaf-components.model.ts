import { z } from 'zod';
import {
	BaseLeafComponentSchema,
	CreateBaseLeafComponentSchema,
	LeafComponentTypeSchema,
	UpdateBaseLeafComponentSchema,
} from './base-leaf-components.model.js';
import {
	BaseLayoutComponentConfigSchema,
	InterpolatedStringSchema,
} from '../base-layout-components.model.js';

const RichTextFormatTypeSchema = z.enum(['html', 'markdown', 'json']);

export const RichTextConfigSchema = BaseLayoutComponentConfigSchema.extend({
	content: z.object({
		body: z.union([z.object(), z.string(), InterpolatedStringSchema]),
		format: RichTextFormatTypeSchema.default('html'),
	}),
});

export const RichTextLeafComponentSchema = BaseLeafComponentSchema.extend({
	componentType: z.literal(LeafComponentTypeSchema.enum.RICH_TEXT),
	config: RichTextConfigSchema,
});

// Update Schemas

export const UpdateRichTextLeafComponentSchema =
	UpdateBaseLeafComponentSchema.extend({
		componentType: z.literal(LeafComponentTypeSchema.enum.RICH_TEXT),
		config: RichTextConfigSchema.partial().optional(),
	});

// Create Schemas

export const CreateRichTextLeafComponentSchema =
	CreateBaseLeafComponentSchema.extend({
		componentType: z.literal(LeafComponentTypeSchema.enum.RICH_TEXT),
		config: RichTextConfigSchema,
	});
