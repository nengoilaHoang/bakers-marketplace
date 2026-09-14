import { z } from 'zod';

export const ImageTableSchema = z.object({
	id: z.uuidv4().readonly(),
	displayName: z.string(),
	originalName: z.string(),
	url: z.string(),
	createdAt: z.date().readonly(),
});

export const ImageSchema = ImageTableSchema;

export type ImageRow = z.infer<typeof ImageTableSchema>;
export type Image = z.infer<typeof ImageSchema>;
