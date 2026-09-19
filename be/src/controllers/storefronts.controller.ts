import { ComponentNode } from '#/daos/layout-components.dao.js';
import pageLayoutService, {
	PageLayoutService,
} from '#/services/page-layouts.service.js';
import storefrontService, {
	StorefrontService,
} from '#/services/storefronts.service.js';
import asyncHandler from '#/utils/asyncHandler.js';
import { Request, Response } from 'express';

export class StorefrontController {
	constructor(
		private readonly storefrontService: StorefrontService,
		private readonly pageLayoutService: PageLayoutService,
	) {}

	public updatePageLayout = asyncHandler(
		async (req: Request, res: Response) => {
			const { pageId } = req.params as {
				pageId: string;
			};
			const { root } = req.body satisfies { root: ComponentNode };

			// 1: Validation
			await this.pageLayoutService.ensureExists(pageId);

			// 2: Update
			await this.pageLayoutService.updatePageLayout(pageId, root);

			return res.status(200).json({
				message: 'Page layout updated successfully',
			});
		},
	);

	public getStorefrontActiveRelease = asyncHandler(
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
}

const storefrontController = new StorefrontController(
	storefrontService,
	pageLayoutService,
);
export default storefrontController;
