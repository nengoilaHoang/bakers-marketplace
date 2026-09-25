import type { Knex } from 'knex';

type Ingredient = [name: string, amount: number, unit: string];
type Tool = [name: string, amount: number];

type RecipeSeed = {
	title: string;
	description: string;
	portion: number;
	tags: string[];
	ingredients: Ingredient[];
	tools: Tool[];
	steps: string[];
	notes: string[];
};

type Flavor = {
	name: string;
	tag: string;
	ingredient: string;
	amount: number;
	unit: string;
	profile: string;
	tip: string;
};

type Family = {
	name: string;
	description: string;
	tags: string[];
	ingredients: Ingredient[];
	tools: Tool[];
	portion: number;
};

const HARD_CODED_USER_ID = '11111111-1111-4111-8111-111111111111';
const HARD_CODED_RECIPE_ID_1 = '22222222-2222-4222-8222-222222222222';
const HARD_CODED_RECIPE_ID_2 = '33333333-3333-4333-8333-333333333333';
const HARD_CODED_STOREFRONT_ID = '44444444-4444-4444-8444-444444444444';
const HARD_CODED_STOREFRONT_RELEASE_ID = '55555555-5555-4555-8555-555555555555';

const BREAKPOINTS = ['mobile', 'tablet', 'desktop'] as const;

const users = [
	{
		id: HARD_CODED_USER_ID,
		email: 'minhanh@example.com',
		displayname: 'Nguyễn Minh Anh',
		password: 'password123',
		role: 'CUSTOMER',
	},
	{
		email: 'baongoc@example.com',
		displayname: 'Trần Bảo Ngọc',
		password: 'password123',
		role: 'CUSTOMER',
	},
	{
		email: 'hoangnam@example.com',
		displayname: 'Lê Hoàng Nam',
		password: 'password123',
		role: 'CUSTOMER',
	},
	{
		email: 'thaovy@example.com',
		displayname: 'Phạm Thảo Vy',
		password: 'password123',
		role: 'CUSTOMER',
	},
	{
		email: 'quochuy@example.com',
		displayname: 'Đặng Quốc Huy',
		password: 'password123',
		role: 'CUSTOMER',
	},
];

const baseRecipes: RecipeSeed[] = [
	{
		title: 'Bánh Chocolate Fudge',
		description:
			'Bánh chocolate fudge cốt đậm đà phảng phất cacao thơm. Chocolate đắng béo, hương vị ngọt dịu. Công thức phù hợp làm bánh sinh nhật hoặc tráng miệng.',
		portion: 8,
		tags: ['chocolate', 'cake', 'dessert', 'birthday'],
		ingredients: [
			['Bơ lạt', 180, 'g'],
			['Bột cacao', 55, 'g'],
			['Đường', 160, 'g'],
			['Trứng gà', 3, 'quả'],
			['Sữa tươi', 180, 'ml'],
			['Bột mì', 100, 'g'],
			['Chocolate đen', 120, 'g'],
		],
		tools: [
			['Lò nướng', 1],
			['Máy đánh trứng', 1],
			['Khuôn tròn 20cm', 1],
		],
		steps: [
			'Làm nóng lò 175°C trong ít nhất 15 phút. Lót giấy khuôn tròn 20cm.',
			'Rây cacao và bột, tránh vón cục.',
			'Đun cách thủy bơ và chocolate đen cho tan chảy hoàn toàn.',
			'Đánh tan trứng và đường, rót hỗn hợp chocolate vào trộn đều.',
			'Cho bột vào fold nhẹ nhàng đến khi vừa hòa quyện.',
			'Đổ vào khuôn, nướng 32-38 phút đến khi tăm rút ra còn hơi ẩm.',
			'Để nguội trong khuôn 15 phút trước khi lấy ra rack.',
		],
		notes: [
			'Không nướng quá khô, bánh cần giữ độ ẩm mịn.',
			'Ngon hơn sau khi làm lạnh 2 giờ trong tủ mát.',
		],
	},
];

