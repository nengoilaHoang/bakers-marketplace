import type { Knex } from 'knex';
import { appendRecipeToken } from '../../utils/post-content.js';

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
const MATTROI_STOREFRONT_ID = '66666666-6666-4666-8666-666666666666';
const MATTROI_STOREFRONT_RELEASE_ID = '77777777-7777-4777-8777-777777777777';

const BREAKPOINTS = ['mobile', 'tablet', 'desktop'] as const;

// Mỗi tài khoản dùng chung một mật khẩu "Bakers@123" (bcrypt, 12 vòng như bcrypt.service).
const SEED_PASSWORD_HASH =
  '$2b$12$ZN9SBrqZPM3zIS2/JOUkX.8ffdiJ7LDy0O69ZMo.0HOlERB8pDc0K';

const users = [
  {
    id: HARD_CODED_USER_ID,
    email: 'minhanh@example.com',
    displayname: 'Nguyễn Minh Anh',
    hashed_password: SEED_PASSWORD_HASH,
    role: 'CUSTOMER',
  },
  {
    email: 'baongoc@example.com',
    displayname: 'Trần Bảo Ngọc',
    hashed_password: SEED_PASSWORD_HASH,
    role: 'CUSTOMER',
  },
  {
    email: 'hoangnam@example.com',
    displayname: 'Lê Hoàng Nam',
    hashed_password: SEED_PASSWORD_HASH,
    role: 'CUSTOMER',
  },
  {
    email: 'thaovy@example.com',
    displayname: 'Phạm Thảo Vy',
    hashed_password: SEED_PASSWORD_HASH,
    role: 'CUSTOMER',
  },
  {
    email: 'quochuy@example.com',
    displayname: 'Đặng Quốc Huy',
    hashed_password: SEED_PASSWORD_HASH,
    role: 'CUSTOMER',
  },
];

// Inserted apart from `users` so the admin does not author seeded recipes or posts.
const adminUser = {
  email: 'admin@example.com',
  displayname: 'Quản trị viên',
  hashed_password: SEED_PASSWORD_HASH,
  role: 'ADMIN',
};

const baseRecipes: RecipeSeed[] = [
  {
    title: 'Bánh Chocolate Fudge',
    description:
      'Bánh chocolate fudge đậm vị cacao truyền thống. Chocolate sánh mịn béo ngậy, ngọt vừa phải. Công thức phù hợp làm quà sinh nhật hoặc tráng miệng.',
    portion: 8,
    tags: ['chocolate', 'cake', 'dessert', 'birthday'],
    ingredients: [
      ['Bơ lạt', 180, 'g'],
      ['Bột cacao', 55, 'g'],
      ['Đường tinh luyện', 160, 'g'],
      ['Trứng gà', 3, 'quả'],
      ['Sữa tươi không đường', 180, 'ml'],
      ['Bột mì đa dụng', 100, 'g'],
      ['Chocolate đen 65%', 120, 'g'],
    ],
    tools: [
      ['Lò nướng', 1],
      ['Máy đánh trứng', 1],
      ['Khuôn tròn 20cm', 1],
    ],
    steps: [
      'Làm nóng lò 175°C trong ít nhất 15 phút. Lót giấy nến vào khuôn tròn 20cm.',
      'Rây bột mì và bột cacao, trộn đều với đường tinh luyện.',
      'Đun cách thủy chocolate đen cho tan chảy hoàn toàn.',
      'Đánh tan trứng với sữa tươi, rót chocolate vào trộn đều.',
      'Cho bột vào fold nhẹ tay đến khi vừa quyện.',
      'Đổ vào khuôn, nướng 32-38 phút đến khi tăm rút ra còn ẩm.',
      'Để nguội trong khuôn 15 phút trước khi lấy ra rack.',
    ],
    notes: [
      'Không nướng quá khô để giữ lòng bánh mềm ẩm.',
      'Ngon hơn sau khi bảo quản lạnh 2 giờ trong tủ mát.',
    ],
  },
];

const flavors: Flavor[] = [
  {
    name: 'Dâu',
    tag: 'strawberry',
    ingredient: 'Dâu tây xay nhuyễn',
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
    profile: 'Hương trà xanh thơm ngát, hậu vị chát thanh.',
    tip: 'Rây kỹ bột matcha để không bị vón cục.',
  },
  {
    name: 'Caramel',
    tag: 'caramel',
    ingredient: 'Sốt caramel',
    amount: 90,
    unit: 'g',
    profile: 'Ngọt béo đậm đà, thơm dậy mùi bơ.',
    tip: 'Để sốt nguội hoàn toàn trước khi fold vào kem tươi.',
  },
];

