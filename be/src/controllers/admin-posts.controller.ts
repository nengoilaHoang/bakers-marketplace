import type { Response } from 'express';

import { z } from 'zod';

import asyncHandler from '#/utils/asyncHandler.js';

import adminPostService from '#/services/admin/admin-posts.service.js';

import {
	AdminPostQuerySchema,
	ModerationNoteSchema,
	ModerationReasonSchema,
} from '#/models/admin/admin.model.js';
import { AuthenticatedRequest } from '#/types/request.types.js';

const PostIdParamsSchema = z.object({
	id: z.uuidv4(),
});

class AdminPostController {
	private adminPostService = adminPostService;

	public getPage = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const query = AdminPostQuerySchema.parse(req.query);

			const page = await this.adminPostService.getPage(query);

			res.status(200).json(page);
		},
	);

	public getById = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = PostIdParamsSchema.parse(req.params);

			const post = await this.adminPostService.getById(id);

			res.status(200).json({ data: post });
		},
	);

	public remove = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = PostIdParamsSchema.parse(req.params);
			const { reason } = ModerationReasonSchema.parse(req.body);

			const post = await this.adminPostService.remove(req.user.id, id, reason);

			res.status(200).json({ data: post });
		},
	);

	public restore = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = PostIdParamsSchema.parse(req.params);

			const post = await this.adminPostService.restore(req.user.id, id);

			res.status(200).json({ data: post });
		},
	);

	public dismissReports = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = PostIdParamsSchema.parse(req.params);
			const { note } = ModerationNoteSchema.parse(req.body ?? {});

			const result = await this.adminPostService.dismissReports(
				req.user.id,
				id,
				note,
			);

			res.status(200).json({ data: result });
		},
	);
}

export default new AdminPostController();
