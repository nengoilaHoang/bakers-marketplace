import { z } from 'zod';
import {
	CreateRichTextLeafComponentSchema,
	RichTextLeafComponentSchema,
	UpdateRichTextLeafComponentSchema,
} from './rich-text-leaf-components.model.js';

export const LeafComponentSchema = z.discriminatedUnion('componentType', [
	RichTextLeafComponentSchema,
]);

export const UpdateLeafComponentSchema = z.discriminatedUnion('componentType', [
	UpdateRichTextLeafComponentSchema,
]);
export type UpdateLeafComponent = z.infer<typeof UpdateLeafComponentSchema>;

export const CreateLeafComponentSchema = z.discriminatedUnion('componentType', [
	CreateRichTextLeafComponentSchema,
]);
export type CreateLeafComponent = z.infer<typeof CreateLeafComponentSchema>;
