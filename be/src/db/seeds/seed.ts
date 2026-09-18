import type { Knex } from 'knex';

/**
 * Seed dùng chung cho toàn bộ dự án.
 *
 * Mọi module đều seed trong file này, trong cùng MỘT transaction.
 * Lý do: knex chạy seed theo thứ tự alphabet tên file, nên tách
 * nhiều file sẽ khiến module chạy sau xóa mất dữ liệu của module
 * chạy trước (các bảng liên kết nhau qua khóa ngoại).
 *
 * Quy ước khi thêm module mới:
 *   1. Khai dữ liệu mẫu ở phần đầu file, có tiêu đề phân cách.
 *   2. Thêm lệnh del() vào đầu seed(), theo thứ tự NGƯỢC với
 *      thứ tự phụ thuộc (bảng con xóa trước bảng cha).
 *   3. Thêm phần insert vào cuối seed().
 */

const users = [
  {
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

const baseRecipes = [
  {
    title: 'Bánh Chocolate Fudge',
    description: 'Bánh chocolate đậm vị, mềm ẩm, phù hợp cho tiệc sinh nhật.',
    portion: 8,
    tags: ['chocolate', 'cake', 'dessert', 'birthday'],
    ingredients: [
      ['Bột mì đa dụng', 180, 'g'],
      ['Bột cacao', 55, 'g'],
      ['Đường', 160, 'g'],
      ['Trứng gà', 3, 'quả'],
      ['Sữa tươi', 180, 'ml'],
      ['Bơ lạt', 100, 'g'],
      ['Chocolate đen', 120, 'g'],
    ],
    tools: [['Lò nướng', 1], ['Máy đánh trứng', 1], ['Khuôn tròn 20cm', 1]],
    steps: [
      'Làm nóng lò ở 175°C và chuẩn bị khuôn.',
      'Trộn các nguyên liệu khô trong một tô lớn.',
      'Đánh trứng, sữa và bơ chảy rồi trộn cùng hỗn hợp bột.',
      'Thêm chocolate đen, đổ bột vào khuôn.',
      'Nướng khoảng 35 phút và để nguội trước khi trang trí.',
    ],
    notes: ['Không trộn bột quá lâu để bánh không bị chai.', 'Có thể dùng chocolate 70% để vị đậm hơn.'],
  },
  {
    title: 'Cheesecake Oreo Không Cần Lò',
    description: 'Cheesecake lạnh béo nhẹ, có lớp đế Oreo giòn và không cần sử dụng lò nướng.',
    portion: 8,
    tags: ['cheesecake', 'oreo', 'no-bake', 'cold-dessert'],
    ingredients: [
      ['Bánh Oreo', 220, 'g'],
      ['Cream cheese', 350, 'g'],
      ['Whipping cream', 250, 'ml'],
      ['Đường xay', 70, 'g'],
      ['Gelatin', 8, 'g'],
    ],
    tools: [['Tủ lạnh', 1], ['Máy đánh trứng', 1], ['Khuôn đế rời 18cm', 1]],
    steps: [
      'Nghiền Oreo và ép chặt xuống đáy khuôn.',
      'Đánh mềm cream cheese cùng đường xay.',
      'Đánh whipping cream bông mềm rồi trộn với cream cheese.',
      'Thêm gelatin đã ngâm nở và hòa tan.',
      'Đổ hỗn hợp vào khuôn và làm lạnh ít nhất 6 giờ.',
    ],
    notes: ['Không đánh whipping cream quá cứng.', 'Để qua đêm sẽ cho kết cấu ổn định hơn.'],
  },
  {
    title: 'Bánh Chuối Yến Mạch',
    description: 'Bánh chuối mềm, ít ngọt, dùng yến mạch và phù hợp cho bữa sáng.',
    portion: 6,
    tags: ['banana', 'oat', 'healthy', 'breakfast'],
    ingredients: [
      ['Chuối chín', 3, 'quả'],
      ['Yến mạch cán dẹt', 180, 'g'],
      ['Trứng gà', 2, 'quả'],
      ['Sữa chua không đường', 100, 'g'],
      ['Mật ong', 35, 'g'],
      ['Bột quế', 2, 'g'],
    ],
    tools: [['Máy xay', 1], ['Lò nướng', 1], ['Khuôn loaf', 1]],
    steps: [
      'Nghiền chuối thật nhuyễn.',
      'Xay một nửa lượng yến mạch thành bột mịn.',
      'Trộn toàn bộ nguyên liệu thành hỗn hợp đồng nhất.',
      'Cho vào khuôn loaf đã lót giấy nến.',
      'Nướng ở 170°C trong khoảng 35 phút.',
    ],
    notes: ['Chuối càng chín bánh càng ngọt tự nhiên.'],
  },
  {
    title: 'Tiramisu Cổ Điển',
    description: 'Tiramisu mascarpone với cà phê espresso và cacao, mềm mịn và thơm.',
    portion: 8,
    tags: ['tiramisu', 'coffee', 'italian', 'no-bake'],
    ingredients: [
      ['Mascarpone', 400, 'g'],
      ['Ladyfinger', 250, 'g'],
      ['Cà phê espresso', 250, 'ml'],
      ['Trứng gà', 4, 'quả'],
      ['Đường', 90, 'g'],
      ['Bột cacao', 25, 'g'],
    ],
    tools: [['Máy đánh trứng', 1], ['Khay chữ nhật', 1], ['Tủ lạnh', 1]],
    steps: [
      'Pha espresso và để nguội hoàn toàn.',
      'Đánh lòng đỏ với đường rồi trộn mascarpone.',
      'Đánh lòng trắng bông mềm và fold vào hỗn hợp mascarpone.',
      'Nhúng nhanh ladyfinger vào cà phê rồi xếp thành lớp.',
      'Phủ kem, lặp lại các lớp và làm lạnh ít nhất 6 giờ.',
    ],
    notes: ['Không ngâm ladyfinger quá lâu để tránh bị nhão.'],
  },
  {
    title: 'Matcha Roll Cake',
    description: 'Bánh cuộn matcha mềm xốp với lớp kem tươi thanh nhẹ.',
    portion: 8,
    tags: ['matcha', 'roll-cake', 'japanese', 'cream'],
    ingredients: [
      ['Bột mì', 70, 'g'],
      ['Bột matcha', 10, 'g'],
      ['Trứng gà', 4, 'quả'],
      ['Đường', 80, 'g'],
      ['Sữa tươi', 50, 'ml'],
      ['Dầu thực vật', 35, 'ml'],
      ['Whipping cream', 180, 'ml'],
    ],
    tools: [['Lò nướng', 1], ['Khay nướng phẳng', 1], ['Máy đánh trứng', 1]],
    steps: [
      'Đánh lòng đỏ với sữa và dầu.',
      'Rây bột mì và matcha vào hỗn hợp.',
      'Đánh lòng trắng với đường đến chóp mềm.',
      'Fold hai hỗn hợp rồi dàn mỏng trên khay.',
      'Nướng ở 165°C khoảng 18 phút, để nguội rồi cuộn cùng kem.',
    ],
    notes: ['Không dùng quá nhiều matcha vì bánh dễ đắng.'],
  },
  {
    title: 'Red Velvet Cupcake',
    description: 'Cupcake red velvet mềm ẩm với cream cheese frosting.',
    portion: 12,
    tags: ['red-velvet', 'cupcake', 'cream-cheese', 'party'],
    ingredients: [
      ['Bột mì', 190, 'g'],
      ['Đường', 160, 'g'],
      ['Bột cacao', 12, 'g'],
      ['Buttermilk', 160, 'ml'],
      ['Trứng gà', 2, 'quả'],
      ['Cream cheese', 250, 'g'],
    ],
    tools: [['Lò nướng', 1], ['Khay cupcake', 1], ['Túi bắt kem', 1]],
    steps: [
      'Trộn nguyên liệu khô.',
      'Đánh trứng với đường và buttermilk.',
      'Trộn hai hỗn hợp đến vừa hòa quyện.',
      'Chia vào khuôn cupcake và nướng ở 170°C khoảng 20 phút.',
      'Để nguội rồi bắt cream cheese frosting lên mặt.',
    ],
    notes: ['Cupcake phải nguội hoàn toàn trước khi bắt kem.'],
  },
  {
    title: 'Lemon Tart',
    description: 'Tart chanh chua ngọt cân bằng với lớp vỏ giòn bơ.',
    portion: 8,
    tags: ['lemon', 'tart', 'citrus', 'dessert'],
    ingredients: [
      ['Bột mì', 220, 'g'],
      ['Bơ lạt', 120, 'g'],
      ['Đường', 130, 'g'],
      ['Trứng gà', 4, 'quả'],
      ['Nước cốt chanh', 120, 'ml'],
      ['Vỏ chanh bào', 5, 'g'],
    ],
    tools: [['Lò nướng', 1], ['Khuôn tart', 1], ['Phới lồng', 1]],
    steps: [
      'Nhào bột mì với bơ thành khối bột tart.',
      'Làm lạnh bột 30 phút rồi cán vào khuôn.',
      'Nướng mù phần đế đến vàng nhẹ.',
      'Nấu hỗn hợp trứng, đường và nước chanh đến sánh.',
      'Đổ lemon curd lên đế tart và làm lạnh.',
    ],
    notes: ['Lọc lemon curd qua rây để nhân thật mịn.'],
  },
  {
    title: 'Basque Burnt Cheesecake',
    description: 'Cheesecake kiểu Basque với mặt cháy caramel và phần ruột mềm béo.',
    portion: 8,
    tags: ['basque', 'cheesecake', 'burnt', 'spanish'],
    ingredients: [
      ['Cream cheese', 500, 'g'],
      ['Whipping cream', 250, 'ml'],
      ['Đường', 140, 'g'],
      ['Trứng gà', 4, 'quả'],
      ['Bột mì', 18, 'g'],
    ],
    tools: [['Lò nướng', 1], ['Khuôn tròn 18cm', 1], ['Giấy nến', 2]],
    steps: [
      'Đánh mềm cream cheese với đường.',
      'Thêm từng quả trứng vào hỗn hợp.',
      'Cho whipping cream và bột mì vào trộn đều.',
      'Đổ vào khuôn đã lót giấy nến.',
      'Nướng 220°C đến khi mặt bánh cháy nâu đậm.',
    ],
    notes: ['Phần giữa bánh còn rung nhẹ khi lấy khỏi lò là bình thường.'],
  },
  {
    title: 'Panna Cotta Vanilla',
    description: 'Panna cotta vanilla mềm mượt, thanh nhẹ và dễ làm.',
    portion: 6,
    tags: ['panna-cotta', 'vanilla', 'italian', 'cold-dessert'],
    ingredients: [
      ['Whipping cream', 400, 'ml'],
      ['Sữa tươi', 200, 'ml'],
      ['Đường', 70, 'g'],
      ['Gelatin', 8, 'g'],
      ['Vanilla', 5, 'ml'],
    ],
    tools: [['Nồi nhỏ', 1], ['Tủ lạnh', 1], ['Cốc thủy tinh', 6]],
    steps: [
      'Ngâm gelatin trong nước lạnh.',
      'Đun whipping cream, sữa và đường đến nóng.',
      'Tắt bếp rồi thêm gelatin và vanilla.',
      'Rót vào cốc.',
      'Làm lạnh ít nhất 4 giờ.',
    ],
    notes: ['Không để hỗn hợp sôi mạnh sau khi thêm gelatin.'],
  },
  {
    title: 'Cookies Chocolate Chip',
    description: 'Cookie giòn cạnh, mềm giữa, nhiều chocolate chip.',
    portion: 12,
    tags: ['cookie', 'chocolate-chip', 'snack', 'american'],
    ingredients: [
      ['Bột mì', 240, 'g'],
      ['Bơ lạt', 130, 'g'],
      ['Đường nâu', 120, 'g'],
      ['Đường trắng', 60, 'g'],
      ['Trứng gà', 1, 'quả'],
      ['Chocolate chip', 180, 'g'],
    ],
    tools: [['Lò nướng', 1], ['Khay nướng', 2], ['Muỗng múc cookie', 1]],
    steps: [
      'Đánh bơ với hai loại đường.',
      'Thêm trứng và trộn đều.',
      'Cho bột mì vào trộn vừa hòa quyện.',
      'Fold chocolate chip và chia bột thành viên.',
      'Nướng ở 175°C khoảng 12 phút.',
    ],
    notes: ['Làm lạnh bột 30 phút giúp cookie ít chảy hơn.'],
  },
];

const flavors = [
  ['Dâu Tây', 'strawberry', 'Dâu tây tươi'],
  ['Xoài', 'mango', 'Xoài chín'],
  ['Việt Quất', 'blueberry', 'Việt quất'],
  ['Pistachio', 'pistachio', 'Hạt pistachio'],
  ['Dừa', 'coconut', 'Cơm dừa'],
  ['Caramel', 'caramel', 'Sốt caramel'],
];

const families = [
  {
    name: 'Mousse',
    description: 'Mousse mềm mịn, nhẹ và mát.',
    tags: ['mousse', 'cold-dessert'],
    ingredients: [['Whipping cream', 250, 'ml'], ['Gelatin', 7, 'g'], ['Đường', 60, 'g']],
    tools: [['Máy đánh trứng', 1], ['Tủ lạnh', 1]],
  },
  {
    name: 'Macaron',
    description: 'Macaron vỏ giòn nhẹ, ruột dẻo và nhân kem đậm vị.',
    tags: ['macaron', 'french'],
    ingredients: [['Bột hạnh nhân', 120, 'g'], ['Đường bột', 120, 'g'], ['Lòng trắng trứng', 90, 'g']],
    tools: [['Lò nướng', 1], ['Túi bắt kem', 1], ['Tấm silicon', 1]],
  },
  {
    name: 'Chiffon Cake',
    description: 'Chiffon nhẹ, mềm và xốp.',
    tags: ['chiffon', 'cake'],
    ingredients: [['Bột mì', 120, 'g'], ['Trứng gà', 5, 'quả'], ['Dầu thực vật', 55, 'ml']],
    tools: [['Lò nướng', 1], ['Khuôn chiffon', 1], ['Máy đánh trứng', 1]],
  },
  {
    name: 'Pudding',
    description: 'Pudding mềm, mịn, thích hợp dùng lạnh.',
    tags: ['pudding', 'cold-dessert'],
    ingredients: [['Sữa tươi', 400, 'ml'], ['Đường', 70, 'g'], ['Gelatin', 6, 'g']],
    tools: [['Nồi nhỏ', 1], ['Tủ lạnh', 1]],
  },
  {
    name: 'Cupcake',
    description: 'Cupcake nhỏ gọn, mềm ẩm và dễ trang trí.',
    tags: ['cupcake', 'party'],
    ingredients: [['Bột mì', 180, 'g'], ['Trứng gà', 2, 'quả'], ['Bơ lạt', 100, 'g']],
    tools: [['Lò nướng', 1], ['Khay cupcake', 1], ['Máy đánh trứng', 1]],
  },
];

const familySteps: Record<string, string[]> = {
  Mousse: [
    'Chuẩn bị phần nguyên liệu tạo hương vị.',
    'Đánh whipping cream đến bông mềm.',
    'Trộn hương vị chính với gelatin đã hòa tan.',
    'Fold whipping cream vào hỗn hợp.',
    'Làm lạnh ít nhất 4 giờ.',
  ],
  Macaron: [
    'Rây bột hạnh nhân và đường bột.',
    'Đánh lòng trắng trứng thành meringue.',
    'Macaronage đến khi bột chảy thành dải.',
    'Bắt bánh và hong mặt.',
    'Nướng ở 150°C rồi kẹp nhân.',
  ],
  'Chiffon Cake': [
    'Trộn lòng đỏ với dầu và phần hương vị.',
    'Rây bột mì vào hỗn hợp.',
    'Đánh lòng trắng thành meringue.',
    'Fold nhẹ hai hỗn hợp.',
    'Nướng ở 165°C và úp ngược khuôn khi bánh chín.',
  ],
  Pudding: [
    'Ngâm gelatin trong nước lạnh.',
    'Đun sữa cùng đường và phần hương vị.',
    'Cho gelatin vào khuấy tan.',
    'Rót ra cốc.',
    'Làm lạnh đến khi đông.',
  ],
  Cupcake: [
    'Đánh bơ với đường.',
    'Thêm trứng và phần hương vị.',
    'Trộn bột mì vào hỗn hợp.',
    'Chia bột vào khuôn.',
    'Nướng ở 170°C khoảng 20 phút.',
  ],
};

// ==========================================================
// PRODUCT MODULE
// ==========================================================

const vendorUsers = [
  {
    email: 'vendor.hoasen@example.com',
    displayname: 'Tiệm Bánh Hoa Sen',
    password: 'password123',
    role: 'VENDOR',
    taxCode: '0312345678',
  },
  {
    email: 'vendor.mattroi@example.com',
    displayname: 'Bánh Ngọt Mặt Trời',
    password: 'password123',
    role: 'VENDOR',
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
    description: 'Bộ sưu tập bánh trung thu truyền thống và hiện đại.',
    isActive: true,
  },
  {
    name: 'Hàng Mới Về',
    slug: 'hang-moi-ve',
    description: 'Những sản phẩm vừa lên kệ trong tuần.',
    isActive: true,
  },
  {
    name: 'Bánh Không Đường',
    slug: 'banh-khong-duong',
    description: 'Dành cho người ăn kiêng hoặc tiểu đường.',
    isActive: true,
  },
  {
    name: 'Bộ Sưu Tập Cũ',
    slug: 'bo-suu-tap-cu',
    description: 'Đã ngừng kinh doanh, giữ lại để tham khảo.',
    isActive: false,
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
    description:
      'Bánh nướng nhân thập cẩm truyền thống với hạt dưa, lạp xưởng và mứt bí.',
    unitPrice: 85000,
    unitCost: 52000,
    unit: 'cái',
    stock: 120,
    brandIndex: 0,
    tags: ['trung-thu', 'banh-nuong', 'truyen-thong'],
    notes: [
      'Bảo quản nơi khô ráo, dùng trong 30 ngày.',
      'Không để trong tủ lạnh vì vỏ bánh sẽ bị cứng.',
    ],
    collectionSlugs: ['banh-trung-thu'],
    alerts: [
      { alertType: 'MINIMUM', threshold: 20 },
      { alertType: 'REORDER', threshold: 50 },
      { alertType: 'MAXIMUM', threshold: 300 },
    ],
  },
  {
    title: 'Bánh Trung Thu Trứng Muối Tan Chảy',
    slug: 'banh-trung-thu-trung-muoi',
    description:
      'Bánh dẻo nhân custard trứng muối chảy, vị béo ngậy và mặn ngọt hài hòa.',
    unitPrice: 95000,
    unitCost: 60000,
    unit: 'cái',
    stock: 80,
    brandIndex: 0,
    tags: ['trung-thu', 'banh-deo', 'trung-muoi'],
    notes: ['Bảo quản lạnh 5-10°C, dùng trong 10 ngày.'],
    collectionSlugs: ['banh-trung-thu', 'hang-moi-ve'],
    alerts: [
      { alertType: 'MINIMUM', threshold: 15 },
      { alertType: 'REORDER', threshold: 40 },
    ],
  },
  {
    title: 'Bánh Mì Nguyên Cám',
    slug: 'banh-mi-nguyen-cam',
    description:
      'Bánh mì làm từ bột mì nguyên cám, giàu chất xơ, không thêm đường.',
    unitPrice: 42000,
    unitCost: 24000,
    unit: 'ổ',
    stock: 45,
    brandIndex: 1,
    tags: ['banh-mi', 'nguyen-cam', 'healthy', 'khong-duong'],
    notes: [
      'Dùng trong 3 ngày kể từ ngày sản xuất.',
      'Có thể cấp đông tối đa 1 tháng.',
    ],
    collectionSlugs: ['banh-khong-duong', 'hang-moi-ve'],
    alerts: [
      { alertType: 'MINIMUM', threshold: 10 },
      { alertType: 'REORDER', threshold: 25 },
    ],
  },
  {
    title: 'Croissant Bơ Pháp',
    slug: 'croissant-bo-phap',
    description:
      'Croissant nhiều lớp, sử dụng bơ Pháp AOP, nướng mới mỗi sáng.',
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
    title: 'Bánh Quy Yến Mạch Không Đường',
    slug: 'banh-quy-yen-mach-khong-duong',
    description:
      'Bánh quy yến mạch dùng đường ăn kiêng erythritol, phù hợp người tiểu đường.',
    unitPrice: 68000,
    unitCost: 41000,
    unit: 'hộp 200g',
    stock: 30,
    brandIndex: 1,
    tags: ['banh-quy', 'yen-mach', 'khong-duong', 'an-kieng'],
    notes: ['Đóng gói hút chân không.', 'Hạn sử dụng 6 tháng.'],
    collectionSlugs: ['banh-khong-duong'],
    alerts: [
      { alertType: 'MINIMUM', threshold: 8 },
      { alertType: 'MAXIMUM', threshold: 150 },
    ],
  },
  {
    title: 'Bánh Kem Dâu Tây Tươi',
    slug: 'banh-kem-dau-tay-tuoi',
    description: 'Cốt bánh chiffon vani, kem tươi Pháp và dâu tây Đà Lạt.',
    unitPrice: 320000,
    unitCost: 185000,
    unit: 'cái',
    stock: 15,
    brandIndex: 0,
    tags: ['banh-kem', 'dau-tay', 'sinh-nhat'],
    notes: [
      'Đặt trước tối thiểu 24 giờ.',
      'Bảo quản lạnh, dùng trong 2 ngày.',
    ],
    collectionSlugs: ['hang-moi-ve'],
    alerts: [
      { alertType: 'MINIMUM', threshold: 3 },
      { alertType: 'REORDER', threshold: 8 },
    ],
  },
  {
    title: 'Bánh Su Kem Nhân Trà Xanh',
    slug: 'banh-su-kem-tra-xanh',
    description: 'Vỏ su giòn nhẹ, nhân custard trà xanh Uji Nhật Bản.',
    unitPrice: 28000,
    unitCost: 15000,
    unit: 'cái',
    stock: 0,
    brandIndex: 0,
    tags: ['su-kem', 'tra-xanh', 'matcha'],
    notes: ['Tạm hết hàng, dự kiến nhập lại cuối tuần.'],
    collectionSlugs: [],
    alerts: [{ alertType: 'MINIMUM', threshold: 20 }],
  },
  {
    title: 'Tart Trứng Bồ Đào Nha',
    slug: 'tart-trung-bo-dao-nha',
    description:
      'Vỏ tart ngàn lớp giòn rụm, nhân trứng sữa mềm mịn, mặt caramel.',
    unitPrice: 25000,
    unitCost: 13000,
    unit: 'cái',
    stock: 90,
    brandIndex: 1,
    tags: ['tart', 'trung', 'bo-dao-nha'],
    notes: ['Hâm nóng 3 phút ở 160°C trước khi dùng.'],
    collectionSlugs: ['hang-moi-ve'],
    alerts: [
      { alertType: 'MINIMUM', threshold: 20 },
      { alertType: 'REORDER', threshold: 45 },
    ],
  },
];

export async function seed(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    // --- product module ---
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

    // --- recipe module ---
    await trx('recipe_tags').del();
    await trx('recipe_notes').del();
    await trx('recipe_tools').del();
    await trx('recipe_ingredients').del();
    await trx('steps').del();
    await trx('recipes').del();
    await trx('images').del();
    await trx('users').del();

    const userRows = await trx('users')
      .insert(users)
      .returning([
        'id',
        'email',
        'displayname',
        'role',
      ]);

    const recipes = [...baseRecipes];

    for (
      const [flavorName, flavorTag, flavorIngredient]
      of flavors
    ) {
      for (const family of families) {
        recipes.push({
          title: `${family.name} ${flavorName}`,

          description:
            `${family.description} Phiên bản ` +
            `${flavorName.toLowerCase()} thơm rõ vị và dễ ăn.`,

          portion:
            family.name === 'Macaron'
              ? 16
              : family.name === 'Cupcake'
                ? 12
                : 6,

          tags: [
            ...family.tags,
            flavorTag,
            'homemade',
          ],

          ingredients: [
            ...family.ingredients,
            [flavorIngredient, 120, 'g'],
          ],

          tools: family.tools,

          steps: familySteps[family.name],

          notes: [
            `Có thể điều chỉnh lượng ${
              String(flavorIngredient).toLowerCase()
            } theo khẩu vị.`,

            'Bảo quản kín và dùng sớm để giữ chất lượng tốt nhất.',
          ],
        });
      }
    }

    const imageRows = await trx('images')
      .insert(
        recipes.map((recipe, index) => ({
          display_name: `${recipe.title} cover`,

          original_name:
            `recipe-${index + 1}.jpg`,

          url:
            `https://picsum.photos/seed/` +
            `bakers-recipe-${index + 1}/800/600`,

          content_type: 'image/jpeg',
        })),
      )
      .returning(['id']);

    for (
      let index = 0;
      index < recipes.length;
      index += 1
    ) {
      const recipe = recipes[index];

      const user =
        userRows[index % userRows.length];

      const image = imageRows[index];

      const isPublic =
        index % 7 !== 0;

      const isSnapshot =
        isPublic && index % 11 === 0;

      const [createdRecipe] =
        await trx('recipes')
          .insert({
            cover_img_id: image.id,

            user_id: user.id,

            title: recipe.title,

            description:
              recipe.description,

            portion:
              recipe.portion,

            is_public:
              isPublic,

            is_snapshot:
              isSnapshot,

            created_at:
              trx.raw(
                `NOW() - (? * INTERVAL '1 day')`,
                [index],
              ),
          })
          .returning(['id']);

      const recipeId =
        createdRecipe.id;

      await trx('recipe_ingredients')
        .insert(
          recipe.ingredients.map(
            ([name, amount, unit]) => ({
              recipe_id: recipeId,
              name,
              amount,
              unit,
            }),
          ),
        );

      await trx('recipe_tools')
        .insert(
          recipe.tools.map(
            ([name, amount]) => ({
              recipe_id: recipeId,
              name,
              amount,
            }),
          ),
        );

      await trx('steps')
        .insert(
          recipe.steps.map(
            (
              description,
              stepIndex,
            ) => ({
              recipe_id: recipeId,

              step_order:
                stepIndex + 1,

              description,
            }),
          ),
        );

      await trx('recipe_notes')
        .insert(
          recipe.notes.map(
            (content) => ({
              recipe_id: recipeId,
              content,
            }),
          ),
        );

      await trx('recipe_tags')
        .insert(
          [...new Set(recipe.tags)]
            .map((name) => ({
              recipe_id: recipeId,
              name,
            })),
        );
    }

    // ======================================================
    // PRODUCT MODULE
    // ======================================================

    const vendorRows = await trx('users')
      .insert(
        vendorUsers.map(
          ({ email, displayname, password, role }) => ({
            email,
            displayname,
            password,
            role,
          }),
        ),
      )
      .returning(['id']);

    await trx('vendors').insert(
      vendorRows.map((row, index) => ({
        id: row.id,
        taxCode: vendorUsers[index].taxCode,
        registeredAt: trx.fn.now(),
      })),
    );

    const brandRows = await trx('brands')
      .insert(
        brands.map((brand, index) => ({
          name: brand.name,
          domain: brand.domain,
          vendorId: vendorRows[index].id,
        })),
      )
      .returning(['id']);

    const collectionRows = await trx('collections')
      .insert(collections)
      .returning(['id', 'slug']);

    const collectionIdBySlug = new Map<string, string>(
      collectionRows.map(
        (row: { id: string; slug: string }) => [row.slug, row.id],
      ),
    );

    for (let index = 0; index < products.length; index += 1) {
      const product = products[index];

      const [createdProduct] = await trx('products')
        .insert({
          brandId: brandRows[product.brandIndex].id,
          vendorId: vendorRows[product.brandIndex].id,
          title: product.title,
          description: product.description,
          slug: product.slug,
          unitPrice: product.unitPrice,
          unitCost: product.unitCost,
          currency: 'VND',
          unit: product.unit,
          createdAt: trx.raw(
            `NOW() - (? * INTERVAL '1 day')`,
            [index],
          ),
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
            productStockId: productId,
            alertType: alert.alertType,
            threshold: alert.threshold,
          })),
        );
      }

      if (product.tags.length > 0) {
        await trx('product_tags').insert(
          product.tags.map((name) => ({
            productId,
            name,
          })),
        );
      }

      if (product.notes.length > 0) {
        await trx('product_notes').insert(
          product.notes.map((content) => ({
            productId,
            content,
          })),
        );
      }

      const collectionIds = product.collectionSlugs
        .map((slug) => collectionIdBySlug.get(slug))
        .filter((id): id is string => Boolean(id));

      if (collectionIds.length > 0) {
        await trx('product_collections').insert(
          collectionIds.map((collectionId) => ({
            productId,
            collectionId,
          })),
        );
      }
    }
  });
}