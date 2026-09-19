import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    // -------------------------------------------------------------------------
    // 1. Cleanup existing records in reverse-dependency order
    // -------------------------------------------------------------------------
    await trx('composite_component_children').del();
    await trx('component_templates').del();
    await trx('page_layouts').del();
    await trx('composite_components').del();
    await trx('repeater_components').del();
    await trx('leaf_components').del();
    await trx('commerce_components').del();
    await trx('layout_components').del();

    await trx('color_palettes').del();
    await trx('typography').del();
    await trx('theme_settings').del();
    await trx('storefront_releases').del();
    await trx('storefronts').del();
    await trx('social_links').del();
    await trx('brands').del();
    await trx('vendors').del();

    // Clean up vendor user if previously seeded
    await trx('users')
      .where({ email: 'vendor@sweetblissbakery.com' })
      .del();

    // -------------------------------------------------------------------------
    // 2. Seed Vendor (User + Vendor)
    // -------------------------------------------------------------------------
    const [vendorUser] = await trx('users')
      .insert({
        email: 'vendor@sweetblissbakery.com',
        displayname: 'Sweet Bliss Bakery',
        password: 'password123',
        role: 'VENDER',
      })
      .returning(['id']);

    const [vendor] = await trx('vendors')
      .insert({
        id: vendorUser.id,
        tax_code: '0312345678001', // 13 characters (satisfies char_length IN (10, 13))
        registered_at: new Date('2024-01-15T08:00:00Z'),
      })
      .returning(['id']);

    // -------------------------------------------------------------------------
    // 3. Seed Brand (images skipped)
    // -------------------------------------------------------------------------
    const [brand] = await trx('brands')
      .insert({
        name: 'Sweet Bliss Bakery',
        vendor_id: vendor.id,
        domain: 'sweetbliss.bakersmarketplace.local',
        logo: null,
        favicon: null,
      })
      .returning(['id']);

    // -------------------------------------------------------------------------
    // 4. Seed Storefront & Release
    // -------------------------------------------------------------------------
    const [storefront] = await trx('storefronts')
      .insert({
        brand_id: brand.id,
      })
      .returning(['id']);

    const [release] = await trx('storefront_releases')
      .insert({
        storefront_id: storefront.id,
        version: 1,
        display_name: 'v1.0.0 Production Release',
				is_active: true
      })
      .returning(['id']);

    // -------------------------------------------------------------------------
    // 5. Seed Theme Settings, Color Palette & Typography
    // -------------------------------------------------------------------------
    await trx('theme_settings').insert({
      id: release.id,
    });

    await trx('color_palettes').insert({
      id: release.id,
      color_background: 0xffffff,
      color_surface: 0xf8fafc,
      color_border: 0xe2e8f0,
      color_text_primary: 0x0f172a,
      color_text_secondary: 0x64748b,
      color_primary: 0xd97706, // Warm artisanal amber
      color_primary_foreground: 0xffffff,
      color_secondary: 0x78350f, // Deep oven baked brown
      color_accent: 0xf59e0b, // Golden crust accent
      color_accent_foreground: 0x000000,
    });

    await trx('typography').insert({
      id: release.id,
      heading_font: 'Playfair Display',
      body_font: 'Inter',
      heading_weight: 700,
      body_weight: 400,
      heading_line_height: 1.25,
      body_line_height: 1.6,
      heading_letter_spacing: -0.02,
      body_letter_spacing: 0.0,
    });

    // -------------------------------------------------------------------------
    // 6. Seed Layout Components & Component Hierarchy (Collection Page)
    // -------------------------------------------------------------------------

    // A) Root Composite Component for COLLECTION layout (Uniform Grid)
    const [rootGridBase] = await trx('layout_components')
      .insert({
        name: 'Collection Page Main Layout',
        description: 'Root container organizing the collection page sections in a uniform single-column stack',
        config: JSON.stringify({
          h: 'auto',
          w: 'full',
          alignment: 'center',
          padding: { top: 'md', bottom: 'md', left: 'md', right: 'md' },
          colorScheme: 'default',
          colorPalette: { type: 'palette', token: 'background' },
          layout: 'UNIFORM',
          rows: 2,
          cols: 1,
          gap: 32,
          borderRadius: 0,
        }),
      })
      .returning(['id']);

    await trx('composite_components').insert({
      id: rootGridBase.id,
      component_type: 'GRID',
    });

    // B) Child 1: Rich Text Leaf Component (Collection introduction)
    const [richTextBase] = await trx('layout_components')
      .insert({
        name: 'Collection Craft Introduction',
        description: 'Rich text narrative introducing the bakery collection and craftsmanship',
        config: JSON.stringify({
          h: 'auto',
          w: 'full',
          alignment: 'center',
          padding: { top: 'md', bottom: 'md', left: 'md', right: 'md' },
          colorScheme: 'default',
          colorPalette: { type: 'palette', token: 'surface' },
          content: {
            body: '<h2>Our Artisanal Collection</h2><p>Every loaf and pastry at Sweet Bliss is slow-fermented for over 24 hours using heirloom grains and wild yeast cultures. Baked fresh daily in small batches.</p>',
            format: 'html',
          },
        }),
      })
      .returning(['id']);

    await trx('leaf_components').insert({
      id: richTextBase.id,
      component_type: 'RICH_TEXT',
    });

    // C) Item Template: Product Card Commerce Component
    const [productCardBase] = await trx('layout_components')
      .insert({
        name: 'Pastry Product Card Template',
        description: 'Reusable product card template for pastries and bread items',
        config: JSON.stringify({
          h: 'auto',
          w: 'full',
          alignment: 'left',
          padding: { top: 'sm', bottom: 'sm', left: 'sm', right: 'sm' },
          colorScheme: 'default',
          colorPalette: { type: 'palette', token: 'surface' },
          thumbnail: {
            url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff',
            ratio: '1:1',
            scale: 'cover',
          },
          content: {
            layout: 'simple',
            header: {
              title: {
                value: '{{ product.name }}',
                style: {
                  decoration: 'underline',
                  txtColor: '0f172a',
                  fontWeight: 'bold',
                  fontStyle: 'normal',
                },
              },
              subtitle: {
                display: true,
                value: '{{ product.category }}',
                style: {
                  decoration: 'underline',
                  txtColor: '64748b',
                  fontWeight: 400,
                  fontStyle: 'normal',
                },
              },
            },
            body: [
              {
                type: 'description',
                display: true,
                value: '{{ product.description }}',
                style: {
                  decoration: 'underline',
                  txtColor: '334155',
                  fontWeight: 400,
                  fontStyle: 'normal',
                },
              },
              {
                type: 'ratings',
                display: true,
                value: '{{ product.rating }}',
                ratingType: 'stars',
              },
              {
                type: 'priceTag',
                display: true,
                value: '{{ product.price }}',
                currency: 'VND',
                unit: 'piece',
                format: {
                  showUnit: true,
                  showCurrency: true,
                  unitSeparator: '/',
                },
              },
            ],
          },
        }),
      })
      .returning(['id']);

    await trx('commerce_components').insert({
      id: productCardBase.id,
      component_type: 'PRODUCT_CARD',
    });

    // D) Child 2: Collection Grid Repeater Component
    const [repeaterBase] = await trx('layout_components')
      .insert({
        name: 'Bakery Specialties Collection Grid',
        description: 'Paginated repeater grid displaying featured bakery specialties',
        config: JSON.stringify({
          h: 'auto',
          w: 'full',
          alignment: 'center',
          padding: { top: 'md', bottom: 'md', left: 'none', right: 'none' },
          colorScheme: 'default',
          colorPalette: { type: 'palette', token: 'background' },
          layout: 'pagination',
          pageSize: 8,
        }),
      })
      .returning(['id']);

    await trx('repeater_components').insert({
      id: repeaterBase.id,
      item_template_id: productCardBase.id,
      component_type: 'COLLECTION_GRID',
    });

    // E) Attach Children to Root Composite Grid
    await trx('composite_component_children').insert([
      {
        composite_id: rootGridBase.id,
        child_id: richTextBase.id,
        sort_order: 1,
      },
      {
        composite_id: rootGridBase.id,
        child_id: repeaterBase.id,
        sort_order: 2,
      },
    ]);

    // -------------------------------------------------------------------------
    // 7. Seed Page Layouts (Collection Page only)
    // -------------------------------------------------------------------------
    await trx('page_layouts').insert({
      storefront_release_id: release.id,
      type: 'COLLECTION',
      root_component_id: rootGridBase.id,
    });
  });
}