const flavors: Flavor[] = [
	{
		name: 'Dâu',
		tag: 'strawberry',
		ingredient: 'Dâu tây tươi',
		amount: 120,
		unit: 'g',
		profile: 'Vị chua ngọt thanh mát tự nhiên.',
		tip: 'Nên xay nhuyễn và lọc bớt hạt trước khi trộn.',
	},
	{
		name: 'Matcha',
		tag: 'matcha',
		ingredient: 'Bột matcha Uji',
		amount: 10,
		unit: 'g',
		profile: 'Hương trà xanh thơm ngát, hậu vị ngọt thanh.',
		tip: 'Rây kỹ bột matcha để không bị vón cục.',
	},
	{
		name: 'Caramel',
		tag: 'caramel',
		ingredient: 'Sốt caramel',
		amount: 90,
		unit: 'g',
		profile: 'Ngọt đậm đà, thơm lừng.',
		tip: 'Để nguội sốt trước khi fold vào kem tươi.',
	},
];

const families: Family[] = [
	{
		name: 'Mousse',
		description: 'Mousse mềm mượt tan ngay trong miệng.',
		tags: ['mousse', 'cold-dessert'],
		ingredients: [
			['Whipping cream', 250, 'ml'],
			['Gelatin', 7, 'g'],
			['Đường', 60, 'g'],
		],
		tools: [
			['Máy đánh trứng', 1],
			['Tô trộn', 1],
			['Khuôn mousse 16cm', 1],
		],
		portion: 6,
	},
	{
		name: 'Chiffon Cake',
		description: 'Chiffon cake bông xốp mềm mại.',
		tags: ['chiffon', 'cake'],
		ingredients: [
			['Bột mì', 120, 'g'],
			['Trứng gà', 5, 'quả'],
			['Dầu thực vật', 55, 'ml'],
			['Đường', 100, 'g'],
		],
		tools: [
			['Lò nướng', 1],
			['Khuôn chiffon', 1],
			['Máy đánh trứng', 1],
		],
		portion: 8,
	},
];

function buildDescription(family: Family, flavor: Flavor): string {
	return `${family.description} Phiên bản ${flavor.name.toLowerCase()} dùng ${flavor.ingredient.toLowerCase()}. ${flavor.profile}`;
}

function buildFamilySteps(familyName: string, flavor: Flavor): string[] {
	return [
		`Chuẩn bị nguyên liệu bao gồm ${flavor.amount}${flavor.unit} ${flavor.ingredient.toLowerCase()}.`,
		'Tiến hành sơ chế và trộn hỗn hợp theo từng bước tiêu chuẩn.',
		'Hoàn thiện bánh và bảo quản ở nhiệt độ thích hợp trước khi thưởng thức.',
	];
}

function buildFamilyNotes(_familyName: string, flavor: Flavor): string[] {
	return [flavor.tip, 'Bảo quản kín trong tủ lạnh từ 2-3 ngày.'];
}

// ==========================================================
// VENDORS & PRODUCTS CONFIG
// ==========================================================
const vendorUsers = [
	{
		email: 'vendor.hoasen@example.com',
		displayname: 'Tiệm Bánh Hoa Sen',
		password: 'password123',
		role: 'VENDOR' as const,
		taxCode: '0312345678',
	},
	{
		email: 'vendor.mattroi@example.com',
		displayname: 'Bánh Ngọt Mặt Trời',
		password: 'password123',
		role: 'VENDOR' as const,
		taxCode: '0398765432',
	},
];

const brands = [
	{
		name: 'Hoa Sen Bakery',
		domain: 'hoasen-bakery.vn',
	},
	{
		name: 'Sunrise Patisserie',
		domain: 'sunrise-patisserie.vn',
	},
];

const collections = [
	{
		name: 'Bánh Trung Thu',
		slug: 'banh-trung-thu',
		description: 'Bánh trung thu truyền thống và hiện đại.',
		isActive: true,
	},
	{
		name: 'Hàng Mới Về',
		slug: 'hang-moi-ve',
		description: 'Những sản phẩm mới ra lò trong tuần.',
		isActive: true,
	},
];

