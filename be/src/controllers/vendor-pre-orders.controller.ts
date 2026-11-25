import type { Response } from 'express';

import { z } from 'zod';

import asyncHandler from '#/utils/asyncHandler.js';

import vendorPreOrderService from '#/services/pre-orders/vendor-pre-orders.service.js';

import { VendorOrderDeclineSchema } from '#/models/orders/orders.model.js';
import { VendorPreOrderQuerySchema } from '#/models/pre-orders/pre-orders.model.js';
import { AuthenticatedRequest } from '#/types/request.types.js';

const IdParamsSchema = z.object({
	id: z.uuidv4(),
});

class VendorPreOrderController {
	private vendorPreOrderService = vendorPreOrderService;

	public getPage = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const query = VendorPreOrderQuerySchema.parse(req.query);

			const page = await this.vendorPreOrderService.getPage(req.user.id, query);

			res.status(200).json(page);
		},
	);

	public getById = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = IdParamsSchema.parse(req.params);

			const request = await this.vendorPreOrderService.getDetail(req.user.id, id);

			res.status(200).json({ data: request });
		},
	);

	public approve = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = IdParamsSchema.parse(req.params);

			const request = await this.vendorPreOrderService.approve(req.user.id, id);

			res.status(200).json({ data: request });
		},
	);

	public decline = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = IdParamsSchema.parse(req.params);
			const { reason } = VendorOrderDeclineSchema.parse(req.body);

			const request = await this.vendorPreOrderService.decline(req.user.id, id, reason);

			res.status(200).json({ data: request });
		},
	);
}

export default new VendorPreOrderController();
