import type { Response } from 'express';

import { z } from 'zod';

import asyncHandler from '#/utils/asyncHandler.js';

import vendorOrderService from '#/services/orders/vendor-orders.service.js';

import {
	VendorOrderDeclineSchema,
	VendorOrderQuerySchema,
} from '#/models/orders/orders.model.js';
import { AuthenticatedRequest } from '#/types/request.types.js';

const IdParamsSchema = z.object({
	id: z.uuidv4(),
});

class VendorOrderController {
	private vendorOrderService = vendorOrderService;

	public getPage = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const query = VendorOrderQuerySchema.parse(req.query);

			const page = await this.vendorOrderService.getPage(req.user.id, query);

			res.status(200).json(page);
		},
	);

	public getById = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = IdParamsSchema.parse(req.params);

			const order = await this.vendorOrderService.getDetail(req.user.id, id);

			res.status(200).json({ data: order });
		},
	);

	public approve = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = IdParamsSchema.parse(req.params);

			const order = await this.vendorOrderService.approve(req.user.id, id);

			res.status(200).json({ data: order });
		},
	);

	public decline = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = IdParamsSchema.parse(req.params);
			const { reason } = VendorOrderDeclineSchema.parse(req.body);

			const order = await this.vendorOrderService.decline(req.user.id, id, reason);

			res.status(200).json({ data: order });
		},
	);
}

export default new VendorOrderController();
