import { URL_MAX_LENGTH } from '#/utils/constants.js';
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pg_trgm;');

  await knex.raw(`
    CREATE TYPE user_role AS ENUM (
      'CUSTOMER',
      'BAKER',
      'VENDOR',
      'ADMIN'
    );
  `);

  await knex.schema
		.createTable('files', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table.text('display_name');
      table.text('original_name');

      table
        .string('url', URL_MAX_LENGTH)
        .notNullable();

      table.text('content_type');

      table.text('ext_name');

      table
        .bigInteger('size')
        .unsigned()
        .nullable();

      table
        .string('checksum')
        .nullable();

      table
        .timestamp('uploaded_at', { useTz: true })
        .nullable();

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.index(['checksum'], 'idx_images_check_sum');
    })

		.createTable('images', (table) => {
			table
				.uuid('id')
				.references('id')
				.inTable('files')
				.primary()
				.onDelete('CASCADE');

			table
				.smallint('width')
				.unsigned()
				.nullable();

			table
				.smallint('height')
				.unsigned()
				.nullable();
		})

		.createTable('documents', (table) => {
			table
				.uuid('id')
				.references('id')
				.inTable('files')
				.primary()
				.onDelete('CASCADE');

			table
				.smallint('page_count')
				.unsigned()
				.nullable();
		})

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
        .text('hashed_password')
        .nullable();

      table
        .specificType('role', 'user_role')
        .notNullable()
        .defaultTo('CUSTOMER');

      table
        .enum('status', ['PENDING_VERIFICATION', 'ACTIVE', 'BANNED'], {
          useNative: true,
          enumName: 'user_status',
        })
        .notNullable()
        .defaultTo('ACTIVE');

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table
        .timestamp('updated_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
    })

    .createTable('vendors', (table) => {
      table
        .uuid('id')
        .references('id')
        .inTable('users')
        .primary()
        .onDelete('CASCADE');

			table
				.enum('business_type', ['INDIVIDUAL', 'HOUSEHOLD', 'COMPANY'], {
					useNative: true,
					enumName: 'vendor_business_type',
				})
				.notNullable();

      table
        .specificType('tax_code', 'char(13)')
        .unique()
        .notNullable();

      table
        .timestamp('registered_at', { useTz: true })
        .nullable();

      table
        .check('char_length(??) IN (10, 13)', ['tax_code'], 'chk_tax_code_length');
    })

		.createTable('individual_vendors', (table) => {
			table
        .uuid('id')
        .references('id')
        .inTable('vendors')
        .primary()
        .onDelete('CASCADE');

			table
				.string('citizen_id', 12)
				.unique()
				.defaultTo(null);

			table
				.uuid('identity_card_front_doc_id')
				.references('id')
				.inTable('images')
				.unique()
				.defaultTo(null)
				.onDelete('RESTRICT');

			table
				.uuid('identity_card_back_doc_id')
				.references('id')
				.inTable('images')
				.unique()
				.defaultTo(null)
				.onDelete('RESTRICT');
		})

		.createTable('company_vendors', (table) => {
			table
        .uuid('id')
        .references('id')
        .inTable('vendors')
        .primary()
        .onDelete('CASCADE');

			table
				.string('legal_business_name', 255)
				.notNullable();

			table
				.enum('entity_type', ['LIMITED_LIABILITY_COMPANY', 'JOINT_STOCK_COMPANY', 'PARTNERSHIP_COMPANY', 'PRIVATE_ENTERPRISE', 'STATE_OWNED_ENTERPRISE', 'OTHER'], {
					useNative: true,
					enumName: 'company_entity_type',
				})
				.notNullable();

			table
				.smallint('year_of_establishment')
				.unsigned()
				.notNullable();

			table
				.uuid('business_license_doc_id')
				.references('id')
				.inTable('documents')
				.unique()
				.notNullable()
				.onDelete('RESTRICT');

			table
				.string('business_description', 1000)
				.notNullable();

			table
				.string('business_website_url', URL_MAX_LENGTH)
				.nullable()
				.defaultTo(null);
		})

		.createTable('vendor_contact_infos', (table) => {
			table
				.uuid('id')
				.references('id')
				.inTable('vendors')
				.primary()
				.onDelete('CASCADE');

			table
				.string('representative_name', 255)
				.notNullable();

			table
				.string('representative_role', 100)
				.notNullable();

			table
				.string('business_address', 500)
				.notNullable();

			table
				.string('business_phone', 15)
				.unique()
				.notNullable();

			table
				.string('business_email', 255)
				.unique()
				.notNullable();
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

    .createTable('recipe_steps', (table) => {
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

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.check(
        'step_order > 0',
        [],
        'chk_steps_order_positive',
      );

      table.unique(
        ['recipe_id', 'step_order'],
        {
          indexName: 'uq_steps_recipe_order',
          deferrable: 'deferred',
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
        .integer('note_order')
        .notNullable();

      table
        .text('content')
        .notNullable();

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.check(
        'note_order > 0',
        [],
        'chk_notes_order_positive',
      );

      table.unique(
        ['recipe_id', 'note_order'],
        {
          indexName: 'uq_notes_recipe_order',
          deferrable: 'deferred',
        },
      );

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
    })

    .createTable('posts', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('author_id')
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');

      table
        .text('title')
        .notNullable();

      table
        .text('content')
        .notNullable();

      // Admins remove a post by hiding it, so its reports are kept as evidence; who and why live in post_removals
      table
        .enum('status', ['VISIBLE', 'REMOVED'], {
          useNative: true,
          enumName: 'post_status',
        })
        .notNullable()
        .defaultTo('VISIBLE');

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table
        .timestamp('updated_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.index(['author_id'], 'idx_posts_author_id');
    })

    .createTable('post_tags', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('post_id')
        .notNullable()
        .references('id')
        .inTable('posts')
        .onDelete('CASCADE');

      table
        .text('name')
        .notNullable();

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.unique(['post_id', 'name'], {
        indexName: 'uq_post_tags_post_name',
      });
    })

    .createTable('post_comments', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('post_id')
        .notNullable()
        .references('id')
        .inTable('posts')
        .onDelete('CASCADE');

      table
        .uuid('user_id')
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');

      table.uuid('parent_comment_id');

      table
        .text('content')
        .notNullable();

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.unique(['id', 'post_id'], {
        indexName: 'uq_post_comments_id_post',
        useConstraint: true,
      });

      // A reply must belong to the same post as its parent comment
      table
        .foreign(['parent_comment_id', 'post_id'], 'fk_post_comments_parent')
        .references(['id', 'post_id'])
        .inTable('post_comments')
        .onDelete('CASCADE');

      table.check(
        'parent_comment_id IS NULL OR parent_comment_id <> id',
        [],
        'chk_post_comments_not_self_parent',
      );

      table.index(
        ['post_id', 'created_at'],
        'idx_post_comments_post_created',
      );

      table.index(
        ['parent_comment_id'],
        'idx_post_comments_parent_comment_id',
      );

      table.index(
        ['user_id'],
        'idx_post_comments_user_id',
      );
    })

    .createTable('post_likes', (table) => {
      table
        .uuid('post_id')
        .notNullable()
        .references('id')
        .inTable('posts')
        .onDelete('CASCADE');

      table
        .uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.primary(['post_id', 'user_id']);

      table.index(['user_id'], 'idx_post_likes_user_id');
    })

    .createTable('post_saves', (table) => {
      table
        .uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');

      table
        .uuid('post_id')
        .notNullable()
        .references('id')
        .inTable('posts')
        .onDelete('CASCADE');

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.primary(['user_id', 'post_id']);

      table.index(['post_id'], 'idx_post_saves_post_id');
    })

    .createTable('reports', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('reporter_id')
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');

      table
        .text('reason')
        .notNullable();

      table
        .enum('status', ['PENDING', 'DISMISSED', 'RESOLVED'], {
          useNative: true,
          enumName: 'report_status',
        })
        .notNullable()
        .defaultTo('PENDING');

      // The admin who dismissed or resolved the report
      table
        .uuid('handled_by')
        .references('id')
        .inTable('users')
        .nullable()
        .onDelete('SET NULL');

      table
        .timestamp('handled_at', { useTz: true })
        .nullable();

      table
        .text('note')
        .nullable();

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.index(['reporter_id'], 'idx_reports_reporter_id');
      table.index(['status', 'created_at'], 'idx_reports_status_created');
    })

    .createTable('post_reports', (table) => {
      table
        .uuid('id')
        .references('id')
        .inTable('reports')
        .primary()
        .onDelete('CASCADE');

      table
        .uuid('post_id')
        .notNullable()
        .references('id')
        .inTable('posts')
        .onDelete('CASCADE');

      table.index(['post_id'], 'idx_post_reports_post_id');
    })

    .createTable('user_reports', (table) => {
      table
        .uuid('id')
        .references('id')
        .inTable('reports')
        .primary()
        .onDelete('CASCADE');

      table
        .uuid('target_user_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');

      table.index(['target_user_id'], 'idx_user_reports_target_user_id');
    })

    .createTable('warnings', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');

      table
        .uuid('issued_by')
        .references('id')
        .inTable('users')
        .nullable()
        .onDelete('SET NULL');

      table
        .text('reason')
        .notNullable();

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.index(['user_id'], 'idx_warnings_user_id');
    })

    // The reports a warning settled: a warning has any number of them, a report belongs to at most one warning
    .createTable('warning_reports', (table) => {
      table
        .uuid('warning_id')
        .notNullable()
        .references('id')
        .inTable('warnings')
        .onDelete('CASCADE');

      table
        .uuid('report_id')
        .notNullable()
        .references('id')
        .inTable('reports')
        .onDelete('CASCADE');

      table.primary(['warning_id', 'report_id']);

      table.unique(['report_id'], {
        indexName: 'uq_warning_reports_report_id',
        useConstraint: true,
      });
    })

    // Columns shared by every kind of takedown; post_removals and user_bans add the target.
    // revoked_at IS NULL means the takedown is still in force (post hidden / account banned).
    .createTable('takedowns', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('issued_by')
        .references('id')
        .inTable('users')
        .nullable()
        .onDelete('SET NULL');

      table
        .text('reason')
        .notNullable();

      table
        .timestamp('issued_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table
        .uuid('revoked_by')
        .references('id')
        .inTable('users')
        .nullable()
        .onDelete('SET NULL');

      table
        .timestamp('revoked_at', { useTz: true })
        .nullable();
    })

    .createTable('post_removals', (table) => {
      table
        .uuid('id')
        .references('id')
        .inTable('takedowns')
        .primary()
        .onDelete('CASCADE');

      table
        .uuid('post_id')
        .notNullable()
        .references('id')
        .inTable('posts')
        .onDelete('CASCADE');

      table.index(['post_id'], 'idx_post_removals_post_id');
    })

    .createTable('user_bans', (table) => {
      table
        .uuid('id')
        .references('id')
        .inTable('takedowns')
        .primary()
        .onDelete('CASCADE');

      table
        .uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');

      table.index(['user_id'], 'idx_user_bans_user_id');
    })

    .createTable('brands', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .string('name', 100)
        .unique()
        .notNullable();

      table
        .uuid('vendor_id')
        .references('id')
        .inTable('vendors')
				.unique()
        .nullable()
        .onDelete('SET NULL');

      table
        .string('domain', 253)
        .unique()
        .nullable()
        .defaultTo(null);

      table
        .uuid('logo')
        .references('id')
        .inTable('images')
        .nullable()
        .defaultTo(null)
        .onDelete("SET NULL");
      
      table
        .uuid('favicon')
        .references('id')
        .inTable('images')
        .nullable()
        .defaultTo(null)
        .onDelete("SET NULL");

      table
        .timestamps(true, true);
    })

    .createTable('products', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('brand_id')
        .notNullable()
        .references('id')
        .inTable('brands')
        .onDelete('CASCADE');

      table
        .uuid('vendor_id')
        .references('id')
        .inTable('vendors')
        .onDelete('SET NULL');

      table
        .string('title', 255)
        .notNullable();

      table.text('description');

      table
        .string('slug', 255)
        .notNullable()
        .unique();

      table
        .decimal('unit_price', 20, 2)
        .notNullable();

      table
        .decimal('unit_cost', 20, 2)
        .notNullable();

      table
        .specificType('currency', 'char(3)')
        .notNullable()
        .defaultTo('VND');

      table
        .string('unit', 255)
        .notNullable();

      table
        .date('expiration_date')
        .nullable()
        .defaultTo(null);

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.check(
        'unit_price >= 0',
        [],
        'chk_products_unit_price_non_negative',
      );

      table.check(
        'unit_cost >= 0',
        [],
        'chk_products_unit_cost_non_negative',
      );

      table.index(['brand_id'], 'idx_products_brand_id');
      table.index(['vendor_id'], 'idx_products_vendor_id');
    })

    .createTable('product_images', (table) => {
      table
        .uuid('product_id')
        .notNullable()
        .references('id')
        .inTable('products')
        .onDelete('CASCADE');

      table
        .uuid('image_id')
        .notNullable()
        .references('id')
        .inTable('images')
        .onDelete('CASCADE');

      table
        .integer('sort_order')
        .notNullable()
        .checkPositive('chk_product_images_sort_order_positive');

      table.primary(['product_id', 'sort_order']);

      table.unique(['product_id', 'image_id'], {
        indexName: 'uq_product_images_product_image',
      });
    })

    .createTable('product_notes', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('product_id')
        .notNullable()
        .references('id')
        .inTable('products')
        .onDelete('CASCADE');

      table
        .text('content')
        .notNullable();

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.index(['product_id'], 'idx_product_notes_product_id');
    })

    .createTable('product_tags', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('product_id')
        .notNullable()
        .references('id')
        .inTable('products')
        .onDelete('CASCADE');

      table
        .string('name', 100)
        .notNullable();

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.unique(['product_id', 'name'], {
        indexName: 'uq_product_tags_product_name',
      });
    })

    .createTable('product_stocks', (table) => {
      table
        .uuid('id')
        .references('id')
        .inTable('products')
        .primary()
        .onDelete('CASCADE');

      table
        .integer('stock')
        .notNullable()
        .defaultTo(0);

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.check(
        'stock >= 0',
        [],
        'chk_product_stocks_stock_non_negative',
      );
    })

    .createTable('stock_alerts', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('product_stock_id')
        .notNullable()
        .references('id')
        .inTable('product_stocks')
        .onDelete('CASCADE');

      table
        .enum(
          'alert_type',
          [
            'MAXIMUM',
            'REORDER',
            'MINIMUM',
          ],
          { useNative: true, enumName: 'stock_alert_type' },
        )
        .notNullable();

      table
        .integer('threshold')
        .notNullable();

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.check(
        'threshold >= 0',
        [],
        'chk_stock_alerts_threshold_non_negative',
      );

      table.unique(['product_stock_id', 'alert_type'], {
        indexName: 'uq_stock_alerts_stock_type',
      });
    })

    .createTable('collections', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .string('name', 255)
        .notNullable();

      table
        .string('slug', 255)
        .notNullable()
        .unique();

      table.text('description');

      table
        .boolean('is_active')
        .notNullable()
        .defaultTo(true);

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
    })

    .createTable('product_collections', (table) => {
      table
        .uuid('product_id')
        .notNullable()
        .references('id')
        .inTable('products')
        .onDelete('CASCADE');

      table
        .uuid('collection_id')
        .notNullable()
        .references('id')
        .inTable('collections')
        .onDelete('CASCADE');

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());

      table.primary(['product_id', 'collection_id']);

      table.index(
        ['collection_id'],
        'idx_product_collections_collection_id',
      );
    })

    .createTable('social_links', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .string('name', 255)
        .notNullable();

      table
        .string('url', URL_MAX_LENGTH)
        .notNullable();

      table
        .specificType('url_hash', 'varchar(64) GENERATED ALWAYS AS (encode(sha256(url::bytea), \'hex\')) STORED');
      
      table
        .uuid('logo')
        .references('id')
        .inTable('images')
        .notNullable()
        .onDelete("SET NULL");

      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
    })

    .createTable('storefronts', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('brand_id')
        .references('id')
        .inTable('brands')
        .notNullable()
        .onDelete('CASCADE');
      
      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
    })

    .createTable('storefront_releases', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));
      
      table
        .integer('version')
        .notNullable();
      
      table
        .uuid('storefront_id')
        .references('id')
        .inTable('storefronts')
        .notNullable()
        .onDelete('SET NULL');
      
      table
        .string('display_name', 255)
        .notNullable();
      
      table
        .timestamps(true, true);

			table
        .boolean('is_active')
				.notNullable()
				.defaultTo(false);
    })

    .createTable('layout_components', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .string('name', 255)
				.nullable()
				.defaultTo(null);

      table
        .text('description')
        .nullable()
        .defaultTo(null);

      table
        .jsonb('config')
        .index('idx_component_config', { indexType: 'gin' })
        .notNullable()
        .defaultTo({});

      table
        .timestamps(true, true);
    })

    .createTable('commerce_components', (table) => {
      table
        .uuid('id')
        .references('id')
        .inTable('layout_components')
        .primary()
        .onDelete('CASCADE');

			table
				.enum(
					'component_type',
					[
						'HERO_BANNER',
						'IMAGE_BANNER',
						'PRODUCT_CARD',
						'PRODUCT_DETAILS',
						'REVIEW_GRID',
						'CONTACT_FORM',
            'FAQ'
					],
					{ useNative: true, enumName: 'commerce_component_type' },
				)
				.notNullable();
    })

    .createTable('leaf_components', (table) => {
      table
        .uuid('id')
        .references('id')
        .inTable('layout_components')
        .primary()
        .onDelete('CASCADE');

			table
				.enum(
					'component_type',
					[
						'CARD',
						'FORM',
            'BUTTON',
						'SEARCH_BAR',
						'FILTER',
						'RICH_TEXT',
						'IMAGE',
            'GALLERY',
            'VIDEO_PLAYER',
            'TEXT_WITH_IMAGE',
            'DIVIDER'
					],
					{ useNative: true, enumName: 'leaf_component_type' },
				)
				.notNullable();
    })

    .createTable('repeater_components', (table) => {
      table
        .uuid('id')
        .references('id')
        .inTable('layout_components')
        .primary()
        .onDelete('CASCADE');

      table
        .uuid('item_template_id')
        .references('id')
        .inTable('layout_components')
        .nullable()
        .onDelete('SET NULL')
        .defaultTo(null);

			table
				.enum(
					'component_type',
					[
						'COLLECTION_GRID',
						'COLLECTION_CAROUSEL',
					],
					{ useNative: true, enumName: 'repeater_component_type' },
				)
				.notNullable();
    })
    
    .createTable('composite_components', (table) => {
      table
        .uuid('id')
        .references('id')
        .inTable('layout_components')
        .primary()
        .onDelete('CASCADE');

			table
				.enum(
					'component_type',
					[
						'GRID',
						'COLUMN',
						'ROW',
						'CAROUSEL',
					],
					{ useNative: true, enumName: 'composite_component_type' },
				)
				.notNullable();
    })

    .createTable('composite_component_children', (table) => {
      table
        .uuid('composite_id')
        .references('id')
        .inTable('composite_components')
        .notNullable()
        .onDelete('CASCADE');

      table
        .uuid('child_id')
        .references('id')
        .inTable('layout_components')
        .notNullable()
				.onDelete('CASCADE');

			table
				.enum('breakpoint', ['mobile', 'tablet', 'desktop'], {
					useNative: true,
					enumName: 'breakpoint_type'
				})
				.notNullable();

      table
        .integer('sort_order')
        .checkPositive('chk_position_positive')
        .notNullable();

      table
        .primary(['composite_id', 'breakpoint', 'sort_order'], {
					constraintName: 'uniq_composite_children_breakpoint_order',
					deferrable: 'deferred',
				});

			table
				.unique(['composite_id', 'breakpoint', 'child_id'], {
					indexName: 'uniq_composite_breakpoint_child'
				});
    })

    .createTable('component_templates', (table) => {
      table
        .uuid('id')
        .references('id')
        .inTable('composite_components')
        .primary()
        .onDelete('CASCADE');

      table
        .string('name', 255)
        .notNullable();

      table
        .uuid('owner_id')
        .references('id')
        .inTable('vendors')
        .notNullable()
        .onDelete('CASCADE');
    })

		.createTable('page_layouts', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('gen_random_uuid()'));

      table
        .uuid('storefront_release_id')
        .notNullable()
        .references('id')
        .inTable('storefront_releases')
        .onDelete('CASCADE');

			table
				.enum(
					'type',
					[
						'HOME',
						'ABOUT_US',
						'COLLECTION',
						'COLLECTION_LIST',
						'SEARCH',
						'PRODUCT',
					],
					{ useNative: true, enumName: 'page_type' },
				)
				.notNullable();

			table
				.uuid('root_component_id')
				.references('id')
				.inTable('composite_components')
				.nullable()
				.onDelete('SET NULL');

			table.unique(['storefront_release_id', 'type'], {
				indexName: 'idx_page_layout_storefront_release_page_type',
				useConstraint: true,
			});
    })

    .createTable('theme_settings', (table) => {
      table
        .uuid('id')
        .references('id')
        .inTable('storefront_releases')
        .primary()
        .onDelete('CASCADE');
    })

    .createTable('color_palettes', (table) => {
      table
        .uuid('id')
        .references('id')
        .inTable('theme_settings')
        .primary()
        .onDelete('CASCADE');

      const addColorColumn = (columnName: string, defaultValue = '0x000000') => {
        return table
					.string(columnName)
          .notNullable()
          .defaultTo(defaultValue);
      }

      addColorColumn('color_background', '#FFFFFF');
      addColorColumn('color_surface', '#F8FAFC');
      addColorColumn('color_border', '#E2E8F0');

      addColorColumn('color_text_primary', '#0F172A');
      addColorColumn('color_text_secondary', '#64748B');

      addColorColumn('color_primary', '#2563EB');
      addColorColumn('color_primary_foreground', '#FFFFFF');
      addColorColumn('color_secondary', '#475569');
			addColorColumn('color_secondary_foreground', '#FFFFFF');

      addColorColumn('color_accent', '#F59E0B');
      addColorColumn('color_accent_foreground', '#000000');
    })

    .createTable('typography', (table) => {
      table
        .uuid('id')
        .references('id')
        .inTable('theme_settings')
        .primary()
        .onDelete('CASCADE');

      table
        .string('heading_font', 255)
        .notNullable()
        .defaultTo('Merriweather');

      table
        .string('body_font', 255)
        .notNullable()
        .defaultTo('Merriweather');

      table
        .smallint('heading_weight')
        .checkBetween([100, 900])
        .notNullable()
        .defaultTo(800);

      table
        .smallint('body_weight')
        .checkBetween([100, 900])
        .notNullable()
        .defaultTo(300);

      table
        .decimal('heading_line_height', 3, 2)
        .notNullable()
        .defaultTo(1.20);

      table
        .decimal('body_line_height', 3, 2)
        .notNullable()
        .defaultTo(1.60);

      table
        .decimal('heading_letter_spacing', 4, 3)
        .notNullable()
        .defaultTo(-0.020);

      table
        .decimal('body_letter_spacing', 4, 3)
        .notNullable()
        .defaultTo(0.000);
    });

		await knex.schema.createTable('vendor_applications', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));

    table
      .uuid('applicant_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table
      .specificType('business_type', 'vendor_business_type')
      .notNullable();

    table
      .string('brand_name', 100)
      .notNullable();

    table
      .string('tax_code', 13)
      .notNullable();

    table
      .enum('status', ['PENDING', 'APPROVED', 'DECLINED'], {
				useNative: true,
				enumName: 'vendor_application_status',
			})
      .notNullable()
      .defaultTo('PENDING');

    table
      .text('decline_reason')
      .nullable();

    table
      .uuid('reviewed_by')
      .references('id')
      .inTable('users')
      .nullable()
      .onDelete('SET NULL');

    table
      .timestamp('reviewed_at', { useTz: true })
      .nullable();

    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    // Tax code constraint (10 digits for corporations/enterprises, 13 digits for branches/sub-units)
    table.check(
      'char_length(??) IN (10, 13)',
      ['tax_code'],
      'chk_vendor_applications_tax_code_length',
    );

    table.index(['applicant_id'], 'idx_vendor_applications_applicant_id');
    table.index(['status'], 'idx_vendor_applications_status');
    table.index(['created_at'], 'idx_vendor_applications_created_at');
  });

  // Unique partial index: An applicant can only have one active 'PENDING' application at any given time
  await knex.raw(`
    CREATE UNIQUE INDEX uq_vendor_applications_single_pending
    ON vendor_applications (applicant_id)
    WHERE status = 'PENDING';
  `);

  await knex.schema.createTable('vendor_application_contact_infos', (table) => {
    table
      .uuid('id')
      .references('id')
      .inTable('vendor_applications')
      .primary()
      .onDelete('CASCADE');

    table.string('representative_name', 255).notNullable();
    table.string('representative_role', 100).notNullable();
    table.string('business_address', 500).notNullable();
    table.string('business_phone', 15).notNullable();
    table.string('business_email', 255).notNullable();
  });

  await knex.schema.createTable('individual_vendor_applications', (table) => {
    table
      .uuid('id')
      .references('id')
      .inTable('vendor_applications')
      .primary()
      .onDelete('CASCADE');

    table.string('citizen_id', 12).notNullable();

    table
      .uuid('identity_card_front_doc_id')
      .references('id')
      .inTable('images')
      .notNullable()
      .onDelete('RESTRICT');

    table
      .uuid('identity_card_back_doc_id')
      .references('id')
      .inTable('images')
      .notNullable()
      .onDelete('RESTRICT');
  });

  await knex.schema.createTable('company_vendor_applications', (table) => {
    table
      .uuid('id')
      .references('id')
      .inTable('vendor_applications')
      .primary()
      .onDelete('CASCADE');

    table.string('legal_business_name', 255).notNullable();

    table
      .specificType('entity_type', 'company_entity_type')
      .notNullable();

    table.smallint('year_of_establishment').unsigned().notNullable();

    table
      .uuid('business_license_doc_id')
      .references('id')
      .inTable('documents')
      .notNullable()
      .onDelete('RESTRICT');

    table.string('business_description', 1000).notNullable();

    table
      .string('business_website_url', URL_MAX_LENGTH)
      .nullable()
      .defaultTo(null);

    table.check(
      'year_of_establishment >= 1900',
      [],
      'chk_company_app_year_min',
    );
  });

		await knex.raw(`
			CREATE OR REPLACE FUNCTION get_layout_tree_json(target_id uuid)
			RETURNS jsonb AS $$
			SELECT jsonb_build_object(
				'id', lc.id,
				'name', lc.name,
				'description', lc.description,
				'config', lc.config::jsonb
			) || COALESCE(
				(
					SELECT jsonb_build_object(
						'type', 'LEAF',
						'component_type', l.component_type
					)
					FROM leaf_components l
					WHERE l.id = lc.id
				),
				(
					SELECT jsonb_build_object(
						'type', 'COMMERCE',
						'component_type', c.component_type
					)
					FROM commerce_components c
					WHERE c.id = lc.id
				),
				(
					SELECT jsonb_build_object(
						'type', 'REPEATER',
						'component_type', r.component_type,
						'item_template', CASE 
							WHEN r.item_template_id IS NOT NULL THEN get_layout_tree_json(r.item_template_id)
							ELSE NULL
						END
					)
					FROM repeater_components r
					WHERE r.id = lc.id
				),
				(
					SELECT jsonb_build_object(
						'type', 'COMPOSITE',
						'component_type', cc.component_type,
						'children', json_build_object(
							'mobile', COALESCE(
								(
									SELECT jsonb_object_agg(
										ccc.sort_order,
										get_layout_tree_json(ccc.child_id)
									)
									FROM composite_component_children ccc
									WHERE ccc.composite_id = cc.id AND ccc.breakpoint = 'mobile'
								),
								'{}'::jsonb
							),
							'tablet', COALESCE(
								(
									SELECT jsonb_object_agg(
										ccc.sort_order,
										get_layout_tree_json(ccc.child_id)
									)
									FROM composite_component_children ccc
									WHERE ccc.composite_id = cc.id AND ccc.breakpoint = 'tablet'
								),
								'{}'::jsonb
							),
							'desktop', COALESCE(
								(
									SELECT jsonb_object_agg(
										ccc.sort_order,
										get_layout_tree_json(ccc.child_id)
									)
									FROM composite_component_children ccc
									WHERE ccc.composite_id = cc.id AND ccc.breakpoint = 'desktop'
								),
								'{}'::jsonb
							)
						)
					)
					FROM composite_components cc
					WHERE cc.id = lc.id
				),
				'{}'::jsonb
			)
			FROM layout_components lc
			WHERE lc.id = target_id;
			$$ LANGUAGE sql STABLE;
		`);

  await knex.raw(`
    CREATE INDEX idx_component_templates_name_trgm
    ON component_templates USING gin (name gin_trgm_ops);
  `);

	await knex.raw(`
    CREATE INDEX idx_layout_components_name_trgm
    ON layout_components USING gin (name gin_trgm_ops);
  `);

  await knex.raw(`
    CREATE INDEX idx_recipes_public_created_id
    ON recipes (created_at DESC, id DESC)
    WHERE is_public = TRUE;
  `);

  await knex.raw(`
    CREATE INDEX idx_products_title_trgm
    ON products USING gin (title gin_trgm_ops);
  `);

  await knex.raw(`
    CREATE INDEX idx_posts_created_at_id
    ON posts (created_at DESC, id DESC);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP FUNCTION IF EXISTS get_layout_tree_json(uuid);');

  await knex.schema
    .dropTableIfExists('typography')
    .dropTableIfExists('color_palettes')
    .dropTableIfExists('theme_settings')
    .dropTableIfExists('page_layouts')
    .dropTableIfExists('component_templates')
    .dropTableIfExists('composite_component_children')
    .dropTableIfExists('composite_components')
    .dropTableIfExists('repeater_components')
    .dropTableIfExists('leaf_components')
    .dropTableIfExists('commerce_components')
    .dropTableIfExists('layout_components')
    .dropTableIfExists('storefront_releases')
    .dropTableIfExists('storefronts')
    .dropTableIfExists('product_collections')
    .dropTableIfExists('collections')
    .dropTableIfExists('stock_alerts')
    .dropTableIfExists('product_stocks')
    .dropTableIfExists('product_tags')
    .dropTableIfExists('product_notes')
    .dropTableIfExists('product_images')
    .dropTableIfExists('products')
    .dropTableIfExists('brands')
    .dropTableIfExists('social_links')
    .dropTableIfExists('user_bans')
    .dropTableIfExists('post_removals')
    .dropTableIfExists('takedowns')
    .dropTableIfExists('warning_reports')
    .dropTableIfExists('warnings')
    .dropTableIfExists('user_reports')
    .dropTableIfExists('post_reports')
    .dropTableIfExists('reports')
    .dropTableIfExists('post_saves')
    .dropTableIfExists('post_likes')
    .dropTableIfExists('post_comments')
    .dropTableIfExists('post_tags')
    .dropTableIfExists('posts')
    .dropTableIfExists('recipe_tags')
    .dropTableIfExists('recipe_notes')
    .dropTableIfExists('recipe_tools')
    .dropTableIfExists('recipe_ingredients')
    .dropTableIfExists('recipe_steps')
    .dropTableIfExists('recipes')
    .dropTableIfExists('individual_vendors')
    .dropTableIfExists('company_vendors')
    .dropTableIfExists('vendor_contact_infos')
    .dropTableIfExists('vendors')
    .dropTableIfExists('documents')
    .dropTableIfExists('images')
    .dropTableIfExists('files')
    .dropTableIfExists('users');

  await knex.raw(`
    DROP TYPE IF EXISTS composite_component_type;
    DROP TYPE IF EXISTS repeater_component_type;
    DROP TYPE IF EXISTS leaf_component_type;
    DROP TYPE IF EXISTS commerce_component_type;
    DROP TYPE IF EXISTS breakpoint_type;
    DROP TYPE IF EXISTS page_type;
    DROP TYPE IF EXISTS stock_alert_type;
    DROP TYPE IF EXISTS report_status;
    DROP TYPE IF EXISTS post_status;
    DROP TYPE IF EXISTS company_entity_type;
    DROP TYPE IF EXISTS vendor_business_type;
    DROP TYPE IF EXISTS user_status;
    DROP TYPE IF EXISTS user_role;
  `);

  await knex.raw('DROP EXTENSION IF EXISTS pg_trgm;');
}
