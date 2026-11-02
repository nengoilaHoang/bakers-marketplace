import { z } from 'zod';

import { ReportSchema, type ReportStatus } from '#/models/reports/reports.model.js';

export const UserReportSchema = ReportSchema.extend({
	targetUserId: z.uuidv4(),
});

export const UserReportCreateSchema = UserReportSchema.pick({
	reason: true,
});

export type UserReportData = z.infer<typeof UserReportSchema>;
export type UserReportCreate = z.infer<typeof UserReportCreateSchema>;

export class UserReport implements UserReportData {
	id!: string;
	targetUserId!: string;
	reporterId?: string | null;
	reason!: string;
	status?: ReportStatus;
	handledBy?: string | null;
	handledAt?: Date | null;
	note?: string | null;
	createdAt?: Date;

	constructor(data?: Partial<UserReportData>) {
		if (data) {
			Object.assign(this, data);
		}
	}
}
