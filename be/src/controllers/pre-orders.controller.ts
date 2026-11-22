import type { Response } from 'express';

import { z } from 'zod';

import asyncHandler from '#/utils/asyncHandler.js';

import preOrderService from '#/services/pre-orders/pre-orders.service.js';

import {
	PreOrderCancelSchema,
	PreOrderCreateSchema,
	PreOrderQuerySchema,
} from '#/models/pre-orders/pre-orders.model.js';
import { AuthenticatedRequest } from '#/types/request.types.js';

const IdParamsSchema = z.object({
	id: z.uuidv4(),
});

const CycleParamsSchema = IdParamsSchema.extend({
	cycleId: z.uuidv4(),
});

class PreOrderController {
	private preOrderService = preOrderService;

	public create = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const input = PreOrderCreateSchema.parse(req.body);

			const request = await this.preOrderService.create(req.user.id, input);

			res.status(201).json({ data: request });
		},
	);

	public getMine = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const query = PreOrderQuerySchema.parse(req.query);

			const page = await this.preOrderService.getMine(req.user.id, query);

			res.status(200).json(page);
		},
	);

	public getById = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = IdParamsSchema.parse(req.params);

			const request = await this.preOrderService.getOwnDetail(req.user.id, id);

			res.status(200).json({ data: request });
		},
	);

	public cancel = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = IdParamsSchema.parse(req.params);
			const { reason } = PreOrderCancelSchema.parse(req.body ?? {});

			const request = await this.preOrderService.cancel(req.user.id, id, reason);

			res.status(200).json({ data: request });
		},
	);

	public skipCycle = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id, cycleId } = CycleParamsSchema.parse(req.params);

			const request = await this.preOrderService.skipCycle(req.user.id, id, cycleId);

			res.status(200).json({ data: request });
		},
	);
}

export default new PreOrderController();
