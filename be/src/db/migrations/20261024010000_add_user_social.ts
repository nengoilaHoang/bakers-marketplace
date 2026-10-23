import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_follows', (table) => {
    table.uuid('follower_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('following_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.primary(['follower_id', 'following_id']);
    table.check('follower_id <> following_id', [], 'user_follows_no_self');
    // The primary key already indexes follower_id as its leading column.
    table.index(['following_id'], 'idx_user_follows_following_id');
  });

  await knex.schema.alterTable('reports', (table) => {
    table.text('description').nullable();
    table.text('status').notNullable().defaultTo('OPEN');
    table.check("status IN ('OPEN', 'RESOLVED', 'REJECTED')", [], 'reports_status_check');
    table.index(['reporter_id', 'status'], 'idx_reports_reporter_status');
  });

  await knex.schema.createTable('user_reports', (table) => {
    table.uuid('id').primary().references('id').inTable('reports').onDelete('CASCADE');
    table.uuid('reported_user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.index(['reported_user_id'], 'idx_user_reports_target');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_reports');
  await knex.schema.alterTable('reports', (table) => {
    table.dropIndex(['reporter_id', 'status'], 'idx_reports_reporter_status');
    table.dropChecks('reports_status_check');
    table.dropColumns('description', 'status');
  });
  await knex.schema.dropTableIfExists('user_follows');
}
