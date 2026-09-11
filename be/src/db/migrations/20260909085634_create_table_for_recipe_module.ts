import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE EXTENSION IF NOT EXISTS unaccent;

    CREATE TEXT SEARCH CONFIGURATION public.recipe_vi_simple
      (COPY = pg_catalog.simple);

    ALTER TEXT SEARCH CONFIGURATION public.recipe_vi_simple
      ALTER MAPPING FOR hword, hword_part, word
      WITH unaccent, simple;
  `);

  await knex.schema
    .createTable('authors', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.text('display_name').notNullable();
      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
    })

    .createTable('images', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.text('display_name');
      table.text('original_name');
      table.text('url').notNullable();
      table.text('content_type');
      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
    })

    .createTable('recipes', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('cover_img_id')
        .references('id')
        .inTable('images')
        .onDelete('SET NULL');

      table.text('title').notNullable();
      table.text('description');
      table.integer('portion');

      table
        .uuid('author_id')
        .references('id')
        .inTable('authors')
        .onDelete('SET NULL');

      table.boolean('is_public').notNullable().defaultTo(false);
      table.boolean('is_snapshot').notNullable().defaultTo(false);

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table
        .specificType('search_vector', 'tsvector')
        .notNullable()
        .defaultTo(knex.raw(`''::tsvector`));

      table.check(
        'portion IS NULL OR portion > 0',
        [],
        'chk_recipes_portion_positive',
      );

      // Snapshot luôn phải public.
      table.check(
        'NOT is_snapshot OR is_public',
        [],
        'chk_recipes_snapshot_public',
      );

      table.index(['cover_img_id'], 'idx_recipes_cover_img_id');
      table.index(['author_id'], 'idx_recipes_author_id');
    })

    .createTable('steps', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('recipe_id')
        .notNullable()
        .references('id')
        .inTable('recipes')
        .onDelete('CASCADE');

      table.integer('step_order').notNullable();
      table.text('description').notNullable();

      table.check(
        'step_order > 0',
        [],
        'chk_steps_order_positive',
      );

      table.unique(['recipe_id', 'step_order'], {
        indexName: 'uq_steps_recipe_order',
      });
    })

    .createTable('recipe_ingredients', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

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

      table.text('name').notNullable();
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
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

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

      table.text('name').notNullable();
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
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('recipe_id')
        .notNullable()
        .references('id')
        .inTable('recipes')
        .onDelete('CASCADE');

      table.text('content').notNullable();

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
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('recipe_id')
        .notNullable()
        .references('id')
        .inTable('recipes')
        .onDelete('CASCADE');

      table.text('name').notNullable();

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.unique(['recipe_id', 'name'], {
        indexName: 'uq_recipe_tags_recipe_name',
      });
    });

  // Feed public dùng keyset pagination: (created_at, id).
  await knex.raw(`
    CREATE INDEX idx_recipes_public_created_id
      ON recipes (created_at DESC, id DESC)
      WHERE is_public = TRUE;
  `);

  // A = 5, B = 3, D = 1.
  await knex.raw(`
    CREATE OR REPLACE FUNCTION build_recipe_search_vector(
      p_recipe_id UUID
    )
    RETURNS TSVECTOR
    LANGUAGE SQL
    STABLE
    AS $$
      SELECT
        setweight(
          to_tsvector(
            'public.recipe_vi_simple',
            COALESCE(r.title, '')
          ),
          'A'
        )

        ||

        setweight(
          to_tsvector(
            'public.recipe_vi_simple',
            COALESCE((
              SELECT string_agg(t.name, ' ')
              FROM recipe_tags t
              WHERE t.recipe_id = r.id
            ), '')
          ),
          'A'
        )

        ||

        setweight(
          to_tsvector(
            'public.recipe_vi_simple',
            COALESCE(a.display_name, '')
          ),
          'B'
        )

        ||

        setweight(
          to_tsvector(
            'public.recipe_vi_simple',
            COALESCE(r.description, '')
          ),
          'B'
        )

        ||

        setweight(
          to_tsvector(
            'public.recipe_vi_simple',
            COALESCE((
              SELECT string_agg(
                i.name || ' ' ||
                COALESCE(i.amount::TEXT, '') || ' ' ||
                COALESCE(i.unit, ''),
                ' '
              )
              FROM recipe_ingredients i
              WHERE i.recipe_id = r.id
            ), '')
          ),
          'D'
        )

        ||

        setweight(
          to_tsvector(
            'public.recipe_vi_simple',
            COALESCE((
              SELECT string_agg(
                t.name || ' ' ||
                COALESCE(t.amount::TEXT, ''),
                ' '
              )
              FROM recipe_tools t
              WHERE t.recipe_id = r.id
            ), '')
          ),
          'D'
        )

        ||

        setweight(
          to_tsvector(
            'public.recipe_vi_simple',
            COALESCE((
              SELECT string_agg(
                s.description,
                ' ' ORDER BY s.step_order
              )
              FROM steps s
              WHERE s.recipe_id = r.id
            ), '')
          ),
          'D'
        )

        ||

        setweight(
          to_tsvector(
            'public.recipe_vi_simple',
            COALESCE((
              SELECT string_agg(n.content, ' ')
              FROM recipe_notes n
              WHERE n.recipe_id = r.id
            ), '')
          ),
          'D'
        )
      FROM recipes r
      LEFT JOIN authors a
        ON a.id = r.author_id
      WHERE r.id = p_recipe_id;
    $$;
  `);

  await knex.raw(`
    CREATE OR REPLACE FUNCTION refresh_recipe_search_vector(
      p_recipe_id UUID
    )
    RETURNS VOID
    LANGUAGE PLPGSQL
    AS $$
    BEGIN
      UPDATE recipes
      SET search_vector = COALESCE(
        build_recipe_search_vector(p_recipe_id),
        ''::TSVECTOR
      )
      WHERE id = p_recipe_id;
    END;
    $$;
  `);

  await knex.raw(`
    CREATE OR REPLACE FUNCTION trg_refresh_recipe_search()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
    AS $$
    BEGIN
      PERFORM refresh_recipe_search_vector(NEW.id);
      RETURN NEW;
    END;
    $$;

    CREATE TRIGGER trg_recipes_search_insert
    AFTER INSERT ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION trg_refresh_recipe_search();

    CREATE TRIGGER trg_recipes_search_update
    AFTER UPDATE OF title, description, author_id
    ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION trg_refresh_recipe_search();
  `);

  await knex.raw(`
    CREATE OR REPLACE FUNCTION trg_refresh_recipe_search_from_child()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
    AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        PERFORM refresh_recipe_search_vector(NEW.recipe_id);
        RETURN NEW;
      END IF;

      IF TG_OP = 'DELETE' THEN
        PERFORM refresh_recipe_search_vector(OLD.recipe_id);
        RETURN OLD;
      END IF;

      PERFORM refresh_recipe_search_vector(NEW.recipe_id);

      IF NEW.recipe_id IS DISTINCT FROM OLD.recipe_id THEN
        PERFORM refresh_recipe_search_vector(OLD.recipe_id);
      END IF;

      RETURN NEW;
    END;
    $$;

    CREATE TRIGGER trg_steps_search
    AFTER INSERT OR UPDATE OR DELETE ON steps
    FOR EACH ROW
    EXECUTE FUNCTION trg_refresh_recipe_search_from_child();

    CREATE TRIGGER trg_recipe_ingredients_search
    AFTER INSERT OR UPDATE OR DELETE ON recipe_ingredients
    FOR EACH ROW
    EXECUTE FUNCTION trg_refresh_recipe_search_from_child();

    CREATE TRIGGER trg_recipe_tools_search
    AFTER INSERT OR UPDATE OR DELETE ON recipe_tools
    FOR EACH ROW
    EXECUTE FUNCTION trg_refresh_recipe_search_from_child();

    CREATE TRIGGER trg_recipe_notes_search
    AFTER INSERT OR UPDATE OR DELETE ON recipe_notes
    FOR EACH ROW
    EXECUTE FUNCTION trg_refresh_recipe_search_from_child();

    CREATE TRIGGER trg_recipe_tags_search
    AFTER INSERT OR UPDATE OR DELETE ON recipe_tags
    FOR EACH ROW
    EXECUTE FUNCTION trg_refresh_recipe_search_from_child();
  `);

  await knex.raw(`
    CREATE OR REPLACE FUNCTION trg_refresh_recipe_search_from_author()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
    AS $$
    DECLARE
      recipe UUID;
    BEGIN
      IF NEW.display_name IS DISTINCT FROM OLD.display_name THEN
        FOR recipe IN
          SELECT id
          FROM recipes
          WHERE author_id = NEW.id
        LOOP
          PERFORM refresh_recipe_search_vector(recipe);
        END LOOP;
      END IF;

      RETURN NEW;
    END;
    $$;

    CREATE TRIGGER trg_author_search
    AFTER UPDATE OF display_name ON authors
    FOR EACH ROW
    EXECUTE FUNCTION trg_refresh_recipe_search_from_author();
  `);

  await knex.raw(`
    UPDATE recipes r
    SET search_vector = COALESCE(
      build_recipe_search_vector(r.id),
      ''::TSVECTOR
    );

    CREATE INDEX idx_recipes_search_vector_gin
      ON recipes
      USING GIN(search_vector);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TRIGGER IF EXISTS trg_author_search ON authors;

    DROP TRIGGER IF EXISTS trg_recipe_tags_search ON recipe_tags;
    DROP TRIGGER IF EXISTS trg_recipe_notes_search ON recipe_notes;
    DROP TRIGGER IF EXISTS trg_recipe_tools_search ON recipe_tools;
    DROP TRIGGER IF EXISTS trg_recipe_ingredients_search ON recipe_ingredients;
    DROP TRIGGER IF EXISTS trg_steps_search ON steps;

    DROP TRIGGER IF EXISTS trg_recipes_search_update ON recipes;
    DROP TRIGGER IF EXISTS trg_recipes_search_insert ON recipes;

    DROP FUNCTION IF EXISTS trg_refresh_recipe_search_from_author();
    DROP FUNCTION IF EXISTS trg_refresh_recipe_search_from_child();
    DROP FUNCTION IF EXISTS trg_refresh_recipe_search();
    DROP FUNCTION IF EXISTS refresh_recipe_search_vector(UUID);
    DROP FUNCTION IF EXISTS build_recipe_search_vector(UUID);
  `);

  await knex.schema
    .dropTableIfExists('recipe_tags')
    .dropTableIfExists('recipe_notes')
    .dropTableIfExists('recipe_tools')
    .dropTableIfExists('recipe_ingredients')
    .dropTableIfExists('steps')
    .dropTableIfExists('recipes')
    .dropTableIfExists('images')
    .dropTableIfExists('authors');

  await knex.raw(`
    DROP TEXT SEARCH CONFIGURATION IF EXISTS public.recipe_vi_simple;
  `);

  // Không drop pgcrypto/unaccent vì có thể được dùng bởi migration/module khác.
}
