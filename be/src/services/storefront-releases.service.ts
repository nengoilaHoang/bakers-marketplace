import storefrontReleaseDao, {
	StorefrontReleaseDao,
} from '#/daos/storefront-releases.dao.js';
import { NotFoundError } from '#/utils/http-errors.js';

export class StorefrontReleaseService {
	constructor(private readonly storefrontReleaseDao: StorefrontReleaseDao) {}

	public ensureBelongsTo = async (
		releaseId: string,
		storeId: string,
	): Promise<void> => {
		const exists = await this.storefrontReleaseDao.checkIfExists(
			releaseId,
			storeId,
		);
		if (!exists) {
			throw new NotFoundError(
				`Release '${releaseId}' not found for store '${storeId}'`,
			);
		}
	};

	public ensureExists = async (id: string): Promise<void> => {
		const exists = await this.storefrontReleaseDao.checkIfExists(id);
		if (exists) {
			throw new NotFoundError(`Storefront release with ${id} does not exists.`);
		}
	};
}

const storefrontReleaseService = new StorefrontReleaseService(
	storefrontReleaseDao,
);
export default storefrontReleaseService;
