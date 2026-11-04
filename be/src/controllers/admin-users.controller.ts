import type { Response } from 'express';

import { z } from 'zod';

import asyncHandler from '#/utils/asyncHandler.js';

import adminUserService from '#/services/admin/admin-users.service.js';
import adminReportService from '#/services/admin/admin-reports.service.js';

import {
	AdminUserQuerySchema,
	AdminVendorQuerySchema,
	ModerationNoteSchema,
	ModerationReasonSchema,
} from '#/models/admin/admin.model.js';
import { WarningCreateSchema } from '#/models/users/warnings.model.js';
import { AuthenticatedRequest } from '#/types/request.types.js';

const IdParamsSchema = z.object({
	id: z.uuidv4(),
});

class AdminUserController {
	private adminUserService = adminUserService;
	private adminReportService = adminReportService;

	public getPage = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const query = AdminUserQuerySchema.parse(req.query);

			const page = await this.adminUserService.getPage(query);

			res.status(200).json(page);
		},
	);

	public getVendorPage = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const query = AdminVendorQuerySchema.parse(req.query);

			const page = await this.adminUserService.getVendorPage(query);

			res.status(200).json(page);
		},
	);

	public getById = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = IdParamsSchema.parse(req.params);

			const user = await this.adminUserService.getById(id);

			res.status(200).json({ data: user });
		},
	);

	public warn = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = IdParamsSchema.parse(req.params);
			const input = WarningCreateSchema.parse(req.body);

			const user = await this.adminUserService.warn(req.user.id, id, input);

			res.status(201).json({ data: user });
		},
	);

	public ban = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = IdParamsSchema.parse(req.params);
			const { reason } = ModerationReasonSchema.parse(req.body);

			const user = await this.adminUserService.ban(req.user.id, id, reason);

			res.status(200).json({ data: user });
		},
	);

	public unban = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = IdParamsSchema.parse(req.params);

			const user = await this.adminUserService.unban(req.user.id, id);

			res.status(200).json({ data: user });
		},
	);

	public dismissReports = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = IdParamsSchema.parse(req.params);
			const { note } = ModerationNoteSchema.parse(req.body ?? {});

			const result = await this.adminUserService.dismissReports(
				req.user.id,
				id,
				note,
			);

			res.status(200).json({ data: result });
		},
	);

	// ---------- single reports ----------

	public dismissReport = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = IdParamsSchema.parse(req.params);
			const { note } = ModerationNoteSchema.parse(req.body ?? {});

			await this.adminReportService.dismiss(req.user.id, id, note);

			res.status(204).send();
		},
	);
}

export default new AdminUserController();
