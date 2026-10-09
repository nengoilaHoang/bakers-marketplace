import { PutLayoutComponent } from '#/models/layout-components/layout-components.model.js';
import pageLayoutService, {
	PageLayoutService,
} from '#/services/page-layouts.service.js';
import asyncHandler from '#/utils/asyncHandler.js';
import { Request, Response } from 'express';

export class PageLayoutController {
  constructor(private readonly pageLayoutService: PageLayoutService) {}

  public getReleaseLayouts = asyncHandler(
    async (req: Request<{ releaseId: string }>, res: Response) => {
      const { releaseId: id } = req.params;
      console.log('HERR');
      const layouts = await this.pageLayoutService.getReleaseLayouts(id);

      return res.status(200).json({ data: layouts });
    },
  );

  public update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { root } = req.body as { root: PutLayoutComponent };

    await this.pageLayoutService.ensurePageExists(id);
    await this.pageLayoutService.updatePageLayout(id, root);

    return res
      .status(200)
      .json({ message: 'Page layout updated successfully' });
  });
}

const pageLayoutController = new PageLayoutController(pageLayoutService);
export default pageLayoutController;
