import { z } from 'zod';

export const ImageTableSchema = z.object({
	id: z.uuidv4(),
	displayName: z.string(),
	originalName: z.string(),
	url: z.string(),
	contentType: z.string().nullable(),
	extName: z.string().nullable(),
	size: z.number().int().nonnegative().nullable(),
	checkSum: z.string().length(64).nullable(),
	uploadedAt: z.date().nullable(),
	createdAt: z.date().default(() => new Date()),
});

export const ImageSchema = ImageTableSchema;

export type ImageRow = z.infer<typeof ImageTableSchema>;
export type Image = z.infer<typeof ImageSchema>;
