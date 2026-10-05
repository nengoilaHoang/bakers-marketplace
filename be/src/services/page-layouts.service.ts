import pageLayoutDao, {
	PageLayoutDao,
} from '#/daos/layouts/page-layout.dao.js';
import {
	PutLayoutComponent,
	PutLayoutComponentSchema,
} from '#/models/layout-components/layout-components.model.js';
import { UnprocessableEntityError } from '#/utils/http-errors.js';

export class PageLayoutService {
  constructor(private readonly pageLayoutDao: PageLayoutDao) {}

  public ensurePageExists = async (pageId: string) => {
    // Skip for now
  };

  public getReleaseLayouts = async (releaseId: string) => {
    return await this.pageLayoutDao.getReleaseLayouts(releaseId);
  };

  public updatePageLayout = async (
    pageId: string,
    root: PutLayoutComponent,
  ) => {
    const result = PutLayoutComponentSchema.safeParse(root);
    if (!result.success) {
      throw new UnprocessableEntityError(
        `Invalid layout component schema: ${result.error}`,
      );
    }

    await this.pageLayoutDao.updatePageLayout(pageId, result.data);
  };
}

const pageLayoutService = new PageLayoutService(pageLayoutDao);
export default pageLayoutService;