const families: Family[] = [
  {
    name: 'Mousse',
    description: 'Mousse mềm mịn mát lạnh tan ngay trong miệng.',
    tags: ['mousse', 'cold-dessert'],
    ingredients: [
      ['Whipping cream', 250, 'ml'],
      ['Gelatin', 7, 'g'],
      ['Đường', 60, 'g'],
    ],
    tools: [
      ['Máy đánh trứng', 1],
      ['Phới dẹt', 1],
      ['Khuôn mousse 16cm', 1],
    ],
    portion: 6,
  },
  {
    name: 'Chiffon Cake',
    description: 'Chiffon cake bông xốp nhẹ tênh như mây.',
    tags: ['chiffon', 'cake'],
    ingredients: [
      ['Bột mì số 8', 120, 'g'],
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
  return `${family.description} Phiên bản vị ${flavor.name.toLowerCase()} dùng ${flavor.ingredient.toLowerCase()}. ${flavor.profile}`;
}

function buildFamilySteps(familyName: string, flavor: Flavor): string[] {
  return [
    `Chuẩn bị nguyên liệu bao gồm ${flavor.amount}${flavor.unit} ${flavor.ingredient.toLowerCase()}.`,
    `Thực hiện các thao tác theo từng bước tiêu chuẩn của bánh ${familyName}.`,
    'Bảo quản ở nhiệt độ thích hợp trước khi thưởng thức.',
  ];
}

function buildFamilyNotes(_familyName: string, flavor: Flavor): string[] {
  return [flavor.tip, 'Bảo quản trong tủ mát từ 2-3 ngày.'];
}

// ==========================================================
// VENDORS & PRODUCTS CONFIG
// ==========================================================
const vendorUsers = [
  {
    email: 'vendor.hoasen@example.com',
    displayname: 'Tiệm Bánh Hoa Sen',
    hashed_password: SEED_PASSWORD_HASH,
    role: 'VENDOR' as const,
    taxCode: '0312345678',
  },
  {
    email: 'vendor.mattroi@example.com',
    displayname: 'Bánh Ngọt Mặt Trời',
    hashed_password: SEED_PASSWORD_HASH,
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
    description: 'Croissant ngàn lớp, thơm bơ AOP.',
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

// ==========================================================
// POSTS CONFIG
// ==========================================================
type PostSeed = {
  title: string;
  content: string;
  tags: string[];
  recipeTitle?: string;
  reportReasons?: string[];
};

const posts: PostSeed[] = [
  {
    title: 'Mousse dâu cho buổi chiều cuối tuần',
    content:
      'Trời nắng nóng nên mình làm liền ổ mousse dâu tây. Lớp mousse mềm mịn, chua ngọt vừa phải, cắt ra thơm ngát từng miếng. Mọi người thử nha.',
    tags: ['mousse', 'strawberry'],
    recipeTitle: 'Mousse Dâu',
  },
  {
    title: 'Chiffon dẹp, mọi người giải cứu mình với',
    content:
      'Mình làm theo đúng công thức nhưng lấy ra khỏi lò được 5 phút thì bánh xẹp lép. Có phải do mình đánh lòng trắng chưa đủ chóp không ạ?',
    tags: ['chiffon', 'hoi-dap'],
    recipeTitle: 'Chiffon Cake Dâu',
  },
  {
    title: 'Mẹo pha matcha không bị vón',
    content:
      'Nên rây matcha vào bát trước, thêm nước ấm 70-80 độ rồi khuấy nhanh tay. Đừng dùng nước sôi kẻo biến chất vị đắng chát.',
    tags: ['matcha', 'tips'],
  },
  {
    title: 'Mousse matcha thanh mát vừa miệng',
    content:
      'Hôm nay thèm mousse matcha Uji. Vị đắng nhẹ quyện kem tươi béo ngậy, màu xanh mướt mắt.',
    tags: ['matcha', 'mousse'],
    recipeTitle: 'Mousse Matcha',
  },
  {
    title: 'Khoe mẻ croissant đầu tiên ra lò',
    content:
      'Cán tay nhọc nhằn nhưng thành quả ngàn lớp xốp giòn. Thơm nức gian bếp.',
    tags: ['croissant', 'khoe-banh'],
  },
  {
    title: 'Chiffon matcha cao 12cm nở đẹp',
    content:
      'Cuối cùng cũng làm được chiffon nở chuẩn chỉnh không bị thắt đáy.',
    tags: ['chiffon', 'matcha'],
    recipeTitle: 'Chiffon Cake Matcha',
  },
  {
    title: 'Nên dùng bơ nhạt hay bơ mặn khi nướng bánh?',
    content:
      'Nhiều bạn hỏi thay bơ lạt bằng bơ phe được không. Lời khuyên là bánh âu luôn ưu tiên bơ động vật.',
    tags: ['hoi-dap', 'nguyen-lieu'],
  },
  {
    title: 'Mousse caramel cho tiệc sinh nhật',
    content:
      'Lớp caramel béo ngậy phủ trên mousse bồng bềnh, ai ăn cũng thích mê.',
    tags: ['caramel', 'mousse', 'birthday'],
    recipeTitle: 'Mousse Caramel',
  },
  {
    title: 'Nhiệt lò thực tế khác xa số trên núm vặn',
    content:
      'Mới mua nhiệt kế lò mới thấy lò nhà mình lệch tận 15 độ C so với núm xoay.',
    tags: ['tips', 'lo-nuong'],
  },
  {
    title: 'Chiffon caramel thơm ngát gian bếp',
    content: 'Một chút caramel tự nấu giúp chiffon thơm ngon vượt bậc.',
    tags: ['chiffon', 'caramel'],
    recipeTitle: 'Chiffon Cake Caramel',
  },
  {
    title: 'Bánh mì hoa cúc lần 3 thành công',
    content: 'Thớ bánh xé sợi dai mềm, thơm phức tinh dầu hoa cam.',
    tags: ['banh-mi', 'khoe-banh'],
  },
  {
    title: 'Xin gợi ý khuôn bánh chống dính tốt',
    content:
      'Khuôn nhôm gia công hay khuôn chống dính carbon xài bền hơn mọi người?',
    tags: ['dung-cu', 'hoi-dap'],
  },
  {
    title: 'Bánh trung thu nhân thập cẩm tự làm',
    content:
      'Tự làm nhân thập cẩm tuy lách cách nhưng vừa miệng và sạch sẽ hơn mua sẵn.',
    tags: ['trung-thu', 'banh-nuong'],
  },
  {
    title: 'Cách bảo quản kem tươi tránh bị tách nước',
    content:
      'Đừng để hộp kem sát vách tủ lạnh, nên quấn màng bọc dùng trong 24-48 giờ.',
    tags: ['tips', 'whipping-cream'],
  },
  {
    title: 'Tiramisu không dùng trứng sống',
    content: 'Công thức tiệt trùng lòng đỏ cách thủy giúp an tâm thưởng thức.',
    tags: ['tiramisu', 'dessert'],
  },
  {
    title: 'Làm bánh quy bơ cùng con nhỏ',
    content: 'Bánh quy bơ đơn giản, cả hai mẹ con vừa chơi vừa nướng rất vui.',
    tags: ['cookie', 'gia-dinh'],
  },
  {
    title: 'Bột mì số 8 và số 11 khác nhau thế nào?',
    content:
      'Bột số 8 hàm lượng protein thấp cho bánh mềm ẩm, số 11 tạo thớ bánh dai giòn.',
    tags: ['hoi-dap', 'nguyen-lieu'],
  },
  {
    title: 'Tart trứng Bồ Đào Nha vỏ ngàn lớp',
    content: 'Vỏ giòn rụm nhiều tầng, nhân trứng sữa béo ngậy ngọt ngào.',
    tags: ['tart', 'khoe-banh'],
  },
  {
    title: 'Thanh lý lò nướng giá rẻ, inbox ngay',
    content:
      'Thanh lý lò nướng 50L mới 99%, liên hệ qua zalo ngay để nhận giá tốt.',
    tags: ['thanh-ly'],
    reportReasons: ['Spam quảng cáo', 'Nội dung không liên quan làm bánh'],
  },
  {
    title: 'Bánh chocolate không cần lò nướng',
    content: 'Công thức đun cách thủy trên chảo chống dính siêu tiện lợi.',
    tags: ['chocolate', 'khong-lo'],
    reportReasons: ['Thông tin không chính xác'],
  },
];

const postComments = [
  'Nhìn ngon quá, cuối tuần mình sẽ làm thử!',
  'Bánh nở đẹp và màu mướt mắt quá bạn ơi.',
  'Cảm ơn bạn đã chia sẻ bí quyết bổ ích.',
  'Công thức chuẩn chỉnh, làm lần đầu ăn ngon luôn.',
];

const POST_AUTHOR_REPLY =
  'Cảm ơn bạn nha, làm xong nhớ chia sẻ kết quả cùng nhóm nhé!';

// ==========================================================
// MODERATION CONFIG (reports, warnings, takedowns)
// ==========================================================
// Spam account, banned right now: signing in is refused with the ban reason.
// Inserted apart from `users` so it does not shift who authors the seeded posts.
const bannedUser = {
  email: 'giasi.shop@example.com',
  displayname: 'Shop Bánh Giá Sỉ',
  hashed_password: SEED_PASSWORD_HASH,
  role: 'CUSTOMER',
  status: 'BANNED',
};

const spamPost = {
  title: 'Nhận order bánh sỉ giá gốc, inbox Zalo',
  content:
    'Nhận làm bánh sinh nhật, bánh kem giá sỉ chỉ từ 50k. Đặt cọc trước 50%, inbox Zalo 09xx để chốt đơn liền tay!',
  tags: ['quang-cao'],
};

const restoredPost = {
  title: 'Bánh bông lan trứng muối sốt phô mai',
  content:
    'Mẻ bông lan trứng muối đầu tiên của mình, sốt phô mai tự nấu nên hơi đặc. Lần sau mình sẽ giảm bớt bột năng.',
  tags: ['bong-lan', 'trung-muoi'],
};

const warnedPost = {
  title: 'Đừng mua bánh ở tiệm đầu hẻm, dở tệ',
  content:
    'Bánh vừa khô vừa ngọt gắt, chủ tiệm thì thái độ. Ai mua ở đó là phí tiền, mọi người tẩy chay giùm mình.',
  tags: ['review'],
};

type ReportTargetSeed = { postId: string } | { targetUserId: string };

type HandledSeed = {
  status: 'DISMISSED' | 'RESOLVED';
  handledBy: string;
  hoursAgo: number;
  note: string;
};

function hoursAgo(trx: Knex.Transaction, hours: number) {
  return trx.raw(`NOW() - (? * INTERVAL '1 hour')`, [hours]);
}

function pickOtherUsers<T extends { id: string }>(
  userRows: T[],
  excludedUserId: string,
  offset: number,
  count: number,
): T[] {
  const others = userRows.filter((user) => user.id !== excludedUserId);
  return Array.from(
    { length: Math.min(count, others.length) },
    (_, index) => others[(offset + index) % others.length],
  );
}

async function createRecipeSnapshot(
  trx: Knex.Transaction,
  recipeId: string,
): Promise<string> {
  const result = await trx.raw(
    `INSERT INTO recipes (cover_img_id, user_id, title, description, portion, is_public, is_snapshot, created_at, updated_at) 
     SELECT cover_img_id, user_id, title, description, portion, TRUE, TRUE, created_at, updated_at 
     FROM recipes 
     WHERE id = ? 
     RETURNING id`,
    [recipeId],
  );
  const snapshotId: string = result.rows[0].id;

  await trx.raw(
    `INSERT INTO recipe_ingredients (recipe_id, cover_img_id, name, amount, unit) 
     SELECT ?, cover_img_id, name, amount, unit 
     FROM recipe_ingredients 
     WHERE recipe_id = ?`,
    [snapshotId, recipeId],
  );

  await trx.raw(
    `INSERT INTO recipe_tools (recipe_id, cover_img_id, name, amount) 
     SELECT ?, cover_img_id, name, amount 
     FROM recipe_tools 
     WHERE recipe_id = ?`,
    [snapshotId, recipeId],
  );

  await trx.raw(
    `INSERT INTO recipe_steps (recipe_id, step_order, description) 
     SELECT ?, step_order, description 
     FROM recipe_steps 
     WHERE recipe_id = ?`,
    [snapshotId, recipeId],
  );

  await trx.raw(
    `INSERT INTO recipe_notes (recipe_id, note_order, content) 
     SELECT ?, note_order, content 
     FROM recipe_notes 
     WHERE recipe_id = ?`,
    [snapshotId, recipeId],
  );

  await trx.raw(
    `INSERT INTO recipe_tags (recipe_id, name) 
     SELECT ?, name 
     FROM recipe_tags 
     WHERE recipe_id = ?`,
    [snapshotId, recipeId],
  );

  return snapshotId;
}

/** Inserts a report and its post_reports / user_reports row; without `handled` it stays PENDING. */
async function seedReport(
  trx: Knex.Transaction,
  report: {
    reporterId: string;
    reason: string;
    hoursAgo: number;
    target: ReportTargetSeed;
    handled?: HandledSeed;
  },
): Promise<string> {
  const { handled } = report;
  const [created] = await trx('reports')
    .insert({
      reporter_id: report.reporterId,
      reason: report.reason,
      created_at: hoursAgo(trx, report.hoursAgo),
      ...(handled && {
        status: handled.status,
        handled_by: handled.handledBy,
        handled_at: hoursAgo(trx, handled.hoursAgo),
        note: handled.note,
      }),
    })
    .returning(['id']);

  if ('postId' in report.target) {
    await trx('post_reports').insert({
      id: created.id,
      post_id: report.target.postId,
    });
  } else {
    await trx('user_reports').insert({
      id: created.id,
      target_user_id: report.target.targetUserId,
    });
  }

  return created.id;
}

/** Inserts a takedown and its post_removals / user_bans row; without `revoked` it is still in force. */
async function seedTakedown(
  trx: Knex.Transaction,
  takedown: {
    target: { postId: string } | { userId: string };
    issuedBy: string;
    reason: string;
    hoursAgo: number;
    revoked?: { by: string; hoursAgo: number };
  },
): Promise<void> {
  const { revoked } = takedown;
  const [created] = await trx('takedowns')
    .insert({
      issued_by: takedown.issuedBy,
      reason: takedown.reason,
      issued_at: hoursAgo(trx, takedown.hoursAgo),
      ...(revoked && {
        revoked_by: revoked.by,
        revoked_at: hoursAgo(trx, revoked.hoursAgo),
      }),
    })
    .returning(['id']);

  if ('postId' in takedown.target) {
    await trx('post_removals').insert({
      id: created.id,
      post_id: takedown.target.postId,
    });
  } else {
    await trx('user_bans').insert({
      id: created.id,
      user_id: takedown.target.userId,
    });
  }
}

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

    // Admin Module
    await trx('user_bans').del();
    await trx('post_removals').del();
    await trx('takedowns').del();
    await trx('warning_reports').del();
    await trx('warnings').del();
    await trx('user_reports').del();

    // Posts Module
    await trx('post_reports').del();
    await trx('reports').del();
    await trx('post_saves').del();
    await trx('post_likes').del();
    await trx('post_comments').del();
    await trx('post_tags').del();
    await trx('posts').del();

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

    const [adminRow] = await trx('users').insert(adminUser).returning(['id']);

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
        vendorUsers.map(({ email, displayname, hashed_password, role }) => ({
          email,
          displayname,
          hashed_password,
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
    // 4. SEED STOREFRONT FOR Hoa Sen Bakery (vendor.hoasen@example.com)
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
    await trx('theme_settings').insert({ id: release.id });
    await trx('color_palettes').insert({
      id: release.id,
      color_background: '#ffffff',
      color_surface: '#f8fafc',
      color_border: '#e2e8f0',
      color_text_primary: '#0f172a',
      color_text_secondary: '#64748b',
      color_primary: '#d97706',
      color_primary_foreground: '#ffffff',
      color_secondary: '#78350f',
      color_secondary_foreground: '#ffffff',
      color_accent: '#f59e0b',
      color_accent_foreground: '#000000',
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
    // 5. SEED COLLECTION PAGE LAYOUT FOR Hoa Sen Bakery
    // =========================================================================
    const [collectionRootGrid] = await trx('layout_components')
      .insert({
        name: 'Collection Page Main Layout',
        description: 'Stack organizing the collection page',
        config: JSON.stringify({
          h: 'auto',
          w: 'full',
          alignSelfX: 'center',
          alignSelfY: 'top',
          padding: { top: 'md', bottom: 'md', left: 'md', right: 'md' },
          surfaceTheme: 'default',
          layout: 'UNIFORM',
          rows: { mobile: 2, tablet: 2, desktop: 2 },
          cols: { mobile: 1, tablet: 1, desktop: 1 },
          rowHeight: {
            desktop: { mode: 'auto', minHeightPx: 120 },
            tablet: { mode: 'auto', minHeightPx: 120 },
            mobile: { mode: 'auto', minHeightPx: 120 },
          },
          densePacking: false,
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
          alignSelfX: 'center',
          alignSelfY: 'top',
          padding: { top: 'md', bottom: 'md', left: 'md', right: 'md' },
          surfaceTheme: 'surface',
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
          alignSelfX: 'left',
          alignSelfY: 'top',
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
                  textColor: '#0f172a',
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
                  textColor: '#64748b',
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
                  textColor: '#334155',
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
          alignSelfX: 'center',
          alignSelfY: 'top',
          padding: { top: 'md', bottom: 'md', left: 'none', right: 'none' },
          surfaceTheme: 'default',
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
    // 6. SEED HOME MAIN PAGE LAYOUT FOR Hoa Sen Bakery
    // =========================================================================
    const [homeRootGrid] = await trx('layout_components')
      .insert({
        name: 'Home Page Root Grid Layout',
        description: 'Root container for the storefront main homepage',
        config: JSON.stringify({
          h: 'auto',
          w: 'full',
          alignSelfX: 'stretch',
          alignSelfY: 'top',
          padding: { top: 'none', bottom: 'lg', left: 'none', right: 'none' },
          surfaceTheme: 'default',
          layout: 'UNIFORM',
          rows: { mobile: 2, tablet: 2, desktop: 2 },
          cols: { mobile: 1, tablet: 1, desktop: 1 },
          rowHeight: {
            desktop: { mode: 'auto', minHeightPx: 120 },
            tablet: { mode: 'auto', minHeightPx: 120 },
            mobile: { mode: 'auto', minHeightPx: 120 },
          },
          densePacking: false,
          gap: { mobile: 24, tablet: 32, desktop: 40 },
          borderRadius: 0,
        }),
      })
      .returning(['id']);
    await trx('composite_components').insert({
      id: homeRootGrid.id,
      component_type: 'GRID',
    });

    const [homeHeroBanner] = await trx('layout_components')
      .insert({
        name: 'Home Primary Hero Banner',
        description: 'Top hero banner highlighting bakery daily specialties',
        config: JSON.stringify({
          w: 'full',
          aspect: '16:9',
          fit: 'cover',
          alignSelfX: 'stretch',
          alignSelfY: 'top',
          mediaType: 'image',
          desktopMediaUrl:
            'https://static.vecteezy.com/system/resources/previews/008/660/558/non_2x/organic-food-background-hand-drawn-concept-free-vector.jpg',
          mobileMediaUrl: null,
          altText: 'Artisan bakery bread and oven display',
          eyebrow: {
            value: 'FRESHLY BAKED DAILY',
            textAlign: 'center',
            decoration: 'underline',
            textColor: '#d97706',
            fontWeight: 'bold',
            fontStyle: 'normal',
          },
          title: {
            value: 'Warm Loaves, Sweet Moments',
            textAlign: 'center',
            decoration: 'underline',
            textColor: '#0f172a',
            fontWeight: 'bold',
            fontStyle: 'normal',
          },
          subtitle: {
            value:
              'Handcrafted pastries, natural levain breads, and heartfelt bakes made fresh every morning.',
            textAlign: 'center',
            decoration: 'underline',
            textColor: '#475569',
            fontWeight: 400,
            fontStyle: 'normal',
          },
          contentPosition: {
            desktop: 'middle-center',
            tablet: 'middle-center',
            mobile: 'middle-center',
          },
          contentSize: 'large',
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

    const [homeFeaturesGrid] = await trx('layout_components')
      .insert({
        name: 'Home Features Grid Container',
        description: 'Three column grid presenting the pillars of the bakery',
        config: JSON.stringify({
          h: 'auto',
          w: 'full',
          alignSelfX: 'center',
          alignSelfY: 'top',
          padding: { top: 'md', bottom: 'md', left: 'lg', right: 'lg' },
          surfaceTheme: 'surface',
          layout: 'UNIFORM',
          rows: { mobile: 3, tablet: 1, desktop: 1 },
          cols: { mobile: 1, tablet: 3, desktop: 3 },
          rowHeight: {
            desktop: { mode: 'fixed', baseHeightPx: 180 },
            tablet: { mode: 'fixed', baseHeightPx: 160 },
            mobile: { mode: 'auto', minHeightPx: 120 },
          },
          densePacking: true,
          gap: { mobile: 16, tablet: 20, desktop: 24 },
          borderRadius: 8,
        }),
      })
      .returning(['id']);

    await trx('composite_components').insert({
      id: homeFeaturesGrid.id,
      component_type: 'GRID',
    });

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
            alignSelfX: 'left',
            alignSelfY: 'top',
            padding: { top: 'md', bottom: 'md', left: 'md', right: 'md' },
            surfaceTheme: 'surface',
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

    await trx('page_layouts').insert({
      storefront_release_id: release.id,
      type: 'HOME',
      root_component_id: homeRootGrid.id,
    });

    // =========================================================================
    // 7. SEED STOREFRONT & BENTO GRID HOME LAYOUT (vendor.mattroi@example.com)
    // =========================================================================
    const mattroiBrand = brandRows[1]; // Sunrise Patisserie

    const [mattroiStorefront] = await trx('storefronts')
      .insert({
        id: MATTROI_STOREFRONT_ID,
        brand_id: mattroiBrand.id,
      })
      .returning(['id']);

    const [mattroiRelease] = await trx('storefront_releases')
      .insert({
        id: MATTROI_STOREFRONT_RELEASE_ID,
        storefront_id: mattroiStorefront.id,
        version: 1,
        display_name: 'v1.0.0 Sunrise Bento Release',
        is_active: true,
      })
      .returning(['id']);

    // Theme Settings, Typography & Palette
    await trx('theme_settings').insert({ id: mattroiRelease.id });
    await trx('color_palettes').insert({
      id: mattroiRelease.id,
      color_background: '#fffbf5',
      color_surface: '#ffffff',
      color_border: '#f1e6d0',
      color_text_primary: '#1c1917',
      color_text_secondary: '#78716c',
      color_primary: '#ea580c',
      color_primary_foreground: '#ffffff',
      color_secondary: '#9a3412',
      color_secondary_foreground: '#ffffff',
      color_accent: '#f97316',
      color_accent_foreground: '#ffffff',
    });
    await trx('typography').insert({
      id: mattroiRelease.id,
      heading_font: 'Fraunces',
      body_font: 'Plus Jakarta Sans',
      heading_weight: 700,
      body_weight: 400,
      heading_line_height: 1.2,
      body_line_height: 1.6,
      heading_letter_spacing: -0.015,
      body_letter_spacing: 0.0,
    });

    // Root Composite Component: BENTO Grid Layout
    const [mattroiHomeBentoGrid] = await trx('layout_components')
      .insert({
        name: 'Sunrise Patisserie Home Bento Grid',
        description: 'Bento grid layout for Sunrise Patisserie home page',
        config: JSON.stringify({
          h: 'full',
          w: 'full',
          alignSelfX: 'stretch',
          alignSelfY: 'top',
          padding: { top: 'md', bottom: 'lg', left: 'md', right: 'md' },
          surfaceTheme: 'default',
          layout: 'BENTO',
          rows: { mobile: 4, tablet: 3, desktop: 2 },
          cols: { mobile: 1, tablet: 2, desktop: 4 },
          rowHeight: {
            desktop: { mode: 'fixed', baseHeightPx: 180 },
            tablet: { mode: 'fixed', baseHeightPx: 160 },
            mobile: { mode: 'auto', minHeightPx: 120 },
          },
          densePacking: true,
          gap: { mobile: 16, tablet: 20, desktop: 24 },
          borderRadius: 16,
        }),
      })
      .returning(['id']);

    await trx('composite_components').insert({
      id: mattroiHomeBentoGrid.id,
      component_type: 'GRID',
    });

    // Bento Cell 1: Featured Card (desktop colSpan: 2, rowSpan: 2)
    const [bentoHeroCard] = await trx('layout_components')
      .insert({
        name: 'Sunrise Bento Featured Special',
        description: 'Large hero card spanning 2x2 in the bento grid',
        config: JSON.stringify({
          h: 'full',
          w: 'full',
          alignSelfX: 'left',
          alignSelfY: 'bottom',
          colSpan: 2,
          rowSpan: 2,
          padding: { top: 'lg', bottom: 'lg', left: 'lg', right: 'lg' },
          surfaceTheme: 'accent',
          content: {
            body: '<h2>Fresh Morning Bakes</h2><p>Crispy French butter croissants baked fresh at dawn every single day.</p>',
            format: 'html',
          },
        }),
      })
      .returning(['id']);

    await trx('leaf_components').insert({
      id: bentoHeroCard.id,
      component_type: 'RICH_TEXT',
    });

    // Bento Cell 2: Promotion Card (desktop colSpan: 2, rowSpan: 1)
    const [bentoPromoCard] = await trx('layout_components')
      .insert({
        name: 'Sunrise Bento Promo Card',
        description: 'Wide horizontal promo card',
        config: JSON.stringify({
          h: 'full',
          w: 'full',
          alignSelfX: 'left',
          alignSelfY: 'center',
          colSpan: 2,
          rowSpan: 1,
          padding: { top: 'md', bottom: 'md', left: 'md', right: 'md' },
          surfaceTheme: 'surface',
          content: {
            body: '<h3>Weekend Special: 20% Off Pastry Sets</h3><p>Use code <strong>SUNRISE20</strong> at checkout.</p>',
            format: 'html',
          },
        }),
      })
      .returning(['id']);

    await trx('leaf_components').insert({
      id: bentoPromoCard.id,
      component_type: 'RICH_TEXT',
    });

    // Bento Cell 3: Secondary Feature 1 (desktop colSpan: 1, rowSpan: 1)
    const [bentoFeature1] = await trx('layout_components')
      .insert({
        name: 'Sunrise Bento Feature Pure Butter',
        description: 'Standard bento cell highlighting butter source',
        config: JSON.stringify({
          h: 'full',
          w: 'full',
          alignSelfX: 'center',
          alignSelfY: 'center',
          colSpan: 1,
          rowSpan: 1,
          padding: { top: 'sm', bottom: 'sm', left: 'sm', right: 'sm' },
          surfaceTheme: 'surface',
          content: {
            body: '<h4>100% AOP Butter</h4><p>Imported Normandy butter for flaky lamination.</p>',
            format: 'html',
          },
        }),
      })
      .returning(['id']);

    await trx('leaf_components').insert({
      id: bentoFeature1.id,
      component_type: 'RICH_TEXT',
    });

    // Bento Cell 4: Secondary Feature 2 (desktop colSpan: 1, rowSpan: 1)
    const [bentoFeature2] = await trx('layout_components')
      .insert({
        name: 'Sunrise Bento Feature Hours',
        description: 'Standard bento cell highlighting operating hours',
        config: JSON.stringify({
          h: 'full',
          w: 'full',
          alignSelfX: 'center',
          alignSelfY: 'center',
          colSpan: 1,
          rowSpan: 1,
          padding: { top: 'sm', bottom: 'sm', left: 'sm', right: 'sm' },
          surfaceTheme: 'surface',
          content: {
            body: '<h4>Open Daily</h4><p>From 06:30 to 21:00 every single day.</p>',
            format: 'html',
          },
        }),
      })
      .returning(['id']);

    await trx('leaf_components').insert({
      id: bentoFeature2.id,
      component_type: 'RICH_TEXT',
    });

    // Attach children to Bento Grid across all responsive breakpoints
    const bentoChildren = [
      bentoHeroCard.id,
      bentoPromoCard.id,
      bentoFeature1.id,
      bentoFeature2.id,
    ];

    await trx('composite_component_children').insert(
      BREAKPOINTS.flatMap((breakpoint) =>
        bentoChildren.map((childId, index) => ({
          composite_id: mattroiHomeBentoGrid.id,
          child_id: childId,
          breakpoint,
          sort_order: index + 1,
        })),
      ),
    );

    // Attach HOME layout to Storefront Release
    await trx('page_layouts').insert({
      storefront_release_id: mattroiRelease.id,
      type: 'HOME',
      root_component_id: mattroiHomeBentoGrid.id,
    });

    // =========================================================================
    // 8. SEED POSTS, COMMENTS, LIKES, SAVES & REPORTS
    // =========================================================================
    const publicRecipeRows = await trx('recipes')
      .select('id', 'title', 'user_id')
      .where({ is_public: true, is_snapshot: false });

    const recipeByTitle = new Map<string, { id: string; userId: string }>(
      publicRecipeRows.map(
        (row: { id: string; title: string; userId: string }) => [
          row.title,
          { id: row.id, userId: row.userId },
        ],
      ),
    );

    for (let index = 0; index < posts.length; index += 1) {
      const post = posts[index];
      const recipe = post.recipeTitle
        ? recipeByTitle.get(post.recipeTitle)
        : undefined;
      const authorId = recipe?.userId ?? userRows[index % userRows.length].id;
      const snapshotId = recipe
        ? await createRecipeSnapshot(trx, recipe.id)
        : null;

      const hoursAgo = (index + 1) * 6;

      const [createdPost] = await trx('posts')
        .insert({
          author_id: authorId,
          title: post.title,
          content: snapshotId
            ? appendRecipeToken(post.content, snapshotId)
            : post.content,
          created_at: trx.raw(`NOW() - (? * INTERVAL '1 hour')`, [hoursAgo]),
          updated_at: trx.raw(`NOW() - (? * INTERVAL '1 hour')`, [hoursAgo]),
        })
        .returning(['id']);

      const postId = createdPost.id;

      await trx('post_tags').insert(
        post.tags.map((name) => ({
          post_id: postId,
          name,
        })),
      );

      const commenters = pickOtherUsers(
        userRows,
        authorId,
        index + 1,
        index % 4,
      );

      if (commenters.length > 0) {
        const commentRows = await trx('post_comments')
          .insert(
            commenters.map((user, commentIndex) => ({
              post_id: postId,
              user_id: user.id,
              content:
                postComments[(index + commentIndex) % postComments.length],
              created_at: trx.raw(
                `NOW() - (? * INTERVAL '1 hour') + (? * INTERVAL '30 minute')`,
                [hoursAgo, commentIndex + 1],
              ),
            })),
          )
          .returning(['id']);

        if (index % 2 === 0) {
          await trx('post_comments').insert({
            post_id: postId,
            user_id: authorId,
            parent_comment_id: commentRows[0].id,
            content: POST_AUTHOR_REPLY,
            created_at: trx.raw(
              `NOW() - (? * INTERVAL '1 hour') + (? * INTERVAL '30 minute')`,
              [hoursAgo, commenters.length + 1],
            ),
          });
        }
      }

      const likers = pickOtherUsers(userRows, authorId, index, index % 5);
      if (likers.length > 0) {
        await trx('post_likes').insert(
          likers.map((user) => ({
            post_id: postId,
            user_id: user.id,
          })),
        );
      }

      const savers = pickOtherUsers(userRows, authorId, index + 2, index % 3);
      if (savers.length > 0) {
        await trx('post_saves').insert(
          savers.map((user) => ({
            user_id: user.id,
            post_id: postId,
          })),
        );
      }

      const reportReasons = post.reportReasons ?? [];
      const reporters = pickOtherUsers(
        userRows,
        authorId,
        index,
        reportReasons.length,
      );

      for (
        let reportIndex = 0;
        reportIndex < reporters.length;
        reportIndex += 1
      ) {
        const [report] = await trx('reports')
          .insert({
            reporter_id: reporters[reportIndex].id,
            reason: reportReasons[reportIndex],
          })
          .returning(['id']);

        await trx('post_reports').insert({
          id: report.id,
          post_id: postId,
        });
      }
    }

    // =========================================================================
    // 9. SEED MODERATION: REPORTS, WARNINGS & TAKEDOWNS
    // =========================================================================
    // The pending post reports above stay pending; these cover every other state.
    const adminId: string = adminRow.id;
    const userIdByEmail = new Map<string, string>(
      userRows.map((row: { id: string; email: string }) => [row.email, row.id]),
    );
    const userId = (email: string): string => {
      const id = userIdByEmail.get(email);
      if (!id) throw new Error(`Seed user ${email} not found`);
      return id;
    };
    const postIdByTitle = async (title: string): Promise<string> => {
      const row = await trx('posts').first('id').where({ title });
      if (!row) throw new Error(`Seed post "${title}" not found`);
      return row.id;
    };
    const insertPost = async (
      authorId: string,
      post: { title: string; content: string; tags: string[] },
      createdHoursAgo: number,
      status: 'VISIBLE' | 'REMOVED' = 'VISIBLE',
    ): Promise<string> => {
      const [created] = await trx('posts')
        .insert({
          author_id: authorId,
          title: post.title,
          content: post.content,
          status,
          created_at: hoursAgo(trx, createdHoursAgo),
          updated_at: hoursAgo(trx, createdHoursAgo),
        })
        .returning(['id']);
      await trx('post_tags').insert(
        post.tags.map((name) => ({ post_id: created.id, name })),
      );
      return created.id;
    };

    const minhAnhId = userId('minhanh@example.com');
    const baoNgocId = userId('baongoc@example.com');
    const hoangNamId = userId('hoangnam@example.com');
    const thaoVyId = userId('thaovy@example.com');
    const quocHuyId = userId('quochuy@example.com');

    // (a) Spam account: banned 12 days ago, unbanned after 2 days, banned again 2 days ago.
    const [bannedRow] = await trx('users').insert(bannedUser).returning(['id']);
    const bannedId: string = bannedRow.id;

    await seedReport(trx, {
      reporterId: minhAnhId,
      reason: 'Nhắn tin mời mua hàng liên tục',
      hoursAgo: 13 * 24,
      target: { targetUserId: bannedId },
      handled: {
        status: 'RESOLVED',
        handledBy: adminId,
        hoursAgo: 12 * 24,
        note: 'Đăng quảng cáo bán hàng hàng loạt',
      },
    });
    await seedTakedown(trx, {
      target: { userId: bannedId },
      issuedBy: adminId,
      reason: 'Đăng quảng cáo bán hàng hàng loạt',
      hoursAgo: 12 * 24,
      revoked: { by: adminId, hoursAgo: 10 * 24 },
    });

    // Its spam post: removed 3 days ago, which settled both reports about it
    const spamPostId = await insertPost(bannedId, spamPost, 4 * 24, 'REMOVED');
    const spamRemoval = 'Quảng cáo bán hàng, vi phạm quy định diễn đàn';
    for (const [reporterId, reason] of [
      [minhAnhId, 'Spam quảng cáo'],
      [hoangNamId, 'Bán hàng trong diễn đàn làm bánh'],
    ] as const) {
      await seedReport(trx, {
        reporterId,
        reason,
        hoursAgo: 3.5 * 24,
        target: { postId: spamPostId },
        handled: {
          status: 'RESOLVED',
          handledBy: adminId,
          hoursAgo: 3 * 24,
          note: spamRemoval,
        },
      });
    }
    await seedTakedown(trx, {
      target: { postId: spamPostId },
      issuedBy: adminId,
      reason: spamRemoval,
      hoursAgo: 3 * 24,
    });

    const rebanReason = 'Tái phạm: tiếp tục spam quảng cáo và lừa đặt cọc';
    for (const [reporterId, reason] of [
      [baoNgocId, 'Nhắn tin mời mua hàng dù đã từ chối'],
      [thaoVyId, 'Nhận tiền cọc rồi chặn liên lạc'],
    ] as const) {
      await seedReport(trx, {
        reporterId,
        reason,
        hoursAgo: 2.5 * 24,
        target: { targetUserId: bannedId },
        handled: {
          status: 'RESOLVED',
          handledBy: adminId,
          hoursAgo: 2 * 24,
          note: rebanReason,
        },
      });
    }
    await seedTakedown(trx, {
      target: { userId: bannedId },
      issuedBy: adminId,
      reason: rebanReason,
      hoursAgo: 2 * 24,
    });

    // (b) A post removed by mistake, then restored the next day
    const restoredPostId = await insertPost(thaoVyId, restoredPost, 6 * 24);
    const wrongRemoval = 'Nghi dùng ảnh trên mạng, không phải tự làm';
    await seedReport(trx, {
      reporterId: quocHuyId,
      reason: 'Ảnh lấy trên mạng, không phải tự làm',
      hoursAgo: 5.5 * 24,
      target: { postId: restoredPostId },
      handled: {
        status: 'RESOLVED',
        handledBy: adminId,
        hoursAgo: 5 * 24,
        note: wrongRemoval,
      },
    });
    await seedTakedown(trx, {
      target: { postId: restoredPostId },
      issuedBy: adminId,
      reason: wrongRemoval,
      hoursAgo: 5 * 24,
      revoked: { by: adminId, hoursAgo: 4 * 24 },
    });

    // (c) Lê Hoàng Nam: banned once for insulting comments, unbanned two days later (now ACTIVE)
    const insultBan = 'Bình luận xúc phạm thành viên khác';
    await seedReport(trx, {
      reporterId: baoNgocId,
      reason: 'Bình luận chửi bới dưới bài của tôi',
      hoursAgo: 9 * 24,
      target: { targetUserId: hoangNamId },
      handled: {
        status: 'RESOLVED',
        handledBy: adminId,
        hoursAgo: 8 * 24,
        note: insultBan,
      },
    });
    await seedTakedown(trx, {
      target: { userId: hoangNamId },
      issuedBy: adminId,
      reason: insultBan,
      hoursAgo: 8 * 24,
      revoked: { by: adminId, hoursAgo: 6 * 24 },
    });

    // (d) Đặng Quốc Huy: warned from a post page (the report is linked to the warning),
    // and still has two pending reports about the account
    const warnedPostId = await insertPost(quocHuyId, warnedPost, 3 * 24);
    const warnReason =
      'Bài viết công kích cửa hàng khác; tái phạm sẽ bị gỡ bài';
    const warnedReportId = await seedReport(trx, {
      reporterId: minhAnhId,
      reason: 'Nói xấu, kêu gọi tẩy chay cửa hàng khác',
      hoursAgo: 2.5 * 24,
      target: { postId: warnedPostId },
      handled: {
        status: 'RESOLVED',
        handledBy: adminId,
        hoursAgo: 2 * 24,
        note: warnReason,
      },
    });
    const [warning] = await trx('warnings')
      .insert({
        user_id: quocHuyId,
        issued_by: adminId,
        reason: warnReason,
        created_at: hoursAgo(trx, 2 * 24),
      })
      .returning(['id']);
    await trx('warning_reports').insert({
      warning_id: warning.id,
      report_id: warnedReportId,
    });

    await seedReport(trx, {
      reporterId: thaoVyId,
      reason: 'Nhắn tin làm phiền dù đã bị chặn',
      hoursAgo: 24,
      target: { targetUserId: quocHuyId },
    });
    await seedReport(trx, {
      reporterId: hoangNamId,
      reason: 'Bình luận khiếm nhã dưới bài của tôi',
      hoursAgo: 10,
      target: { targetUserId: quocHuyId },
    });

    // (e) Dismissed reports: one about a post, one about an account
    await seedReport(trx, {
      reporterId: quocHuyId,
      reason: 'Câu hỏi trùng lặp',
      hoursAgo: 4 * 24,
      target: {
        postId: await postIdByTitle(
          'Nên dùng bơ nhạt hay bơ mặn khi nướng bánh?',
        ),
      },
      handled: {
        status: 'DISMISSED',
        handledBy: adminId,
        hoursAgo: 3.5 * 24,
        note: 'Không vi phạm quy định',
      },
    });
    await seedReport(trx, {
      reporterId: quocHuyId,
      reason: 'Tài khoản giả mạo',
      hoursAgo: 7 * 24,
      target: { targetUserId: minhAnhId },
      handled: {
        status: 'DISMISSED',
        handledBy: adminId,
        hoursAgo: 6.5 * 24,
        note: 'Đã kiểm tra, tài khoản thật',
      },
    });
  });
}
