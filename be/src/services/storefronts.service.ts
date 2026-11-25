import layoutComponentDao, {
	LayoutComponentDao,
} from '#/daos/layouts/layout-components.dao.js';
import pageLayoutDao, {
	PageLayoutDao,
} from '#/daos/layouts/page-layout.dao.js';
import storefrontDao, {
	StorefrontDao,
} from '#/daos/storefronts/storefronts.dao.js';
import {
	CreatePageLayout,
	CreatePageLayoutSchema,
} from '#/models/storefronts/page-layouts.model.js';
import { StorefrontRelease } from '#/models/storefronts/storefront-releases.model.js';
import { StorefrontWithBrandPublicView } from '#/models/storefronts/storefronts.model.js';
import {
	ThemeSettings,
	UpdateThemeSettingsSchema,
} from '#/models/storefronts/theme-settings.js';
import {
	NotFoundError,
	UnprocessableEntityError,
} from '#/utils/http-errors.js';

export class StorefrontService {
  constructor(
    private readonly storefrontDao: StorefrontDao,
    private readonly pageLayoutDao: PageLayoutDao,
    private readonly layoutComponentDao: LayoutComponentDao,
  ) {}

  public ensureExists = async (id: string): Promise<void> => {
    const exists = await this.storefrontDao.checkIfStoreExists(id);
    if (!exists) {
      throw new NotFoundError(`Storefront with ${id} does not exists.`);
    }
  };

  public getPublicStorefrontPage = async (domain: string, slug?: string) => {
    const splitSlugs = slug?.split('/').filter(Boolean);

    const [pageData, navPages] = await Promise.all([
      this.storefrontDao.getStorefrontPage(domain, splitSlugs?.[0]),
      this.pageLayoutDao.getNavPages(domain),
    ]);

    if (!pageData) {
      const slugMessage = slug ? ` and slug "${slug}"` : '';
      throw new NotFoundError(
        `Storefront page for domain "${domain}"${slugMessage} does not exist.`,
      );
    }

    // The id of the product or the collection (eg. page?slug=)
    const routeParams =
      splitSlugs && splitSlugs.length > 1 ? { id: splitSlugs[1] } : undefined;

    return {
      ...pageData,
      navPages,
      ...(routeParams ? { routeParams } : {}),
    };
  };

  public getNavPages = async (domain: string) => {
    return await this.pageLayoutDao.getNavPages(domain);
  };

  public getVendorStorefront = async (
    vendorId: string,
    simple: boolean = false,
  ): Promise<StorefrontWithBrandPublicView | null> => {
    return await this.storefrontDao.getVendorStorefront(vendorId, simple);
  };

  public getActiveRelease = async (
    storefrontId: string,
    vendorId: string,
  ): Promise<StorefrontRelease | null> => {
    const isOwner = await this.storefrontDao.checkOwnership(
      storefrontId,
      vendorId,
    );
    if (!isOwner) {
      throw new NotFoundError(
        `Storefront with ${storefrontId} does not exists.`,
      );
    }
    return await this.storefrontDao.getActiveRelease(storefrontId);
  };

  public updateThemeSettings = async (
    releaseId: string,
    vendorId: string,
    payload: unknown,
  ): Promise<ThemeSettings> => {
    const parsed = UpdateThemeSettingsSchema.safeParse(payload);
    if (!parsed.success) {
      throw new UnprocessableEntityError(
        `Invalid theme settings payload: ${parsed.error}`,
      );
    }

    const isOwner = await this.storefrontDao.checkReleaseOwnership(
      releaseId,
      vendorId,
    );
    if (!isOwner) {
      throw new NotFoundError(`Release with ${releaseId} does not exist.`);
    }

    return await this.storefrontDao.updateThemeSettings(releaseId, parsed.data);
  };

  public checkReleaseOwnership = async (
    releaseId: string,
    vendorId: string,
  ) => {
    const isOwner = await this.storefrontDao.checkReleaseOwnership(
      releaseId,
      vendorId,
    );
    if (!isOwner) {
      throw new NotFoundError(`Release with ${releaseId} does not exist.`);
    }
  };

  public getReleasePages = async (releaseId: string) => {
    return await this.pageLayoutDao.getReleasePages(releaseId);
  };

  public getReleaseSummaryPages = async (releaseId: string) => {
    return await this.pageLayoutDao.getReleaseSummaryPages(releaseId);
  };

  public createReleasePage = async (
    releaseId: string,
    payload: CreatePageLayout,
  ) => {
    const parsedPayload = CreatePageLayoutSchema.safeParse(payload);
    if (!parsedPayload.success) {
      throw new UnprocessableEntityError(
        `Invalid theme settings payload: ${parsedPayload.error}`,
      );
    }

    const data = parsedPayload.data;
    return this.pageLayoutDao.withTransaction(async (t) => {
      const [rootId] = await this.layoutComponentDao.upsertBatch([data.root]);
      return await this.pageLayoutDao.createPage(
        {
          storefrontReleaseId: releaseId,
          rootComponentId: rootId,
          name: data.name,
          slug: data.slug,
          type: data.type,
        },
        t,
      );
    });
  };
}

const storefrontService = new StorefrontService(
  storefrontDao,
  pageLayoutDao,
  layoutComponentDao,
);
export default storefrontService;
