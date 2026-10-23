import type { Knex } from 'knex';

/**
 * JavaScript Date and JSON preserve milliseconds, while PostgreSQL timestamps
 * default to microseconds. Keyset cursors must compare the exact value returned
 * to the client, so store post creation times at the same precision.
 */
export async function up(knex: Knex): Promise<void> {
	await knex.raw(`
		ALTER TABLE posts
		ALTER COLUMN created_at TYPE timestamptz(3)
		USING date_trunc('milliseconds', created_at);
	`);
}

export async function down(knex: Knex): Promise<void> {
	// Increasing precision restores the schema capability, but truncated
	// microseconds from the up migration cannot be reconstructed.
	await knex.raw(`
		ALTER TABLE posts
		ALTER COLUMN created_at TYPE timestamptz(6)
		USING created_at;
	`);
}
