import { Knex } from 'knex';

interface ReleaseQueryOptions {
  withLayouts?: boolean;
  withThemeSettings?: boolean;
}

export const getReleasesQueryBuilder = (
  knex: Knex,
  options?: ReleaseQueryOptions,
): Knex.QueryBuilder => {
  const query = knex({ sr: 'storefront_releases' })
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
        knex.raw(`
						COALESCE(
							jsonb_agg(
								jsonb_build_object(
									'id', pl.id,
									'type', pl.type,
									'name', pl.name,
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
      knex.raw(`
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
