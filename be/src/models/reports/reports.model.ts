import { z } from 'zod';

export const ReportStatusSchema = z.enum(['PENDING', 'DISMISSED', 'RESOLVED']);

/** Columns shared by every kind of report; post_reports and user_reports add the target. */
export const ReportSchema = z.object({
	id: z.uuidv4().optional(),
	reporterId: z.uuidv4().nullable().optional(),
	reason: z.string().trim().min(1).max(500),
	status: ReportStatusSchema.optional(),
	handledBy: z.uuidv4().nullable().optional(),
	handledAt: z.date().nullable().optional(),
	note: z.string().nullable().optional(),
	createdAt: z.date().optional(),
});

export type ReportStatus = z.infer<typeof ReportStatusSchema>;

export type ReportPerson = {
	id: string;
	displayName: string;
};

/** A report as an admin sees it, with who sent it and who handled it. */
export type ReportView = {
	id: string;
	reason: string;
	status: ReportStatus;
	reporter: ReportPerson | null;
	handledBy: ReportPerson | null;
	handledAt: Date | null;
	note: string | null;
	createdAt: Date;
};

/** What a report points at: exactly one of postId and targetUserId is set. */
export type ReportTarget = {
	id: string;
	status: ReportStatus;
	postId: string | null;
	targetUserId: string | null;
};
