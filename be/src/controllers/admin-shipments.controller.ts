import type { Response } from 'express';

import { z } from 'zod';

import asyncHandler from '#/utils/asyncHandler.js';

import adminShipmentService from '#/services/admin/admin-shipments.service.js';

import { AdminShipmentQuerySchema } from '#/models/orders/orders.model.js';
import { AuthenticatedRequest } from '#/types/request.types.js';

const IdParamsSchema = z.object({
	id: z.uuidv4(),
});

class AdminShipmentController {
	private adminShipmentService = adminShipmentService;

	public getPage = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const query = AdminShipmentQuerySchema.parse(req.query);

			const page = await this.adminShipmentService.getPage(query);

			res.status(200).json(page);
		},
	);

	public advance = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = IdParamsSchema.parse(req.params);

			await this.adminShipmentService.advance(req.user.id, id);

			res.status(204).end();
		},
	);
}

export default new AdminShipmentController();
