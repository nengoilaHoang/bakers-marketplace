import layoutComponentService, {
	LayoutComponentService,
} from '#/services/layout-component.service.js';
import asyncHandler from '#/utils/asyncHandler.js';
import { Request, Response } from 'express';

export class LayoutComponentController {
	constructor(
		private readonly layoutComponentService: LayoutComponentService,
	) {}

	public deleteBatch = asyncHandler(async (req: Request, res: Response) => {
		const { ids } = req.body as { ids: string[] };

		// 1. Validate the components belong to vendor
		// TODO: Implement validation logic

		// 2. Delete
		await this.layoutComponentService.delete(ids);

		return res.status(200).json({
			message: 'Layout components deleted successfully',
		});
	});
}

const layoutComponentController = new LayoutComponentController(
	layoutComponentService,
);
export default layoutComponentController;