type SeedProduct = {
	title: string;
	slug: string;
	description: string;
	unitPrice: number;
	unitCost: number;
	unit: string;
	stock: number;
	brandIndex: 0 | 1;
	tags: string[];
	notes: string[];
	collectionSlugs: string[];
	alerts: Array<{
		alertType: 'MINIMUM' | 'REORDER' | 'MAXIMUM';
		threshold: number;
	}>;
};

const products: SeedProduct[] = [
	{
		title: 'Bánh Trung Thu Thập Cẩm',
		slug: 'banh-trung-thu-thap-cam',
		description: 'Bánh nướng nhân thập cẩm truyền thống hảo hạng.',
		unitPrice: 85000,
		unitCost: 52000,
		unit: 'cái',
		stock: 120,
		brandIndex: 0,
		tags: ['trung-thu', 'banh-nuong', 'truyen-thong'],
		notes: ['Bảo quản nơi khô ráo, dùng trong 30 ngày.'],
		collectionSlugs: ['banh-trung-thu'],
		alerts: [
			{ alertType: 'MINIMUM', threshold: 20 },
			{ alertType: 'REORDER', threshold: 50 },
		],
	},
	{
		title: 'Croissant Bơ Pháp',
		slug: 'croissant-bo-phap',
		description: 'Croissant ngàn lớp, thơm nức mùi bơ AOP.',
		unitPrice: 35000,
		unitCost: 19000,
		unit: 'cái',
		stock: 60,
		brandIndex: 1,
		tags: ['croissant', 'bo-phap', 'an-sang'],
		notes: ['Ngon nhất khi dùng trong ngày.'],
		collectionSlugs: ['hang-moi-ve'],
		alerts: [{ alertType: 'MINIMUM', threshold: 12 }],
	},
];

