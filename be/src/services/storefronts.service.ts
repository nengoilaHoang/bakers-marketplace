import storefrontDao, {
	StorefrontDao,
} from '#/daos/storefronts/storefronts.dao.js';
import { StorefrontRelease } from '#/models/storefronts/storefront-releases.model.js';
import { Storefront } from '#/models/storefronts/storefronts.model.js';
import { NotFoundError } from '#/utils/http-errors.js';

export class StorefrontService {
  constructor(private readonly storefrontDao: StorefrontDao) {}

  public ensureExists = async (id: string): Promise<void> => {
    const exists = await this.storefrontDao.checkIfStoreExists(id);
    if (!exists) {
      throw new NotFoundError(`Storefront with ${id} does not exists.`);
    }
  };

  public getVendorStorefront = async (
    vendorId: string,
    simple: boolean = false,
  ): Promise<Storefront | null> => {
    return await storefrontDao.getVendorStorefront(vendorId, simple);
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
}

const storefrontService = new StorefrontService(storefrontDao);
export default storefrontService;
