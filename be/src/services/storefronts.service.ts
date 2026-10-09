import storefrontDao, {
	StorefrontDao,
} from '#/daos/storefronts/storefronts.dao.js';
import { StorefrontRelease } from '#/models/storefronts/storefront-releases.model.js';
import { NotFoundError } from '#/utils/http-errors.js';

export class StorefrontService {
  constructor(private readonly storefrontDao: StorefrontDao) {}

  public ensureStoreExists = async (id: string): Promise<void> => {
    const exists = await this.storefrontDao.checkIfStoreExists(id);
    if (!exists) {
      throw new NotFoundError(`Storefront with ${id} does not exists.`);
    }
  };

  public ensureReleaseExists = async (id: string): Promise<void> => {
    const exists = await this.storefrontDao.checkIfStoreExists(id);
    if (!exists) {
      throw new NotFoundError(`Release with ${id} does not exists.`);
    }
  };

  public getVendorStorefronts = async (vendorId: string) => {
    return await storefrontDao.getVendorStorefronts(vendorId);
  };

  public getActiveRelease = async (
    id: string,
  ): Promise<StorefrontRelease | null> => {
    await this.ensureStoreExists(id);
    return await this.storefrontDao.getActiveRelease(id);
  };

  public getRelease = async (
    storeId: string,
    releaseId: string,
  ): Promise<StorefrontRelease | null> => {
    await this.ensureStoreExists(storeId);
    await this.ensureReleaseExists(releaseId);
    return await this.storefrontDao.getRelease(storeId, releaseId);
  };
}

const storefrontService = new StorefrontService(storefrontDao);
export default storefrontService;
