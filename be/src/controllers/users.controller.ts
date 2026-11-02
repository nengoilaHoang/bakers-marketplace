import type { Request, Response } from 'express';

import { z } from 'zod';

import asyncHandler from '#/utils/asyncHandler.js';

import userService from '#/services/users/users.service.js';
import userReportService from '#/services/users/user-reports.service.js';

import { UserReportCreateSchema } from '#/models/users/user-reports.model.js';
import { AuthenticatedRequest } from '#/types/request.types.js';

const UserIdParamsSchema = z.object({
	id: z.uuidv4(),
});

class UserController {
	private userService = userService;
	private userReportService = userReportService;

	// ---------- profiles ----------

	public getProfile = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { id } = UserIdParamsSchema.parse(req.params);

			const profile = await this.userService.getPublicProfile(id);

			res.status(200).json({ data: profile });
		},
	);

	// ---------- reports ----------

	public report = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = UserIdParamsSchema.parse(req.params);
			const input = UserReportCreateSchema.parse(req.body);

			const report = await this.userReportService.report(
				req.user.id,
				id,
				input,
			);

			res.status(201).json({ data: report });
		},
	);
}

export default new UserController();
