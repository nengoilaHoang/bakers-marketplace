import { z } from 'zod';

import type { ReportPerson } from '#/models/reports/reports.model.js';

export const WarningSchema = z.object({
	id: z.uuidv4().optional(),
	userId: z.uuidv4(),
	issuedBy: z.uuidv4().nullable().optional(),
	reason: z.string().trim().min(1).max(500),
	createdAt: z.date().optional(),
});

/**
 * postId: the warning is about that post (sent from the post page), so it settles
 * the post's pending reports. Not stored: the reports themselves record who
 * handled them and when.
 */
export const WarningCreateSchema = WarningSchema.pick({
	reason: true,
}).extend({
	postId: z.uuidv4().optional(),
});

export type WarningData = z.infer<typeof WarningSchema>;
export type WarningCreate = z.infer<typeof WarningCreateSchema>;

/** A report the warning settled, and the post it was about (null for a report about the user). */
export type WarningReport = {
	id: string;
	reason: string;
	postId: string | null;
	postTitle: string | null;
};

export type WarningView = {
	id: string;
	reason: string;
	issuedBy: ReportPerson | null;
	reports: WarningReport[];
	createdAt: Date;
};

export class Warning implements WarningData {
	id!: string;
	userId!: string;
	issuedBy?: string | null;
	reason!: string;
	createdAt?: Date;

	constructor(data?: Partial<WarningData>) {
		if (data) {
			Object.assign(this, data);
		}
	}
}
