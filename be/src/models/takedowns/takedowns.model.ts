import { z } from 'zod';

import type { ReportPerson } from '#/models/reports/reports.model.js';

/** Columns shared by every kind of takedown; post_removals and user_bans add the target. */
export const TakedownSchema = z.object({
	id: z.uuidv4().optional(),
	issuedBy: z.uuidv4().nullable().optional(),
	reason: z.string().trim().min(1).max(500),
	issuedAt: z.date().optional(),
	revokedBy: z.uuidv4().nullable().optional(),
	revokedAt: z.date().nullable().optional(),
});

export type TakedownData = z.infer<typeof TakedownSchema>;

/** A takedown as an admin sees it; revokedAt is null while it is still in force. */
export type TakedownView = {
	id: string;
	reason: string;
	issuedBy: ReportPerson | null;
	issuedAt: Date;
	revokedBy: ReportPerson | null;
	revokedAt: Date | null;
};

export class Takedown implements TakedownData {
	id!: string;
	issuedBy?: string | null;
	reason!: string;
	issuedAt?: Date;
	revokedBy?: string | null;
	revokedAt?: Date | null;

	constructor(data?: Partial<TakedownData>) {
		if (data) {
			Object.assign(this, data);
		}
	}
}

export class PostRemoval extends Takedown {
	// declare: a plain field would be reset to undefined after super() assigns it
	declare postId: string;

	constructor(data?: Partial<TakedownData & { postId: string }>) {
		super(data);
	}
}

export class UserBan extends Takedown {
	declare userId: string;

	constructor(data?: Partial<TakedownData & { userId: string }>) {
		super(data);
	}
}
