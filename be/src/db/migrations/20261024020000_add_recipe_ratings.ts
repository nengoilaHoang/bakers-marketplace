import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('recipe_ratings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('recipe_id').notNullable().references('id').inTable('recipes').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.specificType('rating', 'smallint').notNullable();
    table.text('comment').nullable();
    table.timestamp('created_at', { useTz: true, precision: 3 }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true, precision: 3 }).notNullable().defaultTo(knex.fn.now());
    table.unique(['recipe_id', 'user_id'], { indexName: 'uq_recipe_ratings_recipe_user' });
    table.check('rating BETWEEN 1 AND 5', [], 'recipe_ratings_valid_rating');
    table.check('comment IS NULL OR char_length(comment) <= 2000', [], 'recipe_ratings_comment_length');
    table.index(['user_id'], 'idx_recipe_ratings_user_id');
  });
  await knex.raw('CREATE INDEX idx_recipe_ratings_recipe_created_at ON recipe_ratings (recipe_id, created_at DESC, id DESC)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('recipe_ratings');
}
