import database from '#/db/index.js';
import { StorefrontReleaseSchema } from '#/models/storefronts/storefront-releases.model.js';
import { Storefront } from '#/models/storefronts/storefronts.model.js';
import { Knex } from 'knex';
import z from 'zod';
import { getReleasesQueryBuilder } from './queryBuiler.js';

export class StorefrontDao {
  constructor(private readonly knex: Knex) {}

  public checkIfStoreExists = async (id: string): Promise<boolean> => {
    const rawRecord = await this.knex
      .select('*')
      .from('storefronts')
      .where({ id })
      .first();

    return Boolean(rawRecord);
  };

  /**
   * Checks if the storefront exists and belongs to the specified vendor
   */
  public checkOwnership = async (
    storeId: string,
    vendorId: string,
  ): Promise<boolean> => {
    const record = await this.knex('storefronts as s')
      .join('brands as b', 'b.id', 's.brandId')
      .select('s.id')
      .where({
        's.id': storeId,
        'b.vendorId': vendorId,
      })
      .first();

    return Boolean(record);
  };

  public getVendorStorefront = async (
    vendorId: string,
    simple: boolean = false,
  ): Promise<Storefront | null> => {
    const [storefront] = await this.knex
      .from({ s: 'storefronts', b: 'brands' })
      .where('s.brandId', this.knex.ref('b.id'))
      .where({ 'b.vendorId': vendorId })
      .select('s.*');

    if (!storefront) return null;

    const releases = await getReleasesQueryBuilder(this.knex, {
      withThemeSettings: true,
      withLayouts: !simple,
    }).whereIn('sr.storefrontId', storefront.id);

    const formattedReleases = z.array(StorefrontReleaseSchema).parse(releases);

    return {
      ...storefront,
      releases: formattedReleases ?? [],
    };
  };

  public getActiveRelease = async (storeId: string) => {
    const rawData = await getReleasesQueryBuilder(this.knex, {
      withLayouts: true,
      withThemeSettings: true,
    })
      .where({ 'sr.storefrontId': storeId, 'sr.isActive': true })
      .first();

    if (!rawData) {
      return null;
    }

    return StorefrontReleaseSchema.parse(rawData);
  };
}

const storefrontDao = new StorefrontDao(database.instance);
export default storefrontDao;
