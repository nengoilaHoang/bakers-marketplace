import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE user_role AS ENUM (
      'CUSTOMER',
      'BAKER',
      'VENDER',
      'ADMIN'
    );
  `);

  await knex.schema
    .createTable('users', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .text('email')
        .notNullable()
        .unique();

      table
        .text('displayname')
        .notNullable();

      table
        .text('password')
        .notNullable();

      table
        .specificType('role', 'user_role')
        .notNullable()
        .defaultTo('CUSTOMER');

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table
        .timestamp('updated_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
    })

    .createTable('images', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table.text('display_name');
      table.text('original_name');

      table
        .text('url')
        .notNullable();

      table.text('content_type');

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
    })

    .createTable('recipes', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('cover_img_id')
        .references('id')
        .inTable('images')
        .onDelete('SET NULL');

      table
        .uuid('user_id')
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');

      table
        .text('title')
        .notNullable();

      table.text('description');

      table.integer('portion');

      table
        .boolean('is_public')
        .notNullable()
        .defaultTo(false);

      table
        .boolean('is_snapshot')
        .notNullable()
        .defaultTo(false);

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table
        .timestamp('updated_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.check(
        'portion IS NULL OR portion > 0',
        [],
        'chk_recipes_portion_positive',
      );

      table.check(
        'NOT is_snapshot OR is_public',
        [],
        'chk_recipes_snapshot_public',
      );

      table.index(
        ['cover_img_id'],
        'idx_recipes_cover_img_id',
      );

      table.index(
        ['user_id'],
        'idx_recipes_user_id',
      );
    })

    .createTable('steps', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('recipe_id')
        .notNullable()
        .references('id')
        .inTable('recipes')
        .onDelete('CASCADE');

      table
        .integer('step_order')
        .notNullable();

      table
        .text('description')
        .notNullable();

      table.check(
        'step_order > 0',
        [],
        'chk_steps_order_positive',
      );

      table.unique(
        ['recipe_id', 'step_order'],
        {
          indexName: 'uq_steps_recipe_order',
        },
      );
    })

    .createTable('recipe_ingredients', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('recipe_id')
        .notNullable()
        .references('id')
        .inTable('recipes')
        .onDelete('CASCADE');

      table
        .uuid('cover_img_id')
        .references('id')
        .inTable('images')
        .onDelete('SET NULL');

      table
        .text('name')
        .notNullable();

      table.decimal('amount', 12, 3);

      table.text('unit');

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.check(
        'amount IS NULL OR amount >= 0',
        [],
        'chk_recipe_ingredients_amount',
      );

      table.index(
        ['recipe_id'],
        'idx_recipe_ingredients_recipe_id',
      );

      table.index(
        ['cover_img_id'],
        'idx_recipe_ingredients_cover_img_id',
      );
    })

    .createTable('recipe_tools', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('recipe_id')
        .notNullable()
        .references('id')
        .inTable('recipes')
        .onDelete('CASCADE');

      table
        .uuid('cover_img_id')
        .references('id')
        .inTable('images')
        .onDelete('SET NULL');

      table
        .text('name')
        .notNullable();

      table.decimal('amount', 12, 3);

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.check(
        'amount IS NULL OR amount >= 0',
        [],
        'chk_recipe_tools_amount',
      );

      table.index(
        ['recipe_id'],
        'idx_recipe_tools_recipe_id',
      );

      table.index(
        ['cover_img_id'],
        'idx_recipe_tools_cover_img_id',
      );
    })

    .createTable('recipe_notes', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('recipe_id')
        .notNullable()
        .references('id')
        .inTable('recipes')
        .onDelete('CASCADE');

      table
        .text('content')
        .notNullable();

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.index(
        ['recipe_id'],
        'idx_recipe_notes_recipe_id',
      );
    })

    .createTable('recipe_tags', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('recipe_id')
        .notNullable()
        .references('id')
        .inTable('recipes')
        .onDelete('CASCADE');

      table
        .text('name')
        .notNullable();

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.unique(
        ['recipe_id', 'name'],
        {
          indexName: 'uq_recipe_tags_recipe_name',
        },
      );
    });

  await knex.raw(`
    CREATE INDEX idx_recipes_public_created_id
    ON recipes (created_at DESC, id DESC)
    WHERE is_public = TRUE;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .dropTableIfExists('recipe_tags')
    .dropTableIfExists('recipe_notes')
    .dropTableIfExists('recipe_tools')
    .dropTableIfExists('recipe_ingredients')
    .dropTableIfExists('steps')
    .dropTableIfExists('recipes')
    .dropTableIfExists('images')
    .dropTableIfExists('users');

  await knex.raw(`
    DROP TYPE IF EXISTS user_role;
  `);
}