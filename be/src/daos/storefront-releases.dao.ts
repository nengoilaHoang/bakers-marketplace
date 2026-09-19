import { Knex } from 'knex';
import database from '#/db/index.js';

export class StorefrontReleaseDao {
	constructor(private readonly knex: Knex) {}

	public checkIfExists = async (releaseId: string, storeId?: string) => {
		const rawRecord = await this.knex
			.select('*')
			.from('storefront_releases')
			.where({ id: releaseId, storefrontId: storeId })
			.first();

		return !!rawRecord;
	};
}

const storefrontReleaseDao = new StorefrontReleaseDao(database.instance);
export default storefrontReleaseDao;
