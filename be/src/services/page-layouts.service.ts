import layoutComponentDao, {
	LayoutComponentDao,
} from '#/daos/layouts/layout-components.dao.js';
import pageLayoutDao, {
	PageLayoutDao,
} from '#/daos/layouts/page-layout.dao.js';
import { PutCompositeComponentSchema } from '#/models/layout-components/composite/composite-components.model.js';
import {
	PutLayoutComponent
} from '#/models/layout-components/layout-components.model.js';
import { UnprocessableEntityError } from '#/utils/http-errors.js';

export class PageLayoutService {
  constructor(
    private readonly pageLayoutDao: PageLayoutDao,
    private readonly layoutComponentDao: LayoutComponentDao,
  ) {}

  public ensurePageExists = async (pageId: string) => {
    // Skip for now
  };

  public getReleaseLayouts = async (releaseId: string) => {
    return await this.pageLayoutDao.getReleaseLayouts(releaseId);
  };

  public updatePage = async (pageId: string, root: PutLayoutComponent) => {
    const result = PutCompositeComponentSchema.safeParse(root);
    if (!result.success) {
      throw new UnprocessableEntityError(
        `Invalid layout component schema: ${result.error}`,
      );
    }

    return await this.pageLayoutDao.withTransaction(async (t) => {
      const [rootId] = await this.layoutComponentDao.upsertBatch(
        [result.data],
        t,
      );
      return await this.pageLayoutDao.updatePage(
        pageId,
        { rootComponentId: rootId },
        t,
      );
    });
  };
}

const pageLayoutService = new PageLayoutService(
  pageLayoutDao,
  layoutComponentDao,
);
export default pageLayoutService;