export async function seed(knex: Knex): Promise<void> {
	await knex.transaction(async (trx) => {
		// =========================================================================
		// 1. CLEANUP ALL EXISTING RECORDS (DELETES ON TOP IN DEPENDENCY ORDER)
		// =========================================================================
		// Storefront Layout Hierarchy
		await trx('composite_component_children').del();
		await trx('component_templates').del();
		await trx('page_layouts').del();
		await trx('composite_components').del();
		await trx('repeater_components').del();
		await trx('leaf_components').del();
		await trx('commerce_components').del();
		await trx('layout_components').del();

		// Storefront Themes & Releases
		await trx('color_palettes').del();
		await trx('typography').del();
		await trx('theme_settings').del();
		await trx('storefront_releases').del();
		await trx('storefronts').del();
		await trx('social_links').del();

		// Products Module
		await trx('product_collections').del();
		await trx('stock_alerts').del();
		await trx('product_stocks').del();
		await trx('product_tags').del();
		await trx('product_notes').del();
		await trx('product_images').del();
		await trx('products').del();
		await trx('collections').del();
		await trx('brands').del();
		await trx('vendors').del();

		// Recipe Search & Module
		await trx('recipe_search').del();
		await trx('recipe_tags').del();
		await trx('recipe_notes').del();
		await trx('recipe_tools').del();
		await trx('recipe_ingredients').del();
		await trx('recipe_steps').del();
		await trx('recipes').del();

		// Core Entities
		await trx('images').del();
		await trx('users').del();

		// =========================================================================
		// 2. SEED USERS & RECIPE MODULE
		// =========================================================================
		const userRows = await trx('users')
			.insert(users)
			.returning(['id', 'email', 'displayname', 'role']);

		const generatedRecipes: RecipeSeed[] = [...baseRecipes];
		for (const flavor of flavors) {
			for (const family of families) {
				generatedRecipes.push({
					title: `${family.name} ${flavor.name}`,
					description: buildDescription(family, flavor),
					portion: family.portion,
					tags: [...family.tags, flavor.tag, 'homemade'],
					ingredients: [
						...family.ingredients,
						[flavor.ingredient, flavor.amount, flavor.unit],
					],
					tools: family.tools,
					steps: buildFamilySteps(family.name, flavor),
					notes: buildFamilyNotes(family.name, flavor),
				});
			}
		}

		const imageRows = await trx('images')
			.insert(
				generatedRecipes.map((recipe, index) => ({
					display_name: `${recipe.title} cover`,
					original_name: `recipe-${index + 1}.jpg`,
					url: `https://picsum.photos/seed/bakers-recipe-${index + 1}/800/600`,
					content_type: 'image/jpeg',
				})),
			)
			.returning(['id']);

		for (let index = 0; index < generatedRecipes.length; index += 1) {
			const recipe = generatedRecipes[index];
			const user = userRows[index % userRows.length];
			const image = imageRows[index];
			const isPublic = index % 7 !== 0;
			const isSnapshot = isPublic && index % 11 === 0;

			const [createdRecipe] = await trx('recipes')
				.insert({
					...(index === 0
						? { id: HARD_CODED_RECIPE_ID_1 }
						: index === 1
							? { id: HARD_CODED_RECIPE_ID_2 }
							: {}),
					cover_img_id: image.id,
					user_id: user.id,
					title: recipe.title,
					description: recipe.description,
					portion: recipe.portion,
					is_public: isPublic,
					is_snapshot: isSnapshot,
					created_at: trx.raw(`NOW() - (? * INTERVAL '1 day')`, [index]),
				})
				.returning(['id']);

			const recipeId = createdRecipe.id;

			await trx('recipe_ingredients').insert(
				recipe.ingredients.map(([name, amount, unit]) => ({
					recipe_id: recipeId,
					name,
					amount,
					unit,
				})),
			);

			await trx('recipe_tools').insert(
				recipe.tools.map(([name, amount]) => ({
					recipe_id: recipeId,
					name,
					amount,
				})),
			);

			await trx('recipe_steps').insert(
				recipe.steps.map((description, stepIndex) => ({
					recipe_id: recipeId,
					step_order: stepIndex + 1,
					description,
				})),
			);

			await trx('recipe_notes').insert(
				recipe.notes.map((content, noteIndex) => ({
					recipe_id: recipeId,
					note_order: noteIndex + 1,
					content,
				})),
			);

			await trx('recipe_tags').insert(
				[...new Set(recipe.tags)].map((name) => ({
					recipe_id: recipeId,
					name,
				})),
			);
		}

		// =========================================================================
		// 3. SEED VENDORS, BRANDS & PRODUCTS
		// =========================================================================
		const vendorRows = await trx('users')
			.insert(
				vendorUsers.map(({ email, displayname, password, role }) => ({
					email,
					displayname,
					password,
					role,
				})),
			)
			.returning(['id']);

		await trx('vendors').insert(
			vendorRows.map((row, index) => ({
				id: row.id,
				tax_code: vendorUsers[index].taxCode,
				registered_at: trx.fn.now(),
			})),
		);

		const brandRows = await trx('brands')
			.insert(
				brands.map((brand, index) => ({
					name: brand.name,
					domain: brand.domain,
					vendor_id: vendorRows[index].id,
				})),
			)
			.returning(['id']);

		const collectionRows = await trx('collections')
			.insert(collections)
			.returning(['id', 'slug']);

		const collectionIdBySlug = new Map<string, string>(
			collectionRows.map((row: { id: string; slug: string }) => [
				row.slug,
				row.id,
			]),
		);

		for (let index = 0; index < products.length; index += 1) {
			const product = products[index];
			const [createdProduct] = await trx('products')
				.insert({
					brand_id: brandRows[product.brandIndex].id,
					vendor_id: vendorRows[product.brandIndex].id,
					title: product.title,
					description: product.description,
					slug: product.slug,
					unit_price: product.unitPrice,
					unit_cost: product.unitCost,
					currency: 'VND',
					unit: product.unit,
					created_at: trx.raw(`NOW() - (? * INTERVAL '1 day')`, [index]),
				})
				.returning(['id']);

			const productId = createdProduct.id;

			await trx('product_stocks').insert({
				id: productId,
				stock: product.stock,
			});

			if (product.alerts.length > 0) {
				await trx('stock_alerts').insert(
					product.alerts.map((alert) => ({
						product_stock_id: productId,
						alert_type: alert.alertType,
						threshold: alert.threshold,
					})),
				);
			}

			if (product.tags.length > 0) {
				await trx('product_tags').insert(
					product.tags.map((name) => ({
						product_id: productId,
						name,
					})),
				);
			}

			if (product.notes.length > 0) {
				await trx('product_notes').insert(
					product.notes.map((content) => ({
						product_id: productId,
						content,
					})),
				);
			}

			const matchedCollectionIds = product.collectionSlugs
				.map((slug) => collectionIdBySlug.get(slug))
				.filter((id): id is string => Boolean(id));

			if (matchedCollectionIds.length > 0) {
				await trx('product_collections').insert(
					matchedCollectionIds.map((collectionId) => ({
						product_id: productId,
						collection_id: collectionId,
					})),
				);
			}
		}

		// =========================================================================
		// 4. SEED STOREFRONT FOR THE DEFINED VENDOR (Hoa Sen Bakery)
		// =========================================================================
		const [storefront] = await trx('storefronts')
			.insert({
				id: HARD_CODED_STOREFRONT_ID,
				brand_id: brandRows[0].id,
			})
			.returning(['id']);

		const [release] = await trx('storefront_releases')
			.insert({
				id: HARD_CODED_STOREFRONT_RELEASE_ID,
				storefront_id: storefront.id,
				version: 1,
				display_name: 'v1.0.0 Production Release',
				is_active: true,
			})
			.returning(['id']);

		// Theme Settings, Typography & Palette
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
			color_primary: 0xd97706,
			color_primary_foreground: 0xffffff,
			color_secondary: 0x78350f,
			color_secondary_foreground: 0xffffff,
			color_accent: 0xf59e0b,
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

		// =========================================================================
		// 5. SEED COLLECTION PAGE LAYOUT
		// =========================================================================
		const [collectionRootGrid] = await trx('layout_components')
			.insert({
				name: 'Collection Page Main Layout',
				description: 'Stack organizing the collection page',
				config: JSON.stringify({
					h: 'auto',
					w: 'full',
					alignX: 'center',
					alignY: 'top',
					padding: { top: 'md', bottom: 'md', left: 'md', right: 'md' },
					colorScheme: 'default',
					colorPalette: { type: 'palette', token: 'background' },
					layout: 'UNIFORM',
					rows: { mobile: 2, tablet: 2, desktop: 2 },
					cols: { mobile: 1, tablet: 1, desktop: 1 },
					gap: { mobile: 16, tablet: 24, desktop: 32 },
					borderRadius: 0,
				}),
			})
			.returning(['id']);

		await trx('composite_components').insert({
			id: collectionRootGrid.id,
			component_type: 'GRID',
		});

		const [collectionIntroText] = await trx('layout_components')
			.insert({
				name: 'Collection Craft Introduction',
				description: 'Rich text narrative introducing the bakery collections',
				config: JSON.stringify({
					h: 'auto',
					w: 'full',
					alignX: 'center',
					alignY: 'top',
					padding: { top: 'md', bottom: 'md', left: 'md', right: 'md' },
					colorScheme: 'default',
					colorPalette: { type: 'palette', token: 'surface' },
					content: {
						body: '<h2>Our Artisanal Collection</h2><p>Every loaf and pastry at Hoa Sen Bakery is made with authentic ingredients and artisanal precision.</p>',
						format: 'html',
					},
				}),
			})
			.returning(['id']);

		await trx('leaf_components').insert({
			id: collectionIntroText.id,
			component_type: 'RICH_TEXT',
		});

		const [productCardBase] = await trx('layout_components')
			.insert({
				name: 'Pastry Product Card Template',
				description: 'Reusable product card template',
				config: JSON.stringify({
					h: 'auto',
					w: 'full',
					alignX: 'left',
					alignY: 'top',
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
								value: '{{ product.title }}',
								style: {
									textAlign: 'left',
									decoration: 'underline',
									txtColor: '0f172a',
									fontWeight: 'bold',
									fontStyle: 'normal',
								},
							},
							subtitle: {
								display: true,
								value: '{{ product.slug }}',
								style: {
									textAlign: 'left',
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
									textAlign: 'left',
									decoration: 'underline',
									txtColor: '334155',
									fontWeight: 400,
									fontStyle: 'normal',
								},
							},
							{
								type: 'priceTag',
								display: true,
								value: '{{ product.unitPrice }}',
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

		const [repeaterBase] = await trx('layout_components')
			.insert({
				name: 'Bakery Specialties Collection Grid',
				description:
					'Paginated repeater grid displaying featured bakery specialties',
				config: JSON.stringify({
					h: 'auto',
					w: 'full',
					alignX: 'center',
					alignY: 'top',
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

		await trx('composite_component_children').insert(
			BREAKPOINTS.flatMap((breakpoint) => [
				{
					composite_id: collectionRootGrid.id,
					child_id: collectionIntroText.id,
					breakpoint,
					sort_order: 1,
				},
				{
					composite_id: collectionRootGrid.id,
					child_id: repeaterBase.id,
					breakpoint,
					sort_order: 2,
				},
			]),
		);

		await trx('page_layouts').insert({
			storefront_release_id: release.id,
			type: 'COLLECTION',
			root_component_id: collectionRootGrid.id,
		});

		// =========================================================================
		// 6. SEED HOME MAIN PAGE LAYOUT (NEW STOREFRONT MAIN PAGE)
		// =========================================================================
		// Root Composite Uniform Grid (Vertical layout stack for Home)
		const [homeRootGrid] = await trx('layout_components')
			.insert({
				name: 'Home Page Root Grid Layout',
				description: 'Root container for the storefront main homepage',
				config: JSON.stringify({
					h: 'auto',
					w: 'full',
					alignX: 'stretch',
					alignY: 'top',
					padding: { top: 'none', bottom: 'lg', left: 'none', right: 'none' },
					colorScheme: 'default',
					colorPalette: { type: 'palette', token: 'background' },
					layout: 'UNIFORM',
					rows: { mobile: 2, tablet: 2, desktop: 2 },
					cols: { mobile: 1, tablet: 1, desktop: 1 },
					gap: { mobile: 24, tablet: 32, desktop: 40 },
					borderRadius: 0,
				}),
			})
			.returning(['id']);

		await trx('composite_components').insert({
			id: homeRootGrid.id,
			component_type: 'GRID',
		});

		// Section 1: Hero Banner Commerce Component
		const [homeHeroBanner] = await trx('layout_components')
			.insert({
				name: 'Home Primary Hero Banner',
				description: 'Top hero banner highlighting bakery daily specialties',
				config: JSON.stringify({
					h: 'lg',
					w: 'full',
					alignX: 'stretch',
					alignY: 'top',
					padding: { top: 'none', bottom: 'none', left: 'none', right: 'none' },
					colorScheme: 'default',
					colorPalette: { type: 'palette', token: 'background' },
					mediaType: 'image',
					desktopMediaUrl:
						'https://images.unsplash.com/photo-1517433670267-08bbd4be890f',
					mobileMediaUrl: null,
					altText: 'Artisan bakery bread and oven display',
					eyebrow: {
						value: 'FRESHLY BAKED DAILY',
						textAlign: 'center',
						decoration: 'underline',
						txtColor: 'd97706',
						fontWeight: 'bold',
						fontStyle: 'normal',
					},
					title: {
						value: 'Warm Loaves, Sweet Moments',
						textAlign: 'center',
						decoration: 'underline',
						txtColor: '0f172a',
						fontWeight: 'bold',
						fontStyle: 'normal',
					},
					subtitle: {
						value:
							'Handcrafted pastries, natural levain breads, and heartfelt bakes made fresh every morning.',
						textAlign: 'center',
						decoration: 'underline',
						txtColor: '475569',
						fontWeight: 400,
						fontStyle: 'normal',
					},
					contentPosition: 'middle-center',
					overlay: {
						type: 'solid',
						color: '#ffffff',
						opacity: 40,
					},
					primaryCta: {
						label: 'Explore Our Collection',
						url: 'https://hoasen-bakery.vn/collections',
						style: 'solid',
						size: 'lg',
						target: '_self',
					},
				}),
			})
			.returning(['id']);

		await trx('commerce_components').insert({
			id: homeHeroBanner.id,
			component_type: 'HERO_BANNER',
		});

		// Section 2: Features Composite Grid (3 columns)
		const [homeFeaturesGrid] = await trx('layout_components')
			.insert({
				name: 'Home Features Grid Container',
				description: 'Three column grid presenting the pillars of the bakery',
				config: JSON.stringify({
					h: 'auto',
					w: 'full',
					alignX: 'center',
					alignY: 'top',
					padding: { top: 'md', bottom: 'md', left: 'lg', right: 'lg' },
					colorScheme: 'default',
					colorPalette: { type: 'palette', token: 'surface' },
					layout: 'UNIFORM',
					rows: { mobile: 3, tablet: 1, desktop: 1 },
					cols: { mobile: 1, tablet: 3, desktop: 3 },
					gap: { mobile: 16, tablet: 20, desktop: 24 },
					borderRadius: 8,
				}),
			})
			.returning(['id']);

		await trx('composite_components').insert({
			id: homeFeaturesGrid.id,
			component_type: 'GRID',
		});

		// Child Leaf Cards for Home Features Grid
		const featureCardsData = [
			{
				name: 'Feature Pillar 1: Sourdough',
				body: '<h3>Natural Fermentation</h3><p>Slowly fermented for 24+ hours for rich flavor, prebiotic benefit, and golden airy crusts.</p>',
			},
			{
				name: 'Feature Pillar 2: Ingredients',
				body: '<h3>Pure Ingredients</h3><p>We source local seasonal ingredients, unbleached flour, and pure French butter without shortcuts.</p>',
			},
			{
				name: 'Feature Pillar 3: Daily Fresh',
				body: '<h3>Oven-Warm Daily</h3><p>Baked before dawn every single morning so you always enjoy fresh pastries and warm rolls.</p>',
			},
		];

		const featureCardIds: string[] = [];
		for (const card of featureCardsData) {
			const [leafCard] = await trx('layout_components')
				.insert({
					name: card.name,
					description: 'Highlight feature item card',
					config: JSON.stringify({
						h: 'auto',
						w: 'full',
						alignX: 'left',
						alignY: 'top',
						padding: { top: 'md', bottom: 'md', left: 'md', right: 'md' },
						colorScheme: 'default',
						colorPalette: { type: 'palette', token: 'surface' },
						content: {
							body: card.body,
							format: 'html',
						},
					}),
				})
				.returning(['id']);

			await trx('leaf_components').insert({
				id: leafCard.id,
				component_type: 'RICH_TEXT',
			});

			featureCardIds.push(leafCard.id);
		}

		// Attach 3 cards to Features Grid
		await trx('composite_component_children').insert(
			BREAKPOINTS.flatMap((breakpoint) =>
				featureCardIds.map((id, index) => ({
					composite_id: homeFeaturesGrid.id,
					child_id: id,
					breakpoint,
					sort_order: index + 1,
				})),
			),
		);

		// Attach Hero Banner and Features Grid to Home Root Grid
		await trx('composite_component_children').insert(
			BREAKPOINTS.flatMap((breakpoint) => [
				{
					composite_id: homeRootGrid.id,
					child_id: homeHeroBanner.id,
					breakpoint,
					sort_order: 1,
				},
				{
					composite_id: homeRootGrid.id,
					child_id: homeFeaturesGrid.id,
					breakpoint,
					sort_order: 2,
				},
			]),
		);

		// Attach HOME layout to Storefront Release
		await trx('page_layouts').insert({
			storefront_release_id: release.id,
			type: 'HOME',
			root_component_id: homeRootGrid.id,
		});
	});
}
