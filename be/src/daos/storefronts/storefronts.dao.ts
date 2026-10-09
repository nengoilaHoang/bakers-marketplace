import database from '#/db/index.js';
import {
	StorefrontReleaseSchema,
	StorefrontReleaseSummary,
	StorefrontReleaseSummarySchema,
} from '#/models/storefronts/storefront-releases.model.js';
import { Knex } from 'knex';
import z from 'zod';

interface ReleaseQueryOptions {
  withLayouts?: boolean;
  withThemeSettings?: boolean;
}

export class StorefrontDao {
  constructor(private readonly knex: Knex) {}

  public checkIfStoreExists = async (id: string): Promise<boolean> => {
    const rawRecord = await this.knex
      .select('*')
      .from('storefronts')
      .where({ id })
      .first();

    return !!rawRecord;
  };

  public checkIfReleaseExists = async (id: string): Promise<boolean> => {
    const rawRecord = await this.knex
      .select('*')
      .from('storefront_releases')
      .where({ id })
      .first();

    return !!rawRecord;
  };

  private readonly getReleasesQueryBuilder = (
    options?: ReleaseQueryOptions,
  ): Knex.QueryBuilder => {
    const query = this.knex({ sr: 'storefront_releases' })
      .select(
        'sr.id',
        'sr.version',
        'sr.storefrontId',
        'sr.displayName',
        'sr.updatedAt',
        'sr.createdAt',
        'sr.isActive',
      )
      .groupBy('sr.id');

    if (!options) return query;
    if (options.withLayouts) {
      query
        .select(
          this.knex.raw(`
						COALESCE(
							jsonb_agg(
								jsonb_build_object(
									'id', pl.id,
									'type', pl.type,
									'root', CASE
										WHEN pl.root_component_id IS NOT NULL 
										THEN get_layout_tree_json(pl.root_component_id)
										ELSE NULL
									END
								)
							) FILTER (WHERE pl.id IS NOT NULL),
							'[]'::jsonb
						) AS layouts
				`),
        )
        .leftJoin('page_layouts as pl', 'pl.storefrontReleaseId', 'sr.id');
    }

    if (options.withThemeSettings) {
      query.select(
        this.knex.raw(`
					(
						SELECT jsonb_build_object(
							'id', ts.id,
							'typography', jsonb_build_object(
								'id', typ.id,
								'headingFont', typ.heading_font,
								'bodyFont', typ.body_font,
								'headingWeight', typ.heading_weight,
								'bodyWeight', typ.body_weight,
								'headingLineHeight', typ.heading_line_height::float,
								'bodyLineHeight', typ.body_line_height::float,
								'headingLetterSpacing', typ.heading_letter_spacing::float,
								'bodyLetterSpacing', typ.body_letter_spacing::float
							),
							'colorPalette', jsonb_build_object(
								'id', cp.id,
								'colorBackground', cp.color_background,
								'colorSurface', cp.color_surface,
								'colorBorder', cp.color_border,
								'colorTextPrimary', cp.color_text_primary,
								'colorTextSecondary', cp.color_text_secondary,
								'colorPrimary', cp.color_primary,
								'colorPrimaryForeground', cp.color_primary_foreground,
								'colorSecondary', cp.color_secondary,
								'colorSecondaryForeground', cp.color_secondary_foreground,
								'colorAccent', cp.color_accent,
								'colorAccentForeground', cp.color_accent_foreground
							)
						)
						FROM theme_settings ts
						LEFT JOIN typography typ ON typ.id = ts.id
						LEFT JOIN color_palettes cp ON cp.id = ts.id
						WHERE ts.id = sr.id
					) AS "themeSettings"
				`),
      );
    }

    return query;
  };

  public getVendorStorefronts = async (vendorId: string) => {
    const storefronts = await this.knex
      .from({ s: 'storefronts', b: 'brands' })
      .where('s.brandId', this.knex.ref('b.id'))
      .where({ 'b.vendorId': vendorId })
      .select('s.*');

    if (!storefronts.length) return [];

    const storefrontIds = storefronts.map((s) => s.id);

    const releases = await this.getReleasesQueryBuilder({
      withThemeSettings: true,
    }).whereIn('sr.storefrontId', storefrontIds);

    const formattedReleases = z
      .array(StorefrontReleaseSummarySchema)
      .parse(releases);

    const releasesByStorefront = formattedReleases.reduce<
      Record<string, StorefrontReleaseSummary[]>
    >((acc, release) => {
      acc[release.storefrontId] = acc[release.storefrontId] || [];
      acc[release.storefrontId].push(release);
      return acc;
    }, {});

    return storefronts.map((storefront) => {
      return {
        ...storefront,
        releases: releasesByStorefront[storefront.id] || [],
      };
    });
  };

  public getRelease = async (storeId: string, releaseId: string) => {
    const rawData = await this.getReleasesQueryBuilder({
      withLayouts: true,
      withThemeSettings: true,
    })
      .where({ 'sr.id': releaseId, 'sr.storefrontId': storeId })
      .first();

    if (!rawData) {
      return null;
    }

    return StorefrontReleaseSchema.parse(rawData);
  };

  public getActiveRelease = async (storeId: string) => {
    const rawData = await this.getReleasesQueryBuilder({
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
