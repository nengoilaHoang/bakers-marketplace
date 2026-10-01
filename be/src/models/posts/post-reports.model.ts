import { z } from 'zod';

export const PostReportSchema = z.object({
	id: z.uuidv4().optional(),
	postId: z.uuidv4(),
	reporterId: z.uuidv4().nullable().optional(),
	reason: z.string().trim().min(1).max(500),
	createdAt: z.date().optional(),
});

export const PostReportCreateSchema = PostReportSchema.pick({
	reason: true,
});

export type PostReportData = z.infer<typeof PostReportSchema>;
export type PostReportCreate = z.infer<typeof PostReportCreateSchema>;

export class PostReport implements PostReportData {
	id!: string;
	postId!: string;
	reporterId?: string | null;
	reason!: string;
	createdAt?: Date;

	constructor(data?: Partial<PostReportData>) {
		if (data) {
			Object.assign(this, data);
		}
	}
}
