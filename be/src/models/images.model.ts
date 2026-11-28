import { z } from 'zod';
import { File, FileSchema } from '#/models/files.model.js';

export const ImageTableSchema = FileSchema.extend({
	width: z.number().int().positive().nullable(),
	height: z.number().int().positive().nullable(),
	createdAt: z.date().readonly(),
});

export const ImageSchema = ImageTableSchema;

export type ImageRow = z.infer<typeof ImageTableSchema>;
export class Image extends File implements ImageRow {
	width!: number | null;
	height!: number | null;
	createdAt!: Date;

	constructor(data: ImageRow) {
		super(data);
		Object.assign(this, data);
	}
}
