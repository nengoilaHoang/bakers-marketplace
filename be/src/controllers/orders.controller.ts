import type { Response } from 'express';

import { z } from 'zod';

import asyncHandler from '#/utils/asyncHandler.js';

import orderService from '#/services/orders/orders.service.js';

import {
	OrderCancelSchema,
	OrderCreateSchema,
	OrderQuerySchema,
	OrderRatingCreateSchema,
} from '#/models/orders/orders.model.js';
import { AuthenticatedRequest } from '#/types/request.types.js';

const IdParamsSchema = z.object({
	id: z.uuidv4(),
});

const ItemParamsSchema = IdParamsSchema.extend({
	itemId: z.uuidv4(),
});

class OrderController {
	private orderService = orderService;

	public place = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const input = OrderCreateSchema.parse(req.body);

			const order = await this.orderService.place(req.user.id, input);

			res.status(201).json({ data: order });
		},
	);

	public getMine = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const query = OrderQuerySchema.parse(req.query);

			const page = await this.orderService.getMine(req.user.id, query);

			res.status(200).json(page);
		},
	);

	public getById = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = IdParamsSchema.parse(req.params);

			const order = await this.orderService.getOwnDetail(req.user.id, id);

			res.status(200).json({ data: order });
		},
	);

	public cancel = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = IdParamsSchema.parse(req.params);
			const { reason } = OrderCancelSchema.parse(req.body ?? {});

			const order = await this.orderService.cancel(req.user.id, id, reason);

			res.status(200).json({ data: order });
		},
	);

	public reorder = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = IdParamsSchema.parse(req.params);

			const result = await this.orderService.reorder(req.user.id, id);

			res.status(200).json({ data: result });
		},
	);

	public rateItem = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id, itemId } = ItemParamsSchema.parse(req.params);
			const input = OrderRatingCreateSchema.parse(req.body);

			const order = await this.orderService.rateItem(req.user.id, id, itemId, input);

			res.status(201).json({ data: order });
		},
	);
}

export default new OrderController();
