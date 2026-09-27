import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema
		.createTable('auth_accounts', (table) => {
			table
				.uuid('id')
				.primary()
				.defaultTo(knex.raw('gen_random_uuid()'));

			table
				.uuid('user_id')
				.notNullable()
				.unique();

			table
				.enum('provider', ['GOOGLE'], {
					useNative: true,
					enumName: 'auth_provider',
				})
				.notNullable();

			table
				.text('provider_user_id')
				.notNullable();

			table
				.timestamp('created_at', { useTz: true })
				.notNullable()
				.defaultTo(knex.fn.now());

			table
				.timestamp('updated_at', { useTz: true })
				.notNullable()
				.defaultTo(knex.fn.now());

			table
				.foreign('user_id', 'fk_auth_accounts_user')
				.references('id')
				.inTable('users')
				.onDelete('CASCADE');

			table.unique(['provider', 'provider_user_id'], {
				indexName: 'uq_auth_accounts_provider_identity',
				useConstraint: true,
			});
		})
		.createTable('sessions', (table) => {
			table
				.uuid('id')
				.primary()
				.defaultTo(knex.raw('gen_random_uuid()'));

			table
				.uuid('user_id')
				.notNullable();

			table
				.text('refresh_token_hash')
				.notNullable()
				.unique();

			table
				.timestamp('created_at', { useTz: true })
				.notNullable()
				.defaultTo(knex.fn.now());

			table
				.timestamp('updated_at', { useTz: true })
				.notNullable()
				.defaultTo(knex.fn.now());

			table
				.foreign('user_id', 'fk_sessions_user')
				.references('id')
				.inTable('users')
				.onDelete('CASCADE');

			table.index(['user_id'], 'idx_sessions_user_id');
		});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema
		.dropTableIfExists('sessions')
		.dropTableIfExists('auth_accounts');

	await knex.raw('DROP TYPE IF EXISTS auth_provider;');
}
