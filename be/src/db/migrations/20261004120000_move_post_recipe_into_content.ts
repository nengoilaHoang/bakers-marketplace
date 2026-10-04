import type { Knex } from 'knex';

// Same token as src/utils/post-content.ts, copied so this migration never changes.
const RECIPE_TOKEN_PATTERN =
	'\\[\\[recipe:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\\]\\]';

// A post now links to its recipe through a [[recipe:<id>]] token in its
// content instead of the posts.recipe_id foreign key.
export async function up(knex: Knex): Promise<void> {
	await knex.raw(
		`UPDATE posts
		SET content = rtrim(content) || E'\\n\\n[[recipe:' || recipe_id || ']]'
		WHERE recipe_id IS NOT NULL`,
	);

	// Dropping the column also drops its foreign key and unique constraint
	await knex.schema.alterTable('posts', (table) => {
		table.dropColumn('recipe_id');
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('posts', (table) => {
		table
			.uuid('recipe_id')
			.references('id')
			.inTable('recipes')
			.onDelete('SET NULL');
	});

	await knex.raw(
		`UPDATE posts p
		SET recipe_id = r.id
		FROM recipes r
		WHERE r.id = substring(p.content from ?)::uuid`,
		[RECIPE_TOKEN_PATTERN],
	);

	await knex.raw(
		`UPDATE posts
		SET content = regexp_replace(content, ?, '', 'g')`,
		[`\\s*${RECIPE_TOKEN_PATTERN}`],
	);

	await knex.schema.alterTable('posts', (table) => {
		table.unique(['recipe_id'], {
			indexName: 'uq_posts_recipe_id',
		});
	});
}
