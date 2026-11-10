import z from 'zod';

export const DocumentTableSchema = z.object({
	id: z.uuidv4().readonly(),
	pageCount: z.number().int().positive(),
});

export const DocumentSchema = DocumentTableSchema.extend({
	pageCount: z.number().int().positive(),
});

export type DocumentRow = z.infer<typeof DocumentTableSchema>;
export type Document = z.infer<typeof DocumentSchema>;