import { Knex } from 'knex';
import database from '#/db/index.js';
import { StorefrontReleaseSchema } from '#/models/storefronts/storefront-releases.model.js';

export class StorefrontDao {
	constructor(private readonly knex: Knex) {}

	public checkIfExists = async (id: string) => {
		const rawRecord = await this.knex
			.select('*')
			.from('storefronts')
			.where({ id })
			.first();

		return !!rawRecord;
	};

	public getRelease = async (storeId: string, releaseId: string) => {
		const rawData = await this.knex({ sr: 'storefront_releases' })
			.select(
				'sr.id',
				'sr.version',
				'sr.displayName',
				'sr.updatedAt',
				'sr.createdAt',
				'sr.isActive',
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
								'colorBackground', lpad(to_hex(cp.color_background), 6, '0'),
								'colorSurface', lpad(to_hex(cp.color_surface), 6, '0'),
								'colorBorder', lpad(to_hex(cp.color_border), 6, '0'),
								'colorTextPrimary', lpad(to_hex(cp.color_text_primary), 6, '0'),
								'colorTextSecondary', lpad(to_hex(cp.color_text_secondary), 6, '0'),
								'colorPrimary', lpad(to_hex(cp.color_primary), 6, '0'),
								'colorPrimaryForeground', lpad(to_hex(cp.color_primary_foreground), 6, '0'),
								'colorSecondary', lpad(to_hex(cp.color_secondary), 6, '0'),
								'colorSecondaryForeground', lpad(to_hex(cp.color_secondary_foreground), 6, '0'),
								'colorAccent', lpad(to_hex(cp.color_accent), 6, '0'),
								'colorAccentForeground', lpad(to_hex(cp.color_accent_foreground), 6, '0')
							)
						)
						FROM theme_settings ts
						LEFT JOIN typography typ ON typ.id = ts.id
						LEFT JOIN color_palettes cp ON cp.id = ts.id
						WHERE ts.id = sr.id
					) AS "themeSettings"
				`),
			)
			.leftJoin('page_layouts as pl', 'pl.storefrontReleaseId', 'sr.id')
			.where({
				'sr.id': releaseId,
				'sr.storefrontId': storeId,
				'sr.isActive': true,
			})
			.groupBy('sr.id')
			.first();

		if (!rawData) {
			return null;
		}

		return StorefrontReleaseSchema.parse(rawData);
	};

	public getActiveRelease = async (id: string) => {
		const rawData = await this.knex({ sr: 'storefront_releases' })
			.select(
				'sr.id',
				'sr.version',
				'sr.displayName',
				'sr.updatedAt',
				'sr.createdAt',
				'sr.isActive',
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
								'colorBackground', lpad(to_hex(cp.color_background), 6, '0'),
								'colorSurface', lpad(to_hex(cp.color_surface), 6, '0'),
								'colorBorder', lpad(to_hex(cp.color_border), 6, '0'),
								'colorTextPrimary', lpad(to_hex(cp.color_text_primary), 6, '0'),
								'colorTextSecondary', lpad(to_hex(cp.color_text_secondary), 6, '0'),
								'colorPrimary', lpad(to_hex(cp.color_primary), 6, '0'),
								'colorPrimaryForeground', lpad(to_hex(cp.color_primary_foreground), 6, '0'),
								'colorSecondary', lpad(to_hex(cp.color_secondary), 6, '0'),
								'colorSecondaryForeground', lpad(to_hex(cp.color_secondary_foreground), 6, '0'),
								'colorAccent', lpad(to_hex(cp.color_accent), 6, '0'),
								'colorAccentForeground', lpad(to_hex(cp.color_accent_foreground), 6, '0')
							)
						)
						FROM theme_settings ts
						LEFT JOIN typography typ ON typ.id = ts.id
						LEFT JOIN color_palettes cp ON cp.id = ts.id
						WHERE ts.id = sr.id
					) AS "themeSettings"
				`),
			)
			.leftJoin('page_layouts as pl', 'pl.storefrontReleaseId', 'sr.id')
			.where({
				'sr.storefrontId': id,
				'sr.isActive': true,
			})
			.groupBy('sr.id')
			.first();

		if (!rawData) {
			return null;
		}

		return StorefrontReleaseSchema.parse(rawData);
	};
}

const storefrontDao = new StorefrontDao(database.instance);
export default storefrontDao;
