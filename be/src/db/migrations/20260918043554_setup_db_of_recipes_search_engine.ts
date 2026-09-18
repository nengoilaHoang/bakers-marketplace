import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS unaccent;');

  await knex.schema.createTable('recipe_search', (table) => {
    table
      .uuid('recipe_id')
      .primary()
      .references('id')
      .inTable('recipes')
      .onDelete('CASCADE');

    table
      .specificType('search_vector', 'tsvector')
      .notNullable()
      .defaultTo(knex.raw("''::tsvector"));

    table
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });

  await knex.raw(`
    CREATE INDEX idx_recipe_search_vector_gin
    ON recipe_search
    USING GIN (search_vector);
  `);

  await knex.raw(`
    CREATE OR REPLACE FUNCTION normalize_recipe_search_value(p_value text)
    RETURNS text
    LANGUAGE sql
    STABLE
    AS $$
      SELECT lower(unaccent(trim(COALESCE(p_value, ''))));
    $$;
  `);

  await knex.raw(`
    CREATE OR REPLACE FUNCTION recipe_search_query(p_query text)
    RETURNS tsquery
    LANGUAGE sql
    STABLE
    AS $$
      SELECT websearch_to_tsquery(
        'simple',
        normalize_recipe_search_value(p_query)
      );
    $$;
  `);

  await knex.raw(`
    CREATE OR REPLACE FUNCTION refresh_recipe_search(p_recipe_id uuid)
    RETURNS void
    LANGUAGE plpgsql
    AS $$
    DECLARE
      v_title text;
      v_description text;
      v_tags text;
      v_search_vector tsvector;
    BEGIN
      SELECT
        r.title,
        COALESCE(r.description, '')
      INTO
        v_title,
        v_description
      FROM recipes r
      WHERE r.id = p_recipe_id;

      IF NOT FOUND THEN
        DELETE FROM recipe_search
        WHERE recipe_id = p_recipe_id;
        RETURN;
      END IF;

      SELECT COALESCE(
        string_agg(tag_name, ' ' ORDER BY tag_name),
        ''
      )
      INTO v_tags
      FROM (
        SELECT DISTINCT normalize_recipe_search_value(rt.name) AS tag_name
        FROM recipe_tags rt
        WHERE rt.recipe_id = p_recipe_id
          AND trim(COALESCE(rt.name, '')) <> ''
      ) tags;

      v_search_vector :=
          setweight(
            to_tsvector(
              'simple',
              normalize_recipe_search_value(v_title)
            ),
            'A'
          )
        || setweight(
            to_tsvector(
              'simple',
              COALESCE(v_tags, '')
            ),
            'B'
          )
        || setweight(
            to_tsvector(
              'simple',
              normalize_recipe_search_value(v_description)
            ),
            'C'
          );

      INSERT INTO recipe_search (
        recipe_id,
        search_vector,
        updated_at
      )
      VALUES (
        p_recipe_id,
        v_search_vector,
        now()
      )
      ON CONFLICT (recipe_id)
      DO UPDATE SET
        search_vector = EXCLUDED.search_vector,
        updated_at = now();
    END;
    $$;
  `);

  await knex.raw(`
    CREATE OR REPLACE FUNCTION trg_refresh_recipe_search_from_recipe()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      PERFORM refresh_recipe_search(NEW.id);
      RETURN NEW;
    END;
    $$;
  `);

  await knex.raw(`
    CREATE OR REPLACE FUNCTION trg_refresh_recipe_search_after_tag_insert_stmt()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
      v_recipe_id uuid;
    BEGIN
      FOR v_recipe_id IN
        SELECT DISTINCT recipe_id
        FROM new_rows
        WHERE recipe_id IS NOT NULL
      LOOP
        PERFORM refresh_recipe_search(v_recipe_id);
      END LOOP;

      RETURN NULL;
    END;
    $$;
  `);

  await knex.raw(`
    CREATE OR REPLACE FUNCTION trg_refresh_recipe_search_after_tag_delete_stmt()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
      v_recipe_id uuid;
    BEGIN
      FOR v_recipe_id IN
        SELECT DISTINCT recipe_id
        FROM old_rows
        WHERE recipe_id IS NOT NULL
      LOOP
        PERFORM refresh_recipe_search(v_recipe_id);
      END LOOP;

      RETURN NULL;
    END;
    $$;
  `);

  await knex.raw(`
    CREATE OR REPLACE FUNCTION trg_refresh_recipe_search_after_tag_update_stmt()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
      v_recipe_id uuid;
    BEGIN
      FOR v_recipe_id IN
        SELECT DISTINCT recipe_id
        FROM (
          SELECT recipe_id FROM old_rows
          UNION
          SELECT recipe_id FROM new_rows
        ) changed
        WHERE recipe_id IS NOT NULL
      LOOP
        PERFORM refresh_recipe_search(v_recipe_id);
      END LOOP;

      RETURN NULL;
    END;
    $$;
  `);

  await knex.raw(`
    CREATE TRIGGER trg_recipes_refresh_search_insert
    AFTER INSERT ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION trg_refresh_recipe_search_from_recipe();
  `);

  await knex.raw(`
    CREATE TRIGGER trg_recipes_refresh_search_update
    AFTER UPDATE OF title, description ON recipes
    FOR EACH ROW
    WHEN (
      OLD.title IS DISTINCT FROM NEW.title
      OR OLD.description IS DISTINCT FROM NEW.description
    )
    EXECUTE FUNCTION trg_refresh_recipe_search_from_recipe();
  `);

  await knex.raw(`
    CREATE TRIGGER trg_recipe_tags_refresh_search_insert
    AFTER INSERT ON recipe_tags
    REFERENCING NEW TABLE AS new_rows
    FOR EACH STATEMENT
    EXECUTE FUNCTION trg_refresh_recipe_search_after_tag_insert_stmt();
  `);

  await knex.raw(`
    CREATE TRIGGER trg_recipe_tags_refresh_search_update
    AFTER UPDATE ON recipe_tags
    REFERENCING OLD TABLE AS old_rows NEW TABLE AS new_rows
    FOR EACH STATEMENT
    EXECUTE FUNCTION trg_refresh_recipe_search_after_tag_update_stmt();
  `);

  await knex.raw(`
    CREATE TRIGGER trg_recipe_tags_refresh_search_delete
    AFTER DELETE ON recipe_tags
    REFERENCING OLD TABLE AS old_rows
    FOR EACH STATEMENT
    EXECUTE FUNCTION trg_refresh_recipe_search_after_tag_delete_stmt();
  `);

