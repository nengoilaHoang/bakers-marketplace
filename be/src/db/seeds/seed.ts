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

// Mật khẩu mặc định: "Bakers@123" (bcrypt 12 rounds)
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

// Bakers buy for their own shop and are the only ones who can place pre-orders (recurring orders).
// Inserted apart from `users` so the baker does not author seeded recipes or posts.
const bakerUser = {
  email: 'lananh.baker@example.com',
  displayname: 'Võ Lan Anh',
  hashed_password: SEED_PASSWORD_HASH,
  role: 'BAKER',
};

const bakerAddress = {
  recipientName: 'Võ Lan Anh',
  phone: '0934567890',
  streetAddress: '27 Phan Đình Phùng',
  ward: 'Phường Đức Nhuận',
  province: 'Thành phố Hồ Chí Minh',
};

const baseRecipes: RecipeSeed[] = [
  {
    title: 'Bánh Chocolate Fudge',
    description:
      'Bánh chocolate fudge đậm vị cacao truyền thống. Chocolate sánh mịn, ngọt béo vừa phải. Công thức phù hợp làm quà sinh nhật hoặc tráng miệng.',
    portion: 8,
    tags: ['chocolate', 'cake', 'dessert', 'birthday'],
    ingredients: [
      ['Bột mì', 180, 'g'],
      ['Bột cacao', 55, 'g'],
      ['Đường tinh luyện', 160, 'g'],
      ['Trứng gà', 3, 'quả'],
      ['Sữa tươi không đường', 180, 'ml'],
      ['Bơ lạt', 100, 'g'],
      ['Chocolate đen 65%', 120, 'g'],
    ],
    tools: [
      ['Lò nướng', 1],
      ['Máy đánh trứng', 1],
      ['Khuôn tròn 20cm', 1],
    ],
    steps: [
      'Làm nóng lò 175°C trong ít nhất 15 phút. Lót giấy nến khuôn tròn 20cm.',
      'Rây bột mì, bột cacao, trộn đều với đường tinh luyện.',
      'Đun cách thủy chocolate đen cho tan chảy hoàn toàn.',
      'Đánh tan trứng với bơ, rót chocolate vào trộn đều.',
      'Cho bột vào fold nhẹ tay đến khi vừa quyện.',
      'Đổ vào khuôn, nướng 32-38 phút đến khi tăm rút ra còn ẩm.',
      'Để nguội trong khuôn 15 phút trước khi lấy ra rack.',
    ],
    notes: [
      'Không nướng quá lửa để bánh giữ được độ ẩm mềm.',
      'Ngon hơn sau khi bảo quản lạnh 2 giờ trong ngăn mát.',
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
    profile: 'Hương trà xanh thơm ngát, hậu vị thanh.',
    tip: 'Rây kỹ matcha để không vón cục.',
  },
  {
    name: 'Caramel',
    tag: 'caramel',
    ingredient: 'Sốt caramel',
    amount: 90,
    unit: 'g',
    profile: 'Ngọt béo đậm đà, thơm lừng.',
    tip: 'Để sốt nguội hoàn toàn trước khi fold vào kem tươi.',
  },
];

const families: Family[] = [
  {
    name: 'Mousse',
    description: 'Mousse mát lạnh, mềm mịn tan ngay trong miệng.',
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
    description: 'Chiffon cake bông xốp nhẹ như mây.',
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
    `Thực hiện các thao tác theo từng bước tiêu chuẩn bánh ${familyName}.`,
    'Bảo quản ở nhiệt độ thích hợp trước khi thưởng thức.',
  ];
}

function buildFamilyNotes(_familyName: string, flavor: Flavor): string[] {
  return [flavor.tip, 'Bảo quản trong tủ mát 2-3 ngày.'];
}

// ==========================================================
// VENDORS & BRANDS CONFIG
// ==========================================================
const vendorUsers = [
  {
    email: 'vendor.hoasen@example.com',
    displayname: 'Tiệm Bánh Hoa Sen',
    hashed_password: SEED_PASSWORD_HASH,
    role: 'VENDOR' as const,
    businessType: 'COMPANY' as const,
    taxCode: '0312345678',
    contact: {
      representativeName: 'Nguyễn Văn Sen',
      representativeRole: 'Chủ tiệm',
      businessAddress: '123 Đường Hoa Sen, Quận 1, TP. Hồ Chí Minh',
      businessPhone: '0901234567',
      businessEmail: 'contact@hoasen-bakery.vn',
    },
  },
  {
    email: 'vendor.mattroi@example.com',
    displayname: 'Bánh Ngọt Mặt Trời',
    hashed_password: SEED_PASSWORD_HASH,
    role: 'VENDOR' as const,
    businessType: 'COMPANY' as const,
    taxCode: '0398765432',
    contact: {
      representativeName: 'Trần Thị Mặt Trời',
      representativeRole: 'Chủ tiệm',
      businessAddress: '456 Đường Mặt Trời, Quận 3, TP. Hồ Chí Minh',
      businessPhone: '0909876543',
      businessEmail: 'contact@sunrise-patisserie.vn',
    },
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
    is_active: true,
  },
  {
    name: 'Hàng Mới Về',
    slug: 'hang-moi-ve',
    description: 'Những sản phẩm mới ra lò trong tuần.',
    is_active: true,
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
    description: 'Croissant ngàn lớp, thơm mùi bơ AOP.',
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
  {
    title: 'Bánh Bông Lan Trứng Muối',
    slug: 'banh-bong-lan-trung-muoi',
    description: 'Bông lan mềm xốp, phủ sốt phô mai và trứng muối, chà bông.',
    unitPrice: 65000,
    unitCost: 38000,
    unit: 'hộp',
    stock: 40,
    brandIndex: 0,
    tags: ['bong-lan', 'trung-muoi'],
    notes: ['Bảo quản ngăn mát, dùng trong 3 ngày.'],
    collectionSlugs: ['hang-moi-ve'],
    alerts: [],
  },
  {
    // Out of stock on purpose: the product page and checkout must refuse it
    title: 'Bánh Mì Hoa Cúc',
    slug: 'banh-mi-hoa-cuc',
    description: 'Brioche hoa cúc kiểu Pháp, thơm bơ và mật ong.',
    unitPrice: 120000,
    unitCost: 70000,
    unit: 'ổ',
    stock: 0,
    brandIndex: 0,
    tags: ['brioche', 'an-sang'],
    notes: [],
    collectionSlugs: [],
    alerts: [],
  },
  {
    title: 'Tart Trứng Bồ Đào Nha',
    slug: 'tart-trung-bo-dao-nha',
    description: 'Vỏ ngàn lớp giòn rụm, nhân trứng sữa xém mặt.',
    unitPrice: 25000,
    unitCost: 12000,
    unit: 'cái',
    stock: 80,
    brandIndex: 1,
    tags: ['tart', 'an-vat'],
    notes: ['Hâm nóng 3 phút ở 180°C trước khi dùng.'],
    collectionSlugs: ['hang-moi-ve'],
    alerts: [],
  },
  {
    title: 'Bánh Su Kem',
    slug: 'banh-su-kem',
    description: 'Vỏ su mỏng, nhân kem vani mát lạnh.',
    unitPrice: 8000,
    unitCost: 3500,
    unit: 'cái',
    stock: 150,
    brandIndex: 1,
    tags: ['su-kem', 'an-vat'],
    notes: [],
    collectionSlugs: [],
    alerts: [],
  },
];

// ==========================================================
// ORDERS CONFIG
// ==========================================================
type SeedOrderStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED' | 'COMPLETED';
type SeedShipmentStatus =
  | 'LABEL_CREATED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED';

// What a vendor decided about its items in an order (EXPIRED: no answer before the deadline)
type SeedDecision = 'PENDING' | 'APPROVED' | 'EXPIRED' | { declined: string };

// Seeded orders use a real-life approval window; the app's own window is ORDER_APPROVAL_WINDOW_MINUTES
const SEED_APPROVAL_HOURS = 24;

type SeedOrder = {
  customerEmail: string;
  status: SeedOrderStatus;
  // Per brand name; brands not listed follow the order status (PENDING/CANCELLED: undecided,
  // APPROVED/COMPLETED: approved, DECLINED: declined with closingNote, EXPIRED: no answer)
  vendorDecisions?: Record<string, SeedDecision>;
  placedHoursAgo: number;
  items: Array<{
    slug: string;
    quantity: number;
    note?: string;
    rating?: { stars: number; comment: string };
  }>;
  // Why the order was cancelled (by the customer) or declined
  closingNote?: string;
  shipment?: { carrier: string; trackingNumber: string; status: SeedShipmentStatus };
};

const customerAddresses: Record<
  string,
  { recipientName: string; phone: string; streetAddress: string; ward: string; province: string }
> = {
  'minhanh@example.com': {
    recipientName: 'Nguyễn Minh Anh',
    phone: '0901234567',
    streetAddress: '12 Lê Lợi',
    ward: 'Phường Sài Gòn',
    province: 'Thành phố Hồ Chí Minh',
  },
  'baongoc@example.com': {
    recipientName: 'Trần Bảo Ngọc',
    phone: '0912345678',
    streetAddress: '45 Hàng Bài',
    ward: 'Phường Hoàn Kiếm',
    province: 'Thành phố Hà Nội',
  },
  'hoangnam@example.com': {
    recipientName: 'Lê Hoàng Nam',
    phone: '0987654321',
    streetAddress: '88 Nguyễn Văn Linh',
    ward: 'Phường Hải Châu',
    province: 'Thành phố Đà Nẵng',
  },
};

// Every order status appears at least once; some orders mix both vendors, with each
// vendor deciding its own items (one waits on a vendor, one had a vendor decline its part).
const orders: SeedOrder[] = [
  {
    // Sunrise approved its part, Hoa Sen has not answered yet
    customerEmail: 'minhanh@example.com',
    status: 'PENDING',
    placedHoursAgo: 3,
    vendorDecisions: { 'Sunrise Patisserie': 'APPROVED' },
    items: [
      { slug: 'croissant-bo-phap', quantity: 4 },
      { slug: 'banh-bong-lan-trung-muoi', quantity: 1, note: 'Ít sốt giúp mình' },
    ],
  },
  {
    // Neither vendor has answered yet
    customerEmail: 'baongoc@example.com',
    status: 'PENDING',
    placedHoursAgo: 5,
    items: [
      { slug: 'banh-trung-thu-thap-cam', quantity: 2 },
      { slug: 'banh-su-kem', quantity: 6 },
    ],
  },
  {
    customerEmail: 'minhanh@example.com',
    status: 'APPROVED',
    placedHoursAgo: 48,
    items: [{ slug: 'banh-trung-thu-thap-cam', quantity: 6 }],
    shipment: { carrier: 'Giao Hàng Nhanh', trackingNumber: 'GHN5X8K2LQ', status: 'IN_TRANSIT' },
  },
  {
    customerEmail: 'minhanh@example.com',
    status: 'COMPLETED',
    placedHoursAgo: 240,
    items: [
      {
        slug: 'croissant-bo-phap',
        quantity: 2,
        rating: { stars: 5, comment: 'Croissant giòn, thơm bơ, sẽ mua lại.' },
      },
      { slug: 'tart-trung-bo-dao-nha', quantity: 6 },
    ],
    shipment: { carrier: 'Giao Hàng Tiết Kiệm', trackingNumber: 'GHTK8812734', status: 'DELIVERED' },
  },
  {
    customerEmail: 'minhanh@example.com',
    status: 'CANCELLED',
    placedHoursAgo: 120,
    items: [{ slug: 'banh-su-kem', quantity: 3 }],
    closingNote: 'Đặt nhầm số lượng',
  },
  {
    customerEmail: 'baongoc@example.com',
    status: 'COMPLETED',
    placedHoursAgo: 360,
    items: [
      {
        slug: 'banh-trung-thu-thap-cam',
        quantity: 4,
        rating: { stars: 4, comment: 'Nhân đậm vị, hơi ngọt một chút.' },
      },
      {
        slug: 'banh-su-kem',
        quantity: 10,
        rating: { stars: 5, comment: 'Kem mát, vỏ mỏng, cả nhà đều thích.' },
      },
    ],
    shipment: { carrier: 'Viettel Post', trackingNumber: 'VTP1029384756', status: 'DELIVERED' },
  },
  {
    customerEmail: 'baongoc@example.com',
    status: 'DECLINED',
    placedHoursAgo: 72,
    items: [{ slug: 'banh-trung-thu-thap-cam', quantity: 10 }],
    closingNote: 'Tiệm tạm hết nhân thập cẩm, xin lỗi bạn',
  },
  {
    // Hoa Sen declined its item, so only Sunrise's tarts are on the way
    customerEmail: 'hoangnam@example.com',
    status: 'APPROVED',
    placedHoursAgo: 30,
    vendorDecisions: { 'Hoa Sen Bakery': { declined: 'Tiệm hết trứng muối hôm nay, xin lỗi bạn' } },
    items: [
      { slug: 'tart-trung-bo-dao-nha', quantity: 12 },
      { slug: 'banh-bong-lan-trung-muoi', quantity: 2 },
    ],
    shipment: { carrier: 'Giao Hàng Nhanh', trackingNumber: 'GHN9Q4M7TZ', status: 'OUT_FOR_DELIVERY' },
  },
  {
    // Sunrise never answered: the order expired at the deadline
    customerEmail: 'baongoc@example.com',
    status: 'EXPIRED',
    placedHoursAgo: 40,
    items: [{ slug: 'croissant-bo-phap', quantity: 3 }],
  },
  {
    // Sunrise approved, Hoa Sen let the deadline pass: only the choux are shipped
    customerEmail: 'hoangnam@example.com',
    status: 'APPROVED',
    placedHoursAgo: 50,
    vendorDecisions: { 'Hoa Sen Bakery': 'EXPIRED' },
    items: [
      { slug: 'banh-su-kem', quantity: 10 },
      { slug: 'banh-trung-thu-thap-cam', quantity: 2 },
    ],
    shipment: { carrier: 'Giao Hàng Nhanh', trackingNumber: 'GHN3H6P1WD', status: 'LABEL_CREATED' },
  },
];

// Tracking events of a shipment, in order; a shipment at status X has every event up to X
const trackingTemplate: Array<{
  status: SeedShipmentStatus;
  locationName: string;
  description: string;
}> = [
  { status: 'LABEL_CREATED', locationName: 'Tiệm bánh', description: 'Đã tạo vận đơn' },
  { status: 'PICKED_UP', locationName: 'Tiệm bánh', description: 'Đơn vị vận chuyển đã lấy hàng' },
  { status: 'IN_TRANSIT', locationName: 'Kho trung chuyển', description: 'Đang trung chuyển' },
  { status: 'OUT_FOR_DELIVERY', locationName: 'Bưu cục gần bạn', description: 'Shipper đang giao hàng' },
  { status: 'DELIVERED', locationName: 'Địa chỉ nhận hàng', description: 'Giao hàng thành công' },
];

// ==========================================================
// PRE-ORDERS CONFIG
// ==========================================================
// Cycle days are calendar days in Vietnam; a cycle's order is created at 00:00 of its day
const PRE_ORDER_TZ = 'Asia/Ho_Chi_Minh';

type SeedPreOrder = {
  status: 'PENDING' | 'ACTIVE';
  frequency: 'MONTHLY' | 'BIWEEKLY';
  durationMonths: number;
  // First cycle day, counted from today (negative: already started)
  startInDays: number;
  requestedHoursAgo: number;
  // Per brand name: APPROVED, or still PENDING
  decisions: Record<string, 'APPROVED' | 'PENDING'>;
  items: Array<{ slug: string; quantity: number; note?: string }>;
  // Cycle numbers the baker skipped
  skipped?: number[];
};

const preOrders: SeedPreOrder[] = [
  {
    // Sunrise approved, Hoa Sen has not answered yet: test the vendor approval
    status: 'PENDING',
    frequency: 'MONTHLY',
    durationMonths: 3,
    startInDays: 3,
    requestedHoursAgo: 2,
    decisions: { 'Sunrise Patisserie': 'APPROVED', 'Hoa Sen Bakery': 'PENDING' },
    items: [
      { slug: 'croissant-bo-phap', quantity: 20, note: 'Giao trước 7 giờ sáng' },
      { slug: 'banh-bong-lan-trung-muoi', quantity: 5 },
    ],
  },
  {
    // Running: cycle 1 delivered, cycle 3 skipped, cycles 2 and 4 to come
    status: 'ACTIVE',
    frequency: 'BIWEEKLY',
    durationMonths: 2,
    startInDays: -10,
    requestedHoursAgo: 12 * 24,
    decisions: { 'Sunrise Patisserie': 'APPROVED', 'Hoa Sen Bakery': 'APPROVED' },
    items: [
      { slug: 'banh-su-kem', quantity: 30 },
      { slug: 'banh-trung-thu-thap-cam', quantity: 6 },
    ],
    skipped: [3],
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
      'Trời nắng nóng nên làm liền một mẻ mousse dâu tây. Lớp mousse mềm mịn, chua ngọt vừa phải, cắt ra thơm lừng góc bếp. Mọi người thử nha.',
    tags: ['mousse', 'strawberry'],
    recipeTitle: 'Mousse Dâu',
  },
  {
    title: 'Chiffon dâu xẹp, mọi người giúp mình với',
    content:
      'Mình làm theo đúng công thức nhưng lấy ra khỏi lò được 5 phút thì bánh xẹp. Có phải do mình đánh lòng trắng chưa bông cứng không?',
    tags: ['chiffon', 'hoi-dap'],
    recipeTitle: 'Chiffon Cake Dâu',
  },
  {
    title: 'Mẹo pha matcha không bị vón cục',
    content:
      'Nên rây matcha vào bát trước, thêm nước 70-80°C rồi khuấy nhanh tay bằng chổi chasen. Đừng dùng nước sôi kẻo biến chất đắng ngắt.',
    tags: ['matcha', 'tips'],
  },
  {
    title: 'Mousse matcha thanh mát vừa miệng',
    content:
      'Hôm nay thử làm mousse matcha Uji. Vị đắng nhẹ quyện kem béo ngậy, màu xanh mát mắt.',
    tags: ['matcha', 'mousse'],
    recipeTitle: 'Mousse Matcha',
  },
  {
    title: 'Khoe mẻ croissant đầu tiên ra lò',
    content:
      'Cán bơ bằng tay tuy cực nhưng thành quả giòn rụm xốp mềm. Thơm nức cả gian bếp.',
    tags: ['croissant', 'khoe-banh'],
  },
  {
    title: 'Chiffon matcha cao 12cm nở đẹp',
    content:
      'Cuối cùng cũng làm được chiffon nở chuẩn chỉ không bị lõm đáy hay xẹp.',
    tags: ['chiffon', 'matcha'],
    recipeTitle: 'Chiffon Cake Matcha',
  },
  {
    title: 'Nên dùng bơ thực vật hay bơ động vật?',
    content:
      'Nhiều bạn hỏi thay bơ lạt bằng bơ phe được không. Lời khuyên là luôn ưu tiên bơ động vật để bánh thơm ngậy chuẩn vị.',
    tags: ['hoi-dap', 'nguyen-lieu'],
  },
  {
    title: 'Mousse caramel cho tiệc sinh nhật',
    content:
      'Lớp caramel béo ngậy phủ trên mousse bồng bềnh, ai ăn cũng khen nức nở.',
    tags: ['caramel', 'mousse', 'birthday'],
    recipeTitle: 'Mousse Caramel',
  },
  {
    title: 'Nhiệt kế lò nướng sai số lớn',
    content:
      'Mới mua nhiệt kế cơ về test thử thấy chênh tận 15°C so với núm xoay lò.',
    tags: ['tips', 'lo-nuong'],
  },
  {
    title: 'Chiffon caramel thơm ngọt gian bếp',
    content: 'Một chút caramel tự nấu giúp chiffon thơm ngon vượt bậc.',
    tags: ['chiffon', 'caramel'],
    recipeTitle: 'Chiffon Cake Caramel',
  },
  {
    title: 'Bánh mì hoa cúc lần 3 thành công',
    content: 'Thành phẩm thớ xé dai mềm, thơm phức tinh dầu hoa cam.',
    tags: ['banh-mi', 'khoe-banh'],
  },
  {
    title: 'Xin gợi ý khuôn bánh chống dính tốt',
    content:
      'Khuôn nhôm gia công hay khuôn chống dính carbon xài bền hơn mọi người?',
    tags: ['dung-cu', 'hoi-dap'],
  },
  {
    title: 'Bánh trung thu nhân thập cẩm xá xíu',
    content:
      'Tự làm nhân thập cẩm tuy lách cách nhưng vừa miệng và sạch sẽ hơn mua sẵn.',
    tags: ['trung-thu', 'banh-nuong'],
  },
  {
    title: 'Cách bảo quản kem tươi tránh bị tách nước',
    content:
      'Hộp kem sau khi mở nắp, nên quấn màng bọc kín và dùng trong 24-48 giờ.',
    tags: ['tips', 'whipping-cream'],
  },
  {
    title: 'Tiramisu không dùng trứng sống',
    content: 'Công thức tiệt trùng lòng đỏ cách thủy giúp an tâm thưởng thức.',
    tags: ['tiramisu', 'dessert'],
  },
  {
    title: 'Làm bánh quy bơ cùng con nhỏ',
    content: 'Bánh quy bơ đơn giản, cả hai mẹ con vừa nặn vừa nướng rất vui.',
    tags: ['cookie', 'gia-dinh'],
  },
  {
    title: 'Bột mì số 8 và số 11 khác nhau thế nào?',
    content:
      'Bột số 8 hàm lượng protein thấp cho bánh mềm ẩm, số 11 tạo thớ dai giòn.',
    tags: ['hoi-dap', 'nguyen-lieu'],
  },
  {
    title: 'Tart trứng Bồ Đào Nha vỏ ngàn lớp',
    content: 'Vỏ giòn tan nhiều tầng, nhân trứng sữa béo ngậy ngọt ngào.',
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
  'Bánh nở đẹp quá bạn ơi.',
  'Cảm ơn bạn đã chia sẻ bí quyết bổ ích.',
  'Công thức chuẩn chỉnh, làm lần đầu ăn ngon luôn.',
];

const POST_AUTHOR_REPLY =
  'Cảm ơn bạn nha, làm xong nhớ chia sẻ kết quả lên nhóm nhé!';

// ==========================================================
// MODERATION CONFIG (reports, warnings, takedowns)
// ==========================================================
const bannedUser = {
  email: 'giasi.shop@example.com',
  displayname: 'Shop Bánh Giá Sỉ',
  hashed_password: SEED_PASSWORD_HASH,
  role: 'CUSTOMER',
  status: 'BANNED',
};

const spamPost = {
  title: 'Nhận order bánh sinh nhật giá sốc, inbox Zalo',
  content:
    'Nhận làm bánh sinh nhật, bánh kem giá từ 50k. Cọc trước 50%, inbox Zalo 09xx để nhận liền tay!',
  tags: ['quang-cao'],
};

const restoredPost = {
  title: 'Bánh bông lan trứng muối sốt phô mai',
  content:
    'Mẻ bông lan trứng muối đầu tiên tự làm, sốt phô mai tự nấu béo ngậy. Lần sau mình sẽ chia sẻ công thức.',
  tags: ['bong-lan', 'trung-muoi'],
};

const warnedPost = {
  title: 'Đừng mua bánh ở tiệm X, dở tệ',
  content:
    'Bánh vừa khô vừa ngọt gắt, thái độ phục vụ kém. Ai mua là phí tiền, mọi người tẩy chay giúp mình.',
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
    await trx('post_reports').insert({ id: created.id, post_id: report.target.postId });
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
    await trx('post_removals').insert({ id: created.id, post_id: takedown.target.postId });
  } else {
    await trx('user_bans').insert({ id: created.id, user_id: takedown.target.userId });
  }
}

export async function seed(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    // =========================================================================
    // 1. CLEANUP ALL EXISTING RECORDS (DEPENDENCY ORDER)
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

    // Pre-orders Module (cycles point at generated orders)
    await trx('pre_order_status_histories').del();
    await trx('pre_order_cycles').del();
    await trx('pre_order_items').del();
    await trx('pre_order_requests').del();

    // Orders Module
    await trx('rating_images').del();
    await trx('order_ratings').del();
    await trx('ratings').del();
    await trx('tracking_events').del();
    await trx('shipments').del();
    await trx('order_status_histories').del();
    await trx('order_items').del();
    await trx('orders').del();

    // Products Module
    await trx('product_collections').del();
    await trx('stock_alerts').del();
    await trx('product_stocks').del();
    await trx('product_tags').del();
    await trx('product_notes').del();
    await trx('product_images').del();
    await trx('products').del();
    await trx('collections').del();

    // Vendors & Brands Cleanup (Brands reference Vendors, so delete Brands first)
    await trx('brands').del();
    await trx('vendor_contact_infos').del();
    await trx('company_vendors').del();
    await trx('individual_vendors').del();
    await trx('vendors').del();

    // Admin Moderation Module
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

    // File System & Media
    await trx('images').del();
    await trx('documents').del();
    await trx('files').del();

    // Authentication & Core Users
    await trx('sessions').del();
    await trx('auth_accounts').del();
    await trx('users').del();

    // =========================================================================
    // 2. SEED USERS & RECIPE MODULE
    // =========================================================================
    const userRows = await trx('users')
      .insert(users)
      .returning(['id', 'email', 'displayname', 'role']);

    const [adminRow] = await trx('users').insert(adminUser).returning(['id']);
    const [bakerRow] = await trx('users').insert(bakerUser).returning(['id']);

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

    // Step A: Insert into files first
    const recipeFiles = await trx('files')
      .insert(
        generatedRecipes.map((recipe, index) => ({
          display_name: `${recipe.title} cover`,
          original_name: `recipe-${index + 1}.jpg`,
          url: `https://picsum.photos/seed/bakers-recipe-${index + 1}/800/600`,
          content_type: 'image/jpeg',
          ext_name: 'jpg',
        })),
      )
      .returning(['id']);

    // Step B: Insert into images referencing the file IDs
    const imageRows = await trx('images')
      .insert(
        recipeFiles.map((file) => ({
          id: file.id,
          width: 800,
          height: 600,
        })),
      )
      .returning(['id']);

    for (let index = 0; index < generatedRecipes.length; index += 1) {
      const recipe = generatedRecipes[index];
      const user = userRows[index % userRows.length];
      const image = imageRows[index];
      const isPublic = index === 0 ? true : index % 7 !== 0;
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
    // Brand logos and favicons in files & images
    const brandFiles = await trx('files')
      .insert([
        {
          display_name: 'Hoa Sen Bakery Logo',
          original_name: 'hoasen-logo.png',
          url: 'https://picsum.photos/seed/hoasen-logo/200/200',
          content_type: 'image/png',
          ext_name: 'png',
        },
        {
          display_name: 'Hoa Sen Bakery Favicon',
          original_name: 'hoasen-favicon.png',
          url: 'https://picsum.photos/seed/hoasen-favicon/64/64',
          content_type: 'image/png',
          ext_name: 'png',
        },
        {
          display_name: 'Sunrise Patisserie Logo',
          original_name: 'sunrise-logo.png',
          url: 'https://picsum.photos/seed/sunrise-logo/200/200',
          content_type: 'image/png',
          ext_name: 'png',
        },
        {
          display_name: 'Sunrise Patisserie Favicon',
          original_name: 'sunrise-favicon.png',
          url: 'https://picsum.photos/seed/sunrise-favicon/64/64',
          content_type: 'image/png',
          ext_name: 'png',
        },
      ])
      .returning(['id']);

    const brandImages = await trx('images')
      .insert(
        brandFiles.map((file) => ({
          id: file.id,
          width: 200,
          height: 200,
        })),
      )
      .returning(['id']);

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

    // Step 1: Insert vendors (vendors reference only users)
    await trx('vendors').insert(
      vendorRows.map((row, index) => ({
        id: row.id,
        business_type: vendorUsers[index].businessType,
        tax_code: vendorUsers[index].taxCode,
        registered_at: trx.fn.now(),
      })),
    );

    // Step 2: Insert brands (brands reference vendors via vendor_id)
    const brandRows = await trx('brands')
      .insert(
        brands.map((brand, index) => ({
          name: brand.name,
          domain: brand.domain,
          logo: brandImages[index * 2].id,
          favicon: brandImages[index * 2 + 1].id,
          vendor_id: vendorRows[index].id,
        })),
      )
      .returning(['id']);

    // Step 3: Insert vendor contact infos
    await trx('vendor_contact_infos').insert(
      vendorRows.map((row, index) => ({
        id: row.id,
        representative_name: vendorUsers[index].contact.representativeName,
        representative_role: vendorUsers[index].contact.representativeRole,
        business_address: vendorUsers[index].contact.businessAddress,
        business_phone: vendorUsers[index].contact.businessPhone,
        business_email: vendorUsers[index].contact.businessEmail,
      })),
    );

    const collectionRows = await trx('collections')
      .insert(collections)
      .returning(['id', 'slug']);

    const collectionIdBySlug = new Map<string, string>(
      collectionRows.map((row: { id: string; slug: string }) => [
        row.slug,
        row.id,
      ]),
    );

    // Product media files & images
    const productFiles = await trx('files')
      .insert(
        products.map((p, idx) => ({
          display_name: `${p.title} media`,
          original_name: `product-${idx + 1}.jpg`,
          url: `https://picsum.photos/seed/bakers-product-${idx + 1}/600/600`,
          content_type: 'image/jpeg',
          ext_name: 'jpg',
        })),
      )
      .returning(['id']);

    const productImages = await trx('images')
      .insert(
        productFiles.map((file) => ({
          id: file.id,
          width: 600,
          height: 600,
        })),
      )
      .returning(['id']);

    const productBySlug = new Map<
      string,
      { id: string; vendorId: string; seed: SeedProduct }
    >();

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
      productBySlug.set(product.slug, {
        id: productId,
        vendorId: vendorRows[product.brandIndex].id,
        seed: product,
      });

      await trx('product_stocks').insert({
        id: productId,
        stock: product.stock,
      });

      await trx('product_images').insert({
        product_id: productId,
        image_id: productImages[index].id,
        sort_order: 1,
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

    // Bento Cell 1: Featured Card
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

    // Bento Cell 2: Promotion Card
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

    // Bento Cell 3: Secondary Feature 1
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

    // Bento Cell 4: Secondary Feature 2
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
        (row: { id: string; title: string; user_id: string }) => [
          row.title,
          { id: row.id, userId: row.user_id },
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

      const postHoursAgo = (index + 1) * 6;
      const [createdPost] = await trx('posts')
        .insert({
          author_id: authorId,
          title: post.title,
          content: snapshotId
            ? appendRecipeToken(post.content, snapshotId)
            : post.content,
          created_at: trx.raw(`NOW() - (? * INTERVAL '1 hour')`, [postHoursAgo]),
          updated_at: trx.raw(`NOW() - (? * INTERVAL '1 hour')`, [postHoursAgo]),
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
                [postHoursAgo, commentIndex + 1],
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
              [postHoursAgo, commenters.length + 1],
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
    const adminId: string = adminRow.id;
    const userIdByEmail = new Map<string, string>(
      userRows.map((row: { id: string; email: string }) => [row.email, row.id]),
    );

    const getUserId = (email: string): string => {
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

    const minhAnhId = getUserId('minhanh@example.com');
    const baoNgocId = getUserId('baongoc@example.com');
    const hoangNamId = getUserId('hoangnam@example.com');
    const thaoVyId = getUserId('thaovy@example.com');
    const quocHuyId = getUserId('quochuy@example.com');

    // (a) Banned user
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
        note: 'Đăng quảng cáo hàng loạt',
      },
    });

    await seedTakedown(trx, {
      target: { userId: bannedId },
      issuedBy: adminId,
      reason: 'Đăng quảng cáo hàng loạt',
      hoursAgo: 12 * 24,
      revoked: { by: adminId, hoursAgo: 10 * 24 },
    });

    // Spam post
    const spamPostId = await insertPost(bannedId, spamPost, 4 * 24, 'REMOVED');
    const spamRemoval = 'Quảng cáo sai quy định diễn đàn';

    for (const [reporterId, reason] of [
      [minhAnhId, 'Spam quảng cáo'],
      [hoangNamId, 'Bán hàng trong diễn đàn'],
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

    const rebanReason = 'Tái phạm: tiếp tục spam quảng cáo';
    for (const [reporterId, reason] of [
      [baoNgocId, 'Nhắn tin mời mua hàng dồn dập'],
      [thaoVyId, 'Nhắn tin spam link bán hàng'],
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

    // (b) Post removed by mistake and restored
    const restoredPostId = await insertPost(thaoVyId, restoredPost, 6 * 24);
    const wrongRemoval = 'Nghi ngờ lấy ảnh trên mạng';

    await seedReport(trx, {
      reporterId: quocHuyId,
      reason: 'Ảnh lấy trên mạng',
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

    // (c) User unbanned (currently ACTIVE)
    const insultBan = 'Bình luận xúc phạm thành viên khác';
    await seedReport(trx, {
      reporterId: baoNgocId,
      reason: 'Bình luận thô tục',
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

    // (d) Warned user
    const warnedPostId = await insertPost(quocHuyId, warnedPost, 3 * 24);
    const warnReason =
      'Bài viết công kích cá nhân; tái phạm sẽ bị khóa tài khoản';

    const warnedReportId = await seedReport(trx, {
      reporterId: minhAnhId,
      reason: 'Nói xấu, kêu gọi tẩy chay không có bằng chứng',
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
      reason: 'Nhắn tin làm phiền',
      hoursAgo: 24,
      target: { targetUserId: quocHuyId },
    });

    await seedReport(trx, {
      reporterId: hoangNamId,
      reason: 'Bình luận khiếm nhã',
      hoursAgo: 10,
      target: { targetUserId: quocHuyId },
    });

    // (e) Dismissed reports
    await seedReport(trx, {
      reporterId: quocHuyId,
      reason: 'Cãi nhau trong bình luận',
      hoursAgo: 4 * 24,
      target: {
        postId: await postIdByTitle('Nên dùng bơ thực vật hay bơ động vật?'),
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

    // =========================================================================
    // 10. SEED ORDERS, SHIPMENTS & ORDER RATINGS
    // =========================================================================
    // Stock above is the stock left after these orders, so it is not decremented here.
    for (const order of orders) {
      const customerId = getUserId(order.customerEmail);
      const address = customerAddresses[order.customerEmail];
      const lines = order.items.map((item) => {
        const product = productBySlug.get(item.slug);
        if (!product) throw new Error(`Seed product ${item.slug} not found`);
        return { ...item, product };
      });
      const placed = order.placedHoursAgo;

      // Group the lines by vendor (brand), in the order they appear
      const defaultDecision: SeedDecision =
        order.status === 'APPROVED' || order.status === 'COMPLETED'
          ? 'APPROVED'
          : order.status === 'DECLINED'
            ? { declined: order.closingNote ?? 'Tiệm không nhận đơn' }
            : order.status === 'EXPIRED'
              ? 'EXPIRED'
              : 'PENDING';
      const groups = new Map<string, { vendorId: string; decision: SeedDecision; count: number }>();
      for (const line of lines) {
        const brand = brands[line.product.seed.brandIndex].name;
        const group = groups.get(brand) ?? {
          vendorId: line.product.vendorId,
          decision: order.vendorDecisions?.[brand] ?? defaultDecision,
          count: 0,
        };
        group.count += 1;
        groups.set(brand, group);
      }
      const decisionOf = (line: (typeof lines)[number]) =>
        groups.get(brands[line.product.seed.brandIndex].name)!.decision;
      const itemStatus = (decision: SeedDecision) =>
        typeof decision === 'string' ? decision : 'DECLINED';

      // Declined and expired items stay in the order but no longer count in its total
      const subtotal = lines
        .filter((line) => ['PENDING', 'APPROVED'].includes(itemStatus(decisionOf(line))))
        .reduce((sum, line) => sum + line.product.seed.unitPrice * line.quantity, 0);

      const [createdOrder] = await trx('orders')
        .insert({
          ordered_by: customerId,
          shipping_recipient_name: address.recipientName,
          shipping_phone: address.phone,
          shipping_street_address: address.streetAddress,
          shipping_ward: address.ward,
          shipping_province: address.province,
          subtotal,
          total_amount: subtotal,
          currency: 'VND',
          current_status: order.status,
          approval_deadline: hoursAgo(trx, placed - SEED_APPROVAL_HOURS),
          placed_at: hoursAgo(trx, placed),
          updated_at: hoursAgo(trx, placed),
        })
        .returning(['id']);
      const orderId: string = createdOrder.id;

      const itemRows = await trx('order_items')
        .insert(
          lines.map((line) => ({
            order_id: orderId,
            product_id: line.product.id,
            product_title: line.product.seed.title,
            unit_price: line.product.seed.unitPrice,
            unit_cost: line.product.seed.unitCost,
            unit: line.product.seed.unit,
            quantity: line.quantity,
            note: line.note ?? null,
            status: itemStatus(decisionOf(line)),
            decline_reason: (() => {
              const decision = decisionOf(line);
              return typeof decision === 'string' ? null : decision.declined;
            })(),
          })),
        )
        .returning(['id']);

      // Status history: PENDING, then each vendor's answer; the answer that settles the
      // last undecided items also moves the order to APPROVED (or DECLINED if nothing is left).
      // Vendors that never answered expire at the deadline, which then settles the order.
      const history: Array<{ status: string; actorId: string | null; note?: string; hoursAgo: number }> = [
        { status: 'PENDING', actorId: customerId, hoursAgo: placed },
      ];
      const answered = [...groups.entries()].filter(
        ([, group]) => group.decision !== 'PENDING' && group.decision !== 'EXPIRED',
      );
      const expiredGroups = [...groups.entries()].filter(([, group]) => group.decision === 'EXPIRED');
      const allDecided = [...groups.values()].every((group) => group.decision !== 'PENDING');
      const anyApproved = [...groups.values()].some((group) => group.decision === 'APPROVED');
      const settledStatus = anyApproved ? 'APPROVED' : expiredGroups.length > 0 ? 'EXPIRED' : 'DECLINED';
      const expected = !allDecided
        ? ['PENDING', 'CANCELLED']
        : settledStatus === 'APPROVED'
          ? ['APPROVED', 'COMPLETED']
          : [settledStatus];
      if (!expected.includes(order.status)) {
        throw new Error(`Seed order status ${order.status} does not match its vendor decisions`);
      }
      answered.forEach(([brand, group], index) => {
        const isLast = allDecided && expiredGroups.length === 0 && index === answered.length - 1;
        history.push({
          status: isLast ? settledStatus : 'PENDING',
          actorId: group.vendorId,
          note:
            group.decision === 'APPROVED'
              ? `${brand} đã duyệt ${group.count} món`
              : `${brand} từ chối ${group.count} món: ${(group.decision as { declined: string }).declined}`,
          hoursAgo: placed - 1 - index * 0.5,
        });
      });
      if (expiredGroups.length > 0) {
        const count = expiredGroups.reduce((sum, [, group]) => sum + group.count, 0);
        history.push({
          status: settledStatus,
          actorId: null,
          note: `Hết hạn duyệt: ${expiredGroups.map(([brand]) => brand).join(', ')} không phản hồi ${count} món`,
          hoursAgo: placed - SEED_APPROVAL_HOURS,
        });
      }
      if (order.status === 'CANCELLED') {
        history.push({ status: 'CANCELLED', actorId: customerId, note: order.closingNote, hoursAgo: placed - 2 });
      }

      if (order.shipment) {
        const reached = trackingTemplate.findIndex(
          (event) => event.status === order.shipment!.status,
        );
        // One event every 6 hours, starting two hours after the order settled
        const settledHoursAgo = history[history.length - 1].hoursAgo;
        const eventHoursAgo = (index: number) => settledHoursAgo - 2 - index * 6;

        const [shipment] = await trx('shipments')
          .insert({
            order_id: orderId,
            carrier: order.shipment.carrier,
            tracking_number: order.shipment.trackingNumber,
            current_status: order.shipment.status,
            // Delivered: the delivery time; still on the way: tomorrow
            estimated_delivery: hoursAgo(
              trx,
              order.shipment.status === 'DELIVERED' ? eventHoursAgo(reached) : -24,
            ),
            created_at: hoursAgo(trx, eventHoursAgo(0)),
            updated_at: hoursAgo(trx, eventHoursAgo(reached)),
          })
          .returning(['id']);

        await trx('tracking_events').insert(
          trackingTemplate.slice(0, reached + 1).map((event, index) => ({
            shipment_id: shipment.id,
            status: event.status,
            location_name: event.locationName,
            description: event.description,
            timestamp: hoursAgo(trx, eventHoursAgo(index)),
          })),
        );

        if (order.status === 'COMPLETED') {
          history.push({
            status: 'COMPLETED',
            actorId: null,
            note: 'Đã giao hàng thành công',
            hoursAgo: eventHoursAgo(reached),
          });
        }
      }

      await trx('order_status_histories').insert(
        history.map((entry) => ({
          order_id: orderId,
          status: entry.status,
          actor_id: entry.actorId,
          note: entry.note ?? null,
          timestamp: hoursAgo(trx, entry.hoursAgo),
        })),
      );

      const last = history[history.length - 1];
      await trx('orders')
        .where('id', orderId)
        .update({ updated_at: hoursAgo(trx, last.hoursAgo) });

      for (let index = 0; index < lines.length; index += 1) {
        const rating = lines[index].rating;
        // Only items that were delivered (approved) can be rated
        if (!rating || itemStatus(decisionOf(lines[index])) !== 'APPROVED') continue;

        const [ratingRow] = await trx('ratings')
          .insert({
            rater_id: customerId,
            rating: rating.stars,
            comment: rating.comment,
            rated_at: hoursAgo(trx, Math.max(last.hoursAgo - 12, 1)),
          })
          .returning(['id']);
        await trx('order_ratings').insert({
          id: ratingRow.id,
          order_item_id: itemRows[index].id,
        });
      }
    }

    // =========================================================================
    // 11. SEED PRE-ORDERS (baker Võ Lan Anh)
    // =========================================================================
    // Stock is not reserved by a request; each cycle takes its own when its order is created.
    const bakerId: string = bakerRow.id;
    const brandVendorId = new Map(
      brands.map((brand, index) => [brand.name, vendorRows[index].id as string]),
    );
    // 00:00 (Vietnam) of the day `startInDays` from today, plus months / days / hours
    const cycleTime = (startInDays: number, months: number, days: number, plusHours = 0) =>
      trx.raw(
        `(((now() AT TIME ZONE '${PRE_ORDER_TZ}')::date + ?::int + make_interval(months => ?, days => ?))::timestamp AT TIME ZONE '${PRE_ORDER_TZ}') + make_interval(hours => ?)`,
        [startInDays, months, days, plusHours],
      );
    const localDay = (startInDays: number, months = 0, minusDays = 0) =>
      trx.raw(
        `((now() AT TIME ZONE '${PRE_ORDER_TZ}')::date + ?::int + make_interval(months => ?) - make_interval(days => ?))::date`,
        [startInDays, months, minusDays],
      );

    for (const preOrder of preOrders) {
      const lines = preOrder.items.map((item) => {
        const product = productBySlug.get(item.slug);
        if (!product) throw new Error(`Seed product ${item.slug} not found`);
        const brand = brands[product.seed.brandIndex].name;
        return { ...item, product, brand, decision: preOrder.decisions[brand] ?? 'PENDING' };
      });
      const requested = preOrder.requestedHoursAgo;
      const isPending = preOrder.status === 'PENDING';

      const [request] = await trx('pre_order_requests')
        .insert({
          issuer_id: bakerId,
          current_status: preOrder.status,
          duration_months: preOrder.durationMonths,
          frequency: preOrder.frequency,
          start_date: localDay(preOrder.startInDays),
          end_date: localDay(preOrder.startInDays, preOrder.durationMonths, 1),
          // Seeded requests use a real-life window of 24 hours
          approval_deadline: hoursAgo(trx, requested - 24),
          shipping_recipient_name: bakerAddress.recipientName,
          shipping_phone: bakerAddress.phone,
          shipping_street_address: bakerAddress.streetAddress,
          shipping_ward: bakerAddress.ward,
          shipping_province: bakerAddress.province,
          currency: 'VND',
          requested_at: hoursAgo(trx, requested),
          updated_at: hoursAgo(trx, requested),
        })
        .returning(['id']);
      const requestId: string = request.id;

      await trx('pre_order_items').insert(
        lines.map((line) => ({
          pre_order_request_id: requestId,
          product_id: line.product.id,
          product_title: line.product.seed.title,
          unit_price: line.product.seed.unitPrice,
          unit_cost: line.product.seed.unitCost,
          unit: line.product.seed.unit,
          quantity: line.quantity,
          note: line.note ?? null,
          status: line.decision,
        })),
      );

      // History: requested, each vendor's answer (the last one settles it), then the start
      const history: Array<{ status: string; actorId: string | null; note?: string; at: Knex.Raw }> = [
        { status: 'PENDING', actorId: bakerId, at: hoursAgo(trx, requested) },
      ];
      const answered = Object.entries(preOrder.decisions).filter(([, decision]) => decision === 'APPROVED');
      answered.forEach(([brand], index) => {
        const isLast = !isPending && index === answered.length - 1;
        history.push({
          status: isLast ? 'APPROVED' : 'PENDING',
          actorId: brandVendorId.get(brand) ?? null,
          note: `${brand} đã duyệt ${lines.filter((line) => line.brand === brand).length} món`,
          at: hoursAgo(trx, requested - 1 - index * 0.5),
        });
      });
      if (!isPending) {
        history.push({
          status: 'ACTIVE',
          actorId: null,
          note: 'Đến ngày bắt đầu, bắt đầu giao định kỳ',
          at: cycleTime(preOrder.startInDays, 0, 0),
        });
      }

      // Plan the cycles like the app does
      const offsets: Array<{ months: number; days: number }> = [];
      for (let month = 0; month < preOrder.durationMonths; month += 1) {
        offsets.push({ months: month, days: 0 });
        if (preOrder.frequency === 'BIWEEKLY') offsets.push({ months: month, days: 14 });
      }

      for (let index = 0; index < offsets.length; index += 1) {
        const cycleNumber = index + 1;
        const offset = offsets[index];
        const isPast = preOrder.startInDays + offset.months * 30 + offset.days <= 0;
        let generatedOrderId: string | null = null;

        // A cycle already reached: its order, delivered within two days
        if (isPast) {
          const subtotal = lines.reduce((sum, line) => sum + line.product.seed.unitPrice * line.quantity, 0);
          const at = (hours: number) => cycleTime(preOrder.startInDays, offset.months, offset.days, hours);
          const [order] = await trx('orders')
            .insert({
              ordered_by: bakerId,
              shipping_recipient_name: bakerAddress.recipientName,
              shipping_phone: bakerAddress.phone,
              shipping_street_address: bakerAddress.streetAddress,
              shipping_ward: bakerAddress.ward,
              shipping_province: bakerAddress.province,
              subtotal,
              total_amount: subtotal,
              currency: 'VND',
              current_status: 'COMPLETED',
              approval_deadline: null,
              placed_at: at(0),
              updated_at: at(32),
            })
            .returning(['id']);
          generatedOrderId = order.id;

          await trx('order_items').insert(
            lines.map((line) => ({
              order_id: order.id,
              product_id: line.product.id,
              product_title: line.product.seed.title,
              unit_price: line.product.seed.unitPrice,
              unit_cost: line.product.seed.unitCost,
              unit: line.product.seed.unit,
              quantity: line.quantity,
              note: line.note ?? null,
              status: 'APPROVED',
            })),
          );

          const [shipment] = await trx('shipments')
            .insert({
              order_id: order.id,
              carrier: 'Giao Hàng Nhanh',
              tracking_number: `GHNPRE${cycleNumber}${requestId.slice(0, 4).toUpperCase()}`,
              current_status: 'DELIVERED',
              estimated_delivery: at(32),
              created_at: at(0),
              updated_at: at(32),
            })
            .returning(['id']);
          await trx('tracking_events').insert(
            trackingTemplate.map((event, step) => ({
              shipment_id: shipment.id,
              status: event.status,
              location_name: event.locationName,
              description: event.description,
              timestamp: at(step * 8),
            })),
          );

          await trx('order_status_histories').insert([
            {
              order_id: order.id,
              status: 'APPROVED',
              actor_id: null,
              note: `Tạo tự động từ đặt định kỳ, kỳ ${cycleNumber}/${offsets.length}`,
              timestamp: at(0),
            },
            {
              order_id: order.id,
              status: 'COMPLETED',
              actor_id: null,
              note: 'Đã giao hàng thành công',
              timestamp: at(32),
            },
          ]);
        }

        const isSkipped = preOrder.skipped?.includes(cycleNumber) ?? false;
        await trx('pre_order_cycles').insert({
          pre_order_request_id: requestId,
          cycle_number: cycleNumber,
          current_status: generatedOrderId ? 'ORDER_CREATED' : isSkipped ? 'SKIPPED' : 'SCHEDULED',
          generated_order_id: generatedOrderId,
          scheduled_at: cycleTime(preOrder.startInDays, offset.months, offset.days),
          created_at: hoursAgo(trx, requested),
        });

        if (isSkipped) {
          history.push({
            status: preOrder.status,
            actorId: bakerId,
            note: `Bỏ qua kỳ ${cycleNumber}`,
            at: hoursAgo(trx, 48),
          });
        }
      }

      await trx('pre_order_status_histories').insert(
        history.map((entry) => ({
          pre_order_request_id: requestId,
          status: entry.status,
          actor_id: entry.actorId,
          note: entry.note ?? null,
          timestamp: entry.at,
        })),
      );
    }
  });
}
