import { z } from 'zod';

import { ReportSchema, type ReportStatus } from '#/models/reports/reports.model.js';

export const PostReportSchema = ReportSchema.extend({
	postId: z.uuidv4(),
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
	status?: ReportStatus;
	handledBy?: string | null;
	handledAt?: Date | null;
	note?: string | null;
	createdAt?: Date;

	constructor(data?: Partial<PostReportData>) {
		if (data) {
			Object.assign(this, data);
		}
	}
}
