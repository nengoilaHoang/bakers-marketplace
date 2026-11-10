import z from 'zod';
import { FileSchema } from './files.model.js';

export const ImageTableSchema = z.object({
	id: z.uuidv4().readonly(),
	width: z.number().int().positive(),
	height: z.number().int().positive(),
});

export const ImageSchema = FileSchema.extend({
	width: z.number().int().positive(),
	height: z.number().int().positive(),
});

export type ImageRow = z.infer<typeof ImageTableSchema>;
export type Image = z.infer<typeof ImageSchema>;
