import database from '#/db/index.js';
import { BrandPublicViewSchema } from '#/models/storefronts/brands.model.js';
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
    }).where('sr.storefrontId', storefront.id);

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

  public getStorefrontPage = async (domain: string, slug?: string) => {
    const rawData = await getReleasesQueryBuilder(this.knex, {
      withLayouts: true,
      withThemeSettings: true,
    })
      .leftJoin('storefronts as s', 's.id', 'sr.storefrontId')
      .leftJoin('brands as b', 'b.id', 's.brandId')
      .leftJoin('files as logo_file', 'logo_file.id', 'b.logo')
      .leftJoin('files as favicon_file', 'favicon_file.id', 'b.favicon')
      .select(
        this.knex.raw(`
          jsonb_build_object(
            'id', b.id,
            'name', b.name,
            'vendorId', b.vendor_id,
            'domain', b.domain,
            'logoUrl', logo_file.url,
            'faviconUrl', favicon_file.url
          ) AS brand
        `),
      )
      .groupBy('b.id', 'logo_file.url', 'favicon_file.url')
      .where({ 'b.domain': domain, 'sr.isActive': true })
      .modify((qb) => {
        if (slug) {
          qb.where('pl.name', slug);
        } else {
          qb.where('pl.type', 'HOME');
        }
      })
      .first();

    if (!rawData) {
      return null;
    }

    const release = StorefrontReleaseSchema.parse(rawData);
    const brand = BrandPublicViewSchema.parse(rawData.brand);
    const layout = release.layouts[0] ?? null;

    if (!layout) {
      return null;
    }

    return {
      brand,
      themeSettings: release.themeSettings,
      layout,
    };
  };
}

const storefrontDao = new StorefrontDao(database.instance);
export default storefrontDao;