//   await knex.raw(`
//     DO $$
//     DECLARE
//       v_recipe_id uuid;
//     BEGIN
//       FOR v_recipe_id IN
//         SELECT id
//         FROM recipes
//       LOOP
//         PERFORM refresh_recipe_search(v_recipe_id);
//       END LOOP;
//     END;
//     $$;
//   `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    'DROP TRIGGER IF EXISTS trg_recipe_tags_refresh_search_delete ON recipe_tags;',
  );
  await knex.raw(
    'DROP TRIGGER IF EXISTS trg_recipe_tags_refresh_search_update ON recipe_tags;',
  );
  await knex.raw(
    'DROP TRIGGER IF EXISTS trg_recipe_tags_refresh_search_insert ON recipe_tags;',
  );

  await knex.raw(
    'DROP TRIGGER IF EXISTS trg_recipes_refresh_search_update ON recipes;',
  );
  await knex.raw(
    'DROP TRIGGER IF EXISTS trg_recipes_refresh_search_insert ON recipes;',
  );

  await knex.raw(
    'DROP FUNCTION IF EXISTS trg_refresh_recipe_search_after_tag_update_stmt();',
  );
  await knex.raw(
    'DROP FUNCTION IF EXISTS trg_refresh_recipe_search_after_tag_delete_stmt();',
  );
  await knex.raw(
    'DROP FUNCTION IF EXISTS trg_refresh_recipe_search_after_tag_insert_stmt();',
  );
  await knex.raw(
    'DROP FUNCTION IF EXISTS trg_refresh_recipe_search_from_recipe();',
  );
  await knex.raw('DROP FUNCTION IF EXISTS refresh_recipe_search(uuid);');
  await knex.raw('DROP FUNCTION IF EXISTS recipe_search_query(text);');
  await knex.raw(
    'DROP FUNCTION IF EXISTS normalize_recipe_search_value(text);',
  );

  await knex.schema.dropTableIfExists('recipe_search');
}
