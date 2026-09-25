import storefrontService, {
	StorefrontService,
} from '#/services/storefronts.service.js';
import asyncHandler from '#/utils/asyncHandler.js';
import { Request, Response } from 'express';

export class StorefrontController {
	constructor(private readonly storefrontService: StorefrontService) {}

	public getActiveRelease = asyncHandler(
		async (req: Request, res: Response) => {
			const { id } = req.params as {
				id: string;
			};

			// 1: Validation
			await this.storefrontService.ensureExists(id);

			// 2: Get storefront
			const data = await this.storefrontService.getActiveRelease(id);

			return res.status(200).json({
				data,
			});
		},
	);

	public getRelease = asyncHandler(async (req: Request, res: Response) => {
		const { storeId, releaseId } = req.params as {
			storeId: string;
			releaseId: string;
		};

		// 1: Validation
		await this.storefrontService.ensureExists(releaseId);

		// 2: Get storefront
		const data = await this.storefrontService.getRelease(storeId, releaseId);

		return res.status(200).json({
			data,
		});
	});
}

const storefrontController = new StorefrontController(storefrontService);
export default storefrontController;
