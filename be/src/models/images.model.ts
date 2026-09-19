import { z } from 'zod';

export const ImageTableSchema = z.object({
	id: z.uuidv4().readonly(),
	displayName: z.string().trim().min(3).max(255),
	originalName: z.string().trim().min(3).max(255),
	url: z.url().max(2048),
	createdAt: z.date().readonly(),
});

export const ImageSchema = ImageTableSchema;

export type ImageRow = z.infer<typeof ImageTableSchema>;
export type Image = z.infer<typeof ImageSchema>;
