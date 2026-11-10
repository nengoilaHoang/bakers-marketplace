import database from '#/db/index.js';
import { StorefrontReleaseSchema } from '#/models/storefronts/storefront-releases.model.js';
import { Knex } from 'knex';
import { getReleasesQueryBuilder } from './queryBuiler.js';

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

  /**
   * Checks if the release exists and belongs to the specified vendor
   */
  public checkOwnership = async (
    releaseId: string,
    vendorId: string,
  ): Promise<boolean> => {
    const record = await this.knex('storefront_releases as sr')
      .join('storefronts as s', 's.id', 'sr.storefrontId')
      .join('brands as b', 'b.id', 's.brandId')
      .select('sr.id')
      .where({
        'sr.id': releaseId,
        'b.vendorId': vendorId,
      })
      .first();

    return Boolean(record);
  };

  public getRelease = async (releaseId: string) => {
    const rawData = await getReleasesQueryBuilder(this.knex, {
      withLayouts: true,
      withThemeSettings: true,
    })
      .where({ 'sr.id': releaseId })
      .first();

    if (!rawData) {
      return null;
    }

    return StorefrontReleaseSchema.parse(rawData);
  };
}

const storefrontReleaseDao = new StorefrontReleaseDao(database.instance);
export default storefrontReleaseDao;
