import storefrontReleaseDao, {
	StorefrontReleaseDao,
} from '#/daos/storefronts/storefront-releases.dao.js';
import { StorefrontRelease } from '#/models/storefronts/storefront-releases.model.js';
import { NotFoundError } from '#/utils/http-errors.js';

export class StorefrontReleaseService {
  constructor(private readonly storefrontReleaseDao: StorefrontReleaseDao) {}

  public ensureExists = async (id: string): Promise<void> => {
    const exists = await this.storefrontReleaseDao.checkIfExists(id);
    if (exists) {
      throw new NotFoundError(`Storefront release with ${id} does not exists.`);
    }
  };

  public getRelease = async (
    releaseId: string,
    vendorId: string,
  ): Promise<StorefrontRelease | null> => {
    const isOwner = await this.storefrontReleaseDao.checkOwnership(
      releaseId,
      vendorId,
    );
    if (!isOwner) {
      // Throw not found error to avoid leaking information about the existence of the release
      throw new NotFoundError(`Release with ${releaseId} does not exists.`);
    }

    return await this.storefrontReleaseDao.getRelease(releaseId);
  };
}

const storefrontReleaseService = new StorefrontReleaseService(
  storefrontReleaseDao,
);
export default storefrontReleaseService;
