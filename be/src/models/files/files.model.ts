import z from 'zod';

export const FileTableSchema = z.object({
	id: z.uuidv4().readonly(),
	displayName: z.string().trim().min(3).max(255),
	originalName: z.string().trim().min(3).max(255),
	url: z.url().max(2048),
	contentType: z.string().nullable(),
	extName: z.string().nullable(),
	size: z.number().int().nonnegative().nullable(),
	checkSum: z.string().length(64).nullable(),
	uploadedAt: z.date().nullable(),
	createdAt: z.date().readonly(),
});

export const FileSchema = FileTableSchema;

export type FileRow = z.infer<typeof FileTableSchema>;
export type File = z.infer<typeof FileSchema>;