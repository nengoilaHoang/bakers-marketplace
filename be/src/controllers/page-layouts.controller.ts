import { Request, Response } from 'express';
import asyncHandler from '#/utils/asyncHandler.js';
import pageLayoutService, {
	PageLayoutService,
} from '#/services/page-layouts.service.js';
import { PutLayoutComponent } from '#/models/layout-components/layout-components.model.js';

export class PageLayoutController {
	constructor(private readonly pageLayoutService: PageLayoutService) {}

	public update = asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params as { id: string };
		const { root } = req.body as { root: PutLayoutComponent };

		await this.pageLayoutService.ensureExists(id);
		await this.pageLayoutService.updatePageLayout(id, root);

		return res
			.status(200)
			.json({ message: 'Page layout updated successfully' });
	});
}

const pageLayoutController = new PageLayoutController(pageLayoutService);
export default pageLayoutController;
