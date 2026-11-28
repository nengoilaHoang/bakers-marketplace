import { z } from 'zod';
import { Report, ReportCreateSchema, ReportSchema, type ReportData } from '#/models/moderation/reports.model.js';

export const PostReportSchema = ReportSchema.extend({ target: z.object({ id: z.uuidv4() }) });

export const PostReportCreateSchema = ReportCreateSchema.pick({
	reason: true,
});

export type PostReportData = z.infer<typeof PostReportSchema>;
export type PostReportCreate = z.infer<typeof PostReportCreateSchema>;

export class ReportPost extends Report implements PostReportData {
	target: { id: string };

	constructor(data: ReportData & { target: { id: string } }) {
		super(data);
		this.target = data.target;
	}
}

export { ReportPost as PostReport };
