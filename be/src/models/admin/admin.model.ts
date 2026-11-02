import { z } from 'zod';

import { PostStatusSchema, type PostStatus } from '#/models/posts/posts.model.js';
import {
	UserRoleSchema,
	UserStatusSchema,
	type UserInfo,
	type UserRole,
	type UserStatus,
} from '#/models/users/users.model.js';
import type { ReportPerson, ReportView } from '#/models/reports/reports.model.js';
import type { WarningView } from '#/models/users/warnings.model.js';
import type { TakedownView } from '#/models/takedowns/takedowns.model.js';

const BooleanQuerySchema = z
	.enum(['true', 'false'])
	.transform((value) => value === 'true');

export const PageQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

/** reported=true keeps only the rows that still have pending reports. */
export const AdminPostQuerySchema = PageQuerySchema.extend({
	status: PostStatusSchema.optional(),
	reported: BooleanQuerySchema.optional(),
	keyword: z.string().trim().max(100).optional(),
});

export const AdminRecipeQuerySchema = PageQuerySchema.extend({
	keyword: z.string().trim().max(100).optional(),
});

export const AdminUserQuerySchema = PageQuerySchema.extend({
	role: UserRoleSchema.optional(),
	status: UserStatusSchema.optional(),
	reported: BooleanQuerySchema.optional(),
	keyword: z.string().trim().max(100).optional(),
});

export const AdminVendorQuerySchema = PageQuerySchema.extend({
	status: UserStatusSchema.optional(),
	keyword: z.string().trim().max(100).optional(),
});

export const ModerationReasonSchema = z.object({
	reason: z.string().trim().min(1).max(500),
});

export const ModerationNoteSchema = z.object({
	note: z.string().trim().max(500).optional(),
});

export type PageQuery = z.infer<typeof PageQuerySchema>;
export type AdminPostQuery = z.infer<typeof AdminPostQuerySchema>;
export type AdminRecipeQuery = z.infer<typeof AdminRecipeQuerySchema>;
export type AdminUserQuery = z.infer<typeof AdminUserQuerySchema>;
export type AdminVendorQuery = z.infer<typeof AdminVendorQuerySchema>;

export type Paginated<T> = {
	data: T[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
	};
};

export type AdminPostRow = {
	id: string;
	title: string;
	content: string;
	status: PostStatus;
	author: ReportPerson | null;
	pendingReportCount: number;
	reportCount: number;
	lastReportedAt: Date | null;
	createdAt: Date;
};

export type AdminPostDetail = AdminPostRow & {
	reports: ReportView[];
	removals: TakedownView[];
};

export type AdminRecipeRow = {
	id: string;
	title: string;
	description: string | null;
	portion: number | null;
	author: ReportPerson | null;
	createdAt: Date;
	updatedAt: Date;
};

export type AdminUserRow = {
	id: string;
	email: string;
	displayName: string;
	role: UserRole;
	status: UserStatus;
	pendingReportCount: number;
	warningCount: number;
	createdAt: Date;
};

export type AdminUserDetail = UserInfo & {
	reports: ReportView[];
	warnings: WarningView[];
	bans: TakedownView[];
};

export type AdminVendorRow = {
	id: string;
	email: string;
	displayName: string;
	status: UserStatus;
	taxCode: string;
	brandName: string | null;
	registeredAt: Date | null;
	createdAt: Date;
};
