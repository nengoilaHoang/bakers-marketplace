import type { Knex } from 'knex';

// Squashes add_user_social, add_recipe_ratings and align_social_rating_diagram.
// Creates their final schema directly; for databases without those migrations
// applied. Existing migration history must be reconciled separately, not reset.
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_follows', (table) => {
    table.uuid('follower_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('following_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.primary(['follower_id', 'following_id']);
    table.check('follower_id <> following_id', [], 'user_follows_no_self');
    table.index(['following_id'], 'idx_user_follows_following_id');
  });

  await knex.schema.alterTable('reports', (table) => {
    table.text('description').nullable();
    table.text('status').notNullable().defaultTo('PENDING');
    table.check("status IN ('PENDING', 'DISMISSED', 'RESOLVED')", [], 'reports_status_check');
    table.index(['reporter_id', 'status'], 'idx_reports_reporter_status');
    table.uuid('handled_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('handled_at', { useTz: true, precision: 3 }).nullable();
    table.text('note').nullable();
  });

  await knex.schema.createTable('user_reports', (table) => {
    table.uuid('id').primary().references('id').inTable('reports').onDelete('CASCADE');
    table.uuid('reported_user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.index(['reported_user_id'], 'idx_user_reports_target');
  });

  await knex.schema.alterTable('images', (table) => {
    table.integer('width').nullable();
    table.integer('height').nullable();
    table.check('width IS NULL OR width > 0', [], 'images_positive_width');
    table.check('height IS NULL OR height > 0', [], 'images_positive_height');
  });

  await knex.schema.createTable('ratings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('rater_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.specificType('rating', 'double precision').notNullable();
    table.text('comment').nullable();
    table.timestamp('rated_at', { useTz: true, precision: 3 }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true, precision: 3 }).notNullable().defaultTo(knex.fn.now());
    table.check('rating BETWEEN 1 AND 5', [], 'ratings_valid_rating');
    table.check('comment IS NULL OR char_length(comment) <= 2000', [], 'ratings_comment_length');
    table.unique(['id', 'rater_id'], { indexName: 'uq_ratings_id_rater' });
    table.index(['rater_id'], 'idx_ratings_rater_id');
  });
  await knex.raw('CREATE INDEX idx_ratings_rated_at ON ratings (rated_at DESC, id DESC)');

  await knex.schema.createTable('recipe_ratings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('recipe_id').notNullable().references('id').inTable('recipes').onDelete('CASCADE');
    table.uuid('rater_id').notNullable();
    table.foreign('rater_id', 'recipe_ratings_user_id_foreign')
      .references('id').inTable('users').onDelete('CASCADE');
    table.foreign(['id', 'rater_id'], 'fk_recipe_rating_base')
      .references(['id', 'rater_id']).inTable('ratings').onDelete('CASCADE');
    // Preserve index/constraint names from the previous migration chain.
    table.unique(['recipe_id', 'rater_id'], { indexName: 'uq_recipe_ratings_recipe_user' });
    table.index(['rater_id'], 'idx_recipe_ratings_user_id');
    table.index(['recipe_id', 'id'], 'idx_recipe_ratings_target');
  });

  await knex.schema.createTable('rating_media', (table) => {
    table.uuid('rating_id').notNullable().references('id').inTable('ratings').onDelete('CASCADE');
    table.uuid('image_id').notNullable().references('id').inTable('images').onDelete('CASCADE');
    table.integer('sort_order').notNullable();
    table.primary(['rating_id', 'image_id']);
    table.unique(['rating_id', 'sort_order']);
    table.check('sort_order >= 0', [], 'rating_media_valid_order');
  });

  // Recipe deletion also removes the base rating and its media associations.
  await knex.raw(`
    CREATE FUNCTION cleanup_recipe_rating_base() RETURNS trigger AS $$
    BEGIN
      DELETE FROM ratings WHERE id = OLD.id;
      RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;
    CREATE TRIGGER recipe_rating_cleanup AFTER DELETE ON recipe_ratings
    FOR EACH ROW EXECUTE FUNCTION cleanup_recipe_rating_base();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TRIGGER recipe_rating_cleanup ON recipe_ratings');
  await knex.raw('DROP FUNCTION cleanup_recipe_rating_base()');
  await knex.schema.dropTable('rating_media');
  await knex.schema.dropTable('recipe_ratings');
  await knex.schema.dropTable('ratings');

  await knex.schema.alterTable('images', (table) => {
    table.dropChecks('images_positive_width');
    table.dropChecks('images_positive_height');
    table.dropColumns('width', 'height');
  });

  await knex.schema.dropTable('user_reports');
  await knex.schema.alterTable('reports', (table) => {
    table.dropIndex(['reporter_id', 'status'], 'idx_reports_reporter_status');
    table.dropChecks('reports_status_check');
    table.dropColumns('description', 'status', 'handled_by', 'handled_at', 'note');
  });
  await knex.schema.dropTable('user_follows');
}
