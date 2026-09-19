import storefrontDao, { StorefrontDao } from '#/daos/storefronts.dao.js';
import { StorefrontRelease } from '#/models/storefronts/storefront-releases.model.js';
import { NotFoundError } from '#/utils/http-errors.js';

export class StorefrontService {
	constructor(private readonly storefrontDao: StorefrontDao) {}

	public ensureExists = async (id: string): Promise<void> => {
		const exists = await this.storefrontDao.checkIfExists(id);
		if (!exists) {
			throw new NotFoundError(`Storefront with ${id} does not exists.`);
		}
	};

	public getActiveRelease = async (
		id: string,
	): Promise<StorefrontRelease | null> => {
		return await this.storefrontDao.getActiveRelease(id);
	};
}

const storefrontService = new StorefrontService(storefrontDao);
export default storefrontService;
