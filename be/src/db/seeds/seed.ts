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
      'Bánh chocolate fudge có kết cấu mềm ẩm, đặc vừa phải và vị cacao đậm. Chocolate đen được hòa cùng bơ và phần bột bánh để tạo độ béo, hậu vị hơi đắng và bề mặt ẩm mượt. Công thức phù hợp làm bánh sinh nhật, bánh tráng miệng hoặc dùng cùng kem vanilla và trái cây tươi.',
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
      'Làm nóng lò ở 175°C trong ít nhất 15 phút. Lót giấy nến dưới đáy khuôn tròn 20cm và quét một lớp bơ mỏng quanh thành khuôn để bánh dễ lấy ra sau khi nướng.',
      'Rây bột mì và bột cacao vào một tô lớn, thêm đường rồi dùng phới lồng trộn đều để cacao không bị vón và các nguyên liệu khô phân bố đồng đều.',
      'Đun chảy bơ cùng chocolate đen bằng phương pháp cách thủy hoặc quay vi sóng từng khoảng ngắn. Khuấy đến khi hỗn hợp bóng mịn rồi để nguội bớt khoảng 5 phút.',
      'Đánh trứng với sữa tươi đến khi hòa quyện. Rót từ từ hỗn hợp chocolate-bơ vào, vừa rót vừa khuấy để nhiệt từ chocolate không làm trứng bị chín cục bộ.',
      'Cho nguyên liệu khô vào hỗn hợp ướt theo 2-3 lần. Dùng spatula fold từ đáy tô lên trên đến khi vừa hết vệt bột khô, tránh khuấy quá lâu làm bánh bị dai.',
      'Đổ bột vào khuôn, gõ nhẹ khuôn xuống bàn vài lần để làm vỡ các bọt khí lớn. Nướng khoảng 32-38 phút, kiểm tra khi que thử còn dính một ít vụn ẩm là đạt.',
      'Để bánh nghỉ trong khuôn khoảng 15 phút rồi lấy ra rack cho nguội hoàn toàn. Có thể phủ ganache chocolate hoặc rắc cacao trước khi cắt bánh thành phần.',
    ],
    notes: [
      'Không nướng đến khi que thử khô hoàn toàn vì chocolate fudge cần giữ phần ruột ẩm; nướng quá lâu sẽ làm bánh khô và mất đặc trưng mềm đặc.',
      'Chocolate 60-70% cacao cho vị cân bằng giữa đắng và ngọt. Nếu dùng chocolate ngọt hơn, có thể giảm nhẹ lượng đường trong công thức.',
      'Bánh ngon hơn sau khi để nguội hoàn toàn khoảng 2 giờ vì cấu trúc chocolate ổn định và vị cacao rõ hơn. Bảo quản kín ở nhiệt độ phòng 1 ngày hoặc trong tủ lạnh 3-4 ngày.',
    ],
  },
  {
    title: 'Cheesecake Oreo Không Cần Lò',
    description:
      'Cheesecake Oreo không cần lò có lớp đế bánh quy giòn, phần kem cream cheese béo nhẹ và kết cấu mịn nhờ gelatin. Vị mặn nhẹ của cream cheese cân bằng với Oreo và whipping cream, phù hợp cho những ngày nóng hoặc khi cần món tráng miệng có thể chuẩn bị trước.',
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
      'Tách khoảng 160g Oreo để làm đế, nghiền thật mịn rồi trộn với một phần kem Oreo hoặc 45g bơ chảy nếu muốn đế chắc hơn. Ép hỗn hợp xuống đáy khuôn thật đều và làm lạnh 20 phút.',
      'Để cream cheese về nhiệt độ phòng khoảng 20-30 phút, sau đó đánh ở tốc độ thấp cùng đường xay đến khi mịn. Vét thành tô để tránh còn các cục cream cheese chưa hòa tan.',
      'Ngâm gelatin với lượng nước lạnh gấp khoảng 5 lần khối lượng gelatin trong 10 phút. Làm tan gelatin bằng cách thủy hoặc vi sóng ngắn rồi để nguội xuống mức ấm.',
      'Đánh whipping cream lạnh đến bông mềm, khi nhấc que đánh lên kem tạo chóp cong. Không đánh đến bông cứng vì khi fold với cream cheese hỗn hợp dễ bị lợn cợn.',
      'Trộn một ít hỗn hợp cream cheese vào gelatin để cân bằng nhiệt, sau đó đổ ngược phần gelatin vào tô cream cheese. Fold whipping cream vào 2-3 lần cho đến khi hỗn hợp đồng nhất.',
      'Bẻ nhỏ phần Oreo còn lại rồi trộn nhẹ vào nhân. Đổ nhân lên đế bánh, dàn phẳng mặt và gõ nhẹ khuôn để loại bỏ bọt khí lớn.',
      'Làm lạnh ít nhất 6 giờ, tốt nhất qua đêm. Trước khi tháo khuôn, dùng khăn ấm áp quanh thành khuôn vài giây rồi từ từ đẩy bánh ra để giữ cạnh bánh sắc nét.',
    ],
    notes: [
      'Cream cheese nên mềm ở nhiệt độ phòng nhưng whipping cream phải thật lạnh; chênh lệch này giúp phần cheese mịn trong khi kem vẫn đánh bông ổn định.',
      'Gelatin quá nóng có thể làm whipping cream chảy, còn gelatin quá nguội có thể đông thành sợi. Nên cho gelatin vào khi còn ấm nhẹ và hỗn hợp cream cheese không quá lạnh.',
      'Cheesecake để qua đêm thường cắt đẹp hơn. Dùng dao nhúng nước nóng rồi lau khô giữa mỗi lần cắt để lát bánh gọn và không kéo nhân.',
    ],
  },
  {
    title: 'Bánh Chuối Yến Mạch',
    description:
      'Bánh chuối yến mạch mềm ẩm, ngọt chủ yếu từ chuối chín và mật ong, phù hợp cho bữa sáng hoặc bữa phụ. Một phần yến mạch được xay thành bột để tạo cấu trúc, phần còn lại giữ nguyên giúp bánh có độ nhai nhẹ và cảm giác no lâu hơn.',
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
      'Làm nóng lò ở 170°C. Lót giấy nến vào khuôn loaf, chừa phần giấy cao hơn miệng khuôn để có thể nhấc bánh ra dễ dàng sau khi nướng.',
      'Nghiền 2,5 quả chuối thật nhuyễn, giữ lại nửa quả để trang trí mặt bánh. Chuối càng chín và có nhiều đốm nâu thì bánh càng thơm và ngọt tự nhiên.',
      'Xay khoảng một nửa lượng yến mạch thành bột mịn. Trộn bột yến mạch với phần yến mạch cán dẹt còn lại và bột quế.',
      'Đánh nhẹ trứng, thêm sữa chua, mật ong và chuối nghiền. Khuấy đến khi hỗn hợp ướt đồng nhất trước khi cho nguyên liệu khô vào.',
      'Cho hỗn hợp yến mạch vào tô chuối, trộn vừa đủ rồi để nghỉ 8-10 phút để yến mạch hút ẩm. Nếu bột quá đặc có thể thêm 20-30ml sữa tươi.',
      'Đổ bột vào khuôn, đặt nửa quả chuối lên mặt. Nướng 35-42 phút đến khi mặt vàng và que thử cắm giữa bánh chỉ còn vài vụn ẩm.',
      'Để bánh nguội trong khuôn 10 phút rồi chuyển sang rack. Chờ bánh nguội bớt trước khi cắt để lát bánh không bị nát do phần ruột còn quá mềm.',
    ],
    notes: [
      'Không cần thêm quá nhiều mật ong nếu chuối đã chín kỹ. Có thể nếm phần chuối nghiền trước để điều chỉnh độ ngọt phù hợp.',
      'Yến mạch hút nước mạnh hơn bột mì nên hỗn hợp sẽ đặc dần trong thời gian nghỉ. Không nên thêm quá nhiều bột ngay từ đầu.',
      'Có thể thêm hạt óc chó, hạnh nhân hoặc chocolate chip. Bảo quản bánh trong hộp kín ở tủ lạnh 3 ngày và làm ấm nhẹ trước khi ăn.',
    ],
  },
  {
    title: 'Tiramisu Cổ Điển',
    description:
      'Tiramisu cổ điển gồm các lớp ladyfinger thấm espresso xen kẽ kem mascarpone mịn, phủ cacao đắng trên mặt. Món bánh không cần nướng này có hương cà phê rõ, vị béo nhẹ và ngon nhất sau khi được làm lạnh đủ lâu để các lớp bánh và kem ổn định.',
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
      'Pha espresso đậm, đổ ra khay rộng và để nguội hoàn toàn. Có thể thêm một ít đường hoặc rượu cà phê nếu muốn, nhưng không nên làm cà phê quá ngọt.',
      'Tách lòng đỏ và lòng trắng trứng vào hai tô sạch. Đánh lòng đỏ với khoảng 60g đường đến khi màu nhạt, hỗn hợp đặc và chảy thành dải.',
      'Cho mascarpone vào hỗn hợp lòng đỏ theo từng phần, đánh tốc độ thấp vừa đủ mịn. Tránh đánh quá lâu vì mascarpone có thể tách nước.',
      'Đánh lòng trắng với phần đường còn lại đến chóp mềm-vừa. Fold lòng trắng vào hỗn hợp mascarpone theo 3 lần để giữ không khí và tạo phần kem nhẹ.',
      'Nhúng từng chiếc ladyfinger vào espresso trong khoảng 1 giây mỗi mặt rồi xếp kín đáy khay. Bánh chỉ cần ẩm bên ngoài, không nên ngâm đến khi mềm nhũn.',
      'Phủ một nửa lượng kem mascarpone lên lớp bánh, dàn phẳng rồi lặp lại thêm một lớp ladyfinger và một lớp kem. Che kín khay và làm lạnh ít nhất 6 giờ.',
      'Trước khi dùng, rây một lớp cacao mỏng đều trên mặt. Cắt tiramisu bằng dao sạch, lau dao giữa mỗi lần cắt để các lớp giữ hình đẹp.',
    ],
    notes: [
      'Nếu sử dụng trứng sống, nên chọn trứng thật tươi hoặc dùng trứng đã tiệt trùng để giảm rủi ro an toàn thực phẩm.',
      'Ladyfinger hút cà phê rất nhanh. Nhúng quá lâu sẽ khiến phần đáy chảy nước và tiramisu mất cấu trúc sau khi để lạnh.',
      'Tiramisu ngon nhất sau 8-12 giờ làm lạnh và nên dùng trong 2 ngày. Chỉ rắc cacao sát thời điểm ăn để lớp cacao không hút ẩm quá nhiều.',
    ],
  },
  {
    title: 'Matcha Roll Cake',
    description:
      'Bánh cuộn matcha có cốt sponge mỏng, mềm và đàn hồi, kết hợp với lớp whipping cream nhẹ để cân bằng vị trà xanh hơi đắng. Kỹ thuật fold meringue và cuộn bánh khi cốt còn đủ ẩm là hai yếu tố quan trọng giúp bánh không bị xẹp hoặc nứt.',
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
      'Làm nóng lò ở 165°C và lót giấy nến kín đáy khay nướng phẳng. Tách lòng đỏ và lòng trắng trứng, đảm bảo tô đựng lòng trắng sạch và không dính dầu.',
      'Khuấy lòng đỏ với sữa và dầu đến khi nhũ hóa. Rây bột mì cùng matcha vào, dùng phới lồng khuấy nhẹ đến khi hỗn hợp mịn và không còn bột khô.',
      'Đánh lòng trắng ở tốc độ trung bình đến khi nổi bọt mịn, thêm đường từ từ thành 3 lần và tiếp tục đánh đến chóp mềm-vừa, đầu chóp hơi cong xuống.',
      'Lấy một phần meringue trộn vào hỗn hợp matcha để làm nhẹ bột, sau đó fold ngược toàn bộ vào phần meringue còn lại bằng spatula với động tác vét đáy tô.',
      'Dàn bột thành lớp đều trên khay, gõ nhẹ 1-2 lần rồi nướng khoảng 15-18 phút. Mặt bánh chín nhưng vẫn mềm khi chạm nhẹ là đạt.',
      'Lấy bánh ra khỏi khay, phủ một tờ giấy nến mới rồi lật bánh. Khi bánh còn ấm, cuộn lỏng bánh cùng giấy để tạo nếp và để nguội hoàn toàn.',
      'Đánh whipping cream đến bông vừa, trải lên cốt bánh đã nguội rồi cuộn chặt dần. Bọc bánh và làm lạnh 1-2 giờ trước khi cắt để lát bánh ổn định.',
    ],
    notes: [
      'Matcha chất lượng tốt cho màu xanh tự nhiên và ít chát hơn. Không tăng quá nhiều matcha vì bột trà hút ẩm và có thể làm cốt bánh khô.',
      'Meringue quá cứng sẽ khó fold và dễ tạo các mảng trắng trong bột; quá mềm lại không đủ sức nâng cốt bánh.',
      'Không phết kem khi cốt bánh còn ấm vì kem sẽ chảy. Có thể thêm đậu đỏ ngọt hoặc dâu tây vào phần nhân để tạo biến thể.',
    ],
  },
  {
    title: 'Red Velvet Cupcake',
    description:
      'Red velvet cupcake có phần cốt mềm ẩm, vị cacao nhẹ và độ chua dịu từ buttermilk, đi cùng cream cheese frosting béo mặn vừa phải. Kích thước nhỏ giúp bánh phù hợp cho tiệc, hộp quà hoặc trang trí theo nhiều chủ đề.',
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
      'Làm nóng lò ở 170°C và đặt giấy cupcake vào khay. Rây bột mì và cacao cùng nhau để loại bỏ vón cục và giúp màu bánh đồng đều hơn.',
      'Đánh trứng với đường ở tốc độ vừa đến khi đường tan bớt, sau đó thêm buttermilk và khuấy đến khi hỗn hợp đồng nhất.',
      'Cho nguyên liệu khô vào hỗn hợp ướt theo 2 lần, dùng spatula trộn vừa hết bột. Nếu sử dụng màu đỏ thực phẩm, thêm từng ít một đến khi đạt màu mong muốn.',
      'Chia bột vào từng cup khoảng 2/3 chiều cao để chừa không gian cho bánh nở. Gõ nhẹ khay xuống mặt bàn để làm vỡ các bọt khí lớn.',
      'Nướng 18-22 phút, kiểm tra bằng tăm ở giữa bánh. Lấy khay ra, để cupcake nghỉ 5 phút rồi chuyển bánh lên rack để nguội hoàn toàn.',
      'Đánh cream cheese mềm với lượng đường xay phù hợp, sau đó thêm một ít whipping cream hoặc bơ lạt nếu muốn frosting đứng hơn.',
      'Cho frosting vào túi bắt kem và trang trí khi cupcake đã nguội. Có thể rắc vụn bánh đỏ, chocolate trắng hoặc trái cây lên mặt.',
    ],
    notes: [
      'Không đổ bột đầy khuôn vì cupcake sẽ tràn và mất dáng. Mức 2/3 cup thường cho mặt bánh vừa đủ để trang trí frosting.',
      'Cream cheese frosting dễ mềm ở nhiệt độ cao nên bánh đã trang trí cần được bảo quản mát, đặc biệt trong thời tiết nóng.',
      'Buttermilk có thể thay bằng sữa tươi pha một ít nước chanh và để nghỉ 10 phút trước khi dùng.',
    ],
  },
  {
    title: 'Lemon Tart',
    description:
      'Lemon tart kết hợp lớp vỏ tart nhiều bơ, giòn xốp với nhân lemon curd chua ngọt và thơm vỏ chanh. Công thức tập trung vào việc giữ đế bánh khô giòn trong khi phần nhân vẫn mượt, bóng và có độ sánh vừa đủ để cắt thành lát sạch.',
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
      'Cắt bơ lạnh thành khối nhỏ rồi bóp hoặc dùng máy trộn cùng bột mì đến khi hỗn hợp giống vụn bánh mì. Thêm một phần đường và lượng trứng vừa đủ để bột kết dính.',
      'Ép bột thành đĩa dẹt, bọc kín và làm lạnh ít nhất 30 phút. Cán bột dày khoảng 3mm rồi đặt vào khuôn tart, ấn sát phần góc và cắt bỏ mép thừa.',
      'Dùng nĩa châm nhẹ đáy bánh, phủ giấy nến và hạt nướng mù. Nướng ở 175°C khoảng 15 phút, bỏ hạt rồi nướng thêm đến khi đế vàng nhạt và khô mặt.',
      'Cho trứng, phần đường còn lại, nước cốt chanh và vỏ chanh vào nồi. Khuấy liên tục ở lửa nhỏ để trứng chín từ từ mà không bị vón.',
      'Khi lemon curd đặc đủ để bám mặt sau thìa, nhấc khỏi bếp và có thể thêm một ít bơ lạnh để nhân bóng mượt hơn. Lọc qua rây để loại bỏ cặn trứng và vỏ chanh thô.',
      'Để curd nguội bớt rồi đổ lên đế tart đã nguội hoàn toàn. Dàn phẳng mặt và làm lạnh ít nhất 2 giờ để nhân ổn định.',
      'Trang trí bằng lát chanh mỏng, vỏ chanh bào hoặc một ít whipping cream. Cắt bằng dao sắc và lau dao giữa các lần cắt.',
    ],
    notes: [
      'Không nhào bột tart quá lâu vì nhiệt từ tay làm bơ tan và gluten phát triển, khiến vỏ bánh cứng thay vì giòn xốp.',
      'Lemon curd cần khuấy liên tục trên lửa nhỏ. Nhiệt quá cao dễ làm trứng vón thành hạt và nhân có mùi trứng rõ.',
      'Đế tart phải nguội và khô trước khi thêm nhân. Nếu cần giữ lâu, có thể quét một lớp chocolate trắng thật mỏng để hạn chế đế hút ẩm.',
    ],
  },
  {
    title: 'Basque Burnt Cheesecake',
    description:
      'Basque burnt cheesecake nổi bật với mặt bánh cháy nâu đậm, hương caramel rõ và phần giữa mềm mịn gần giống custard. Bánh được nướng ở nhiệt độ cao trong thời gian tương đối ngắn để tạo tương phản giữa lớp ngoài đậm màu và phần ruột béo ẩm.',
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
      'Làm nóng lò ở 220°C. Lót 2 lớp giấy nến vào khuôn sao cho giấy cao hơn thành khuôn khoảng 5cm và để các nếp giấy tự nhiên tạo hình đặc trưng của Basque cheesecake.',
      'Để cream cheese về nhiệt độ phòng, đánh ở tốc độ thấp cùng đường đến khi mịn. Vét kỹ đáy và thành tô để không còn các cục cream cheese.',
      'Thêm từng quả trứng, chỉ trộn đến khi mỗi quả vừa hòa quyện rồi mới thêm quả tiếp theo. Tránh đánh nhiều không khí vì bánh có thể nở mạnh rồi xẹp sâu.',
      'Rót whipping cream vào từ từ, khuấy nhẹ. Rây bột mì trực tiếp vào tô và trộn đến khi hỗn hợp mịn, có thể lọc qua rây nếu muốn kết cấu thật mượt.',
      'Đổ hỗn hợp vào khuôn, gõ nhẹ để loại bọt khí lớn. Đặt khuôn ở rãnh giữa lò và nướng khoảng 25-32 phút tùy lò.',
      'Lấy bánh ra khi mặt đã nâu sẫm nhưng phần giữa vẫn rung rõ khi lắc nhẹ. Bánh sẽ tiếp tục chín nhờ nhiệt dư và đặc hơn khi nguội.',
      'Để bánh nguội hoàn toàn ở nhiệt độ phòng rồi làm lạnh ít nhất 4 giờ. Đưa bánh ra ngoài 15-20 phút trước khi ăn để phần ruột mềm và vị cream cheese rõ hơn.',
    ],
    notes: [
      'Màu mặt bánh đậm là đặc trưng, nhưng nếu xuất hiện mùi khét rõ thì nhiệt lò có thể quá cao. Có thể hạ 10°C ở lần nướng sau.',
      'Không cần nướng đến khi giữa bánh cứng. Phần tâm còn rung là yếu tố giúp bánh có kết cấu custard sau khi nguội.',
      'Cream cheese, trứng và whipping cream nên gần nhiệt độ phòng để hỗn hợp hòa quyện dễ hơn và hạn chế vón.',
    ],
  },
  {
    title: 'Panna Cotta Vanilla',
    description:
      'Panna cotta vanilla là món tráng miệng lạnh có kết cấu mềm rung, mượt và tan nhanh trong miệng. Whipping cream kết hợp sữa giúp món ăn đủ béo nhưng không quá nặng, còn vanilla tạo hương thơm dịu phù hợp dùng cùng sốt trái cây chua nhẹ.',
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
      'Ngâm gelatin trong nước lạnh theo đúng tỉ lệ trên bao bì và để nở khoảng 10 phút. Nếu dùng gelatin lá, vắt nhẹ nước trước khi cho vào hỗn hợp sữa.',
      'Cho whipping cream, sữa tươi và đường vào nồi. Đun lửa nhỏ, khuấy đều đến khi đường tan và hỗn hợp nóng khoảng 70-80°C, không cần đun sôi.',
      'Nhấc nồi khỏi bếp, cho gelatin đã ngâm cùng vanilla vào. Khuấy nhẹ đến khi gelatin tan hoàn toàn và không còn cặn dưới đáy nồi.',
      'Lọc hỗn hợp qua rây mịn để loại bỏ bọt và cặn nhỏ. Để nguội 5-10 phút, thỉnh thoảng khuấy để tránh tạo màng trên bề mặt.',
      'Rót panna cotta vào các cốc thủy tinh với lượng bằng nhau. Nếu có bọt nổi trên mặt, dùng thìa nhỏ hớt bỏ để thành phẩm mịn hơn.',
      'Làm lạnh ít nhất 4 giờ, tốt nhất 6 giờ. Khi panna cotta đã đông mềm, phủ sốt trái cây hoặc trái cây tươi ngay trước khi dùng.',
      'Nếu muốn úp panna cotta ra đĩa, nhúng nhanh đáy khuôn vào nước ấm vài giây rồi lách nhẹ mép trước khi úp.',
    ],
    notes: [
      'Không đun sôi mạnh sau khi thêm gelatin vì nhiệt quá cao kéo dài có thể làm giảm khả năng tạo gel.',
      'Dùng quá nhiều gelatin sẽ làm panna cotta cứng như thạch; kết cấu đúng nên mềm và rung nhẹ khi nghiêng cốc.',
      'Có thể thay vanilla bằng cà phê, matcha hoặc vỏ cam. Panna cotta bảo quản kín trong tủ lạnh khoảng 2-3 ngày.',
    ],
  },
  {
    title: 'Cookies Chocolate Chip',
    description:
      'Chocolate chip cookie có phần rìa vàng giòn nhẹ, tâm bánh mềm và nhiều chocolate tan chảy. Việc dùng kết hợp đường nâu và đường trắng giúp cân bằng độ ẩm, độ giòn và hương caramel, trong khi thời gian làm lạnh bột giúp cookie giữ hình tốt hơn khi nướng.',
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
      'Để bơ mềm ở nhiệt độ phòng rồi đánh với đường nâu và đường trắng khoảng 2-3 phút đến khi hỗn hợp sáng màu và mịn hơn, nhưng không cần đánh bông quá nhiều.',
      'Thêm trứng vào, đánh tốc độ thấp đến khi hòa quyện. Vét thành tô để phần bơ và đường không bám lại thành từng mảng.',
      'Rây bột mì vào tô, dùng spatula trộn đến khi còn một ít vệt bột khô. Không trộn quá lâu sau khi bột đã hút ẩm.',
      'Cho chocolate chip vào và fold đến khi phân bố đều. Bọc kín bột rồi làm lạnh tối thiểu 30 phút, hoặc 8-12 giờ để hương vị sâu hơn.',
      'Làm nóng lò ở 175°C. Múc bột thành các viên bằng nhau, đặt cách nhau ít nhất 5cm trên khay có lót giấy nến.',
      'Nướng 10-13 phút đến khi rìa bánh vàng nhưng phần giữa vẫn còn mềm. Để cookie trên khay 5 phút vì bánh tiếp tục chín nhờ nhiệt dư.',
      'Chuyển cookie sang rack và để nguội. Có thể rắc một ít muối biển mịn lên mặt khi bánh còn ấm để làm nổi bật vị chocolate.',
    ],
    notes: [
      'Bột cookie càng lạnh thì bánh càng ít chảy. Nếu bếp nóng và bột mềm nhanh, có thể đặt khay bột đã chia viên vào tủ lạnh thêm 10 phút trước khi nướng.',
      'Không nướng đến khi toàn bộ mặt cookie cứng vì bánh sẽ khô sau khi nguội. Tâm bánh hơi mềm khi lấy khỏi lò là trạng thái phù hợp.',
      'Có thể thay một phần chocolate chip bằng chocolate chunk hoặc hạt rang. Bảo quản cookie kín 3-4 ngày ở nhiệt độ phòng.',
    ],
  },
];

const flavors: Flavor[] = [
  {
    name: 'Dâu Tây',
    tag: 'strawberry',
    ingredient: 'Dâu tây tươi',
    amount: 120,
    unit: 'g',
    profile: 'Dâu tạo vị chua ngọt tươi, màu hồng tự nhiên và mùi trái cây nhẹ.',
    tip: 'Nếu dâu có nhiều nước, nên nấu hoặc xay rồi cô nhẹ trước khi trộn để hạn chế làm hỗn hợp bị loãng.',
  },
  {
    name: 'Xoài',
    tag: 'mango',
    ingredient: 'Xoài chín',
    amount: 130,
    unit: 'g',
    profile: 'Xoài chín mang vị ngọt nhiệt đới, mùi thơm rõ và tạo màu vàng đẹp mắt.',
    tip: 'Nên chọn xoài chín thơm nhưng thịt chắc, tránh loại quá xơ hoặc quá nhiều nước.',
  },
  {
    name: 'Việt Quất',
    tag: 'blueberry',
    ingredient: 'Việt quất',
    amount: 120,
    unit: 'g',
    profile: 'Việt quất cho vị chua nhẹ, màu tím xanh và tạo điểm nhấn trái cây trong món bánh.',
    tip: 'Có thể dùng việt quất đông lạnh nhưng nên rã đông, để ráo và giảm bớt lượng nước trước khi sử dụng.',
  },
  {
    name: 'Pistachio',
    tag: 'pistachio',
    ingredient: 'Hạt pistachio rang',
    amount: 80,
    unit: 'g',
    profile: 'Pistachio có vị béo bùi, thơm hạt rang và giúp món bánh có hậu vị đậm hơn.',
    tip: 'Xay pistachio vừa đủ mịn và tránh xay quá lâu khiến dầu trong hạt tách ra làm hỗn hợp nặng.',
  },
  {
    name: 'Dừa',
    tag: 'coconut',
    ingredient: 'Cơm dừa non',
    amount: 100,
    unit: 'g',
    profile: 'Dừa mang vị béo thanh, mùi thơm nhiệt đới và kết hợp tốt với kem sữa hoặc trái cây.',
    tip: 'Cơm dừa nên để ráo trước khi dùng; nếu muốn hương đậm hơn có thể rang nhẹ một phần dừa để trang trí.',
  },
  {
    name: 'Caramel',
    tag: 'caramel',
    ingredient: 'Sốt caramel',
    amount: 90,
    unit: 'g',
    profile: 'Caramel tạo vị ngọt sâu, hương đường cháy và màu nâu vàng hấp dẫn.',
    tip: 'Nên để caramel nguội về mức ấm trước khi trộn vào kem hoặc bột để tránh làm thay đổi kết cấu.',
  },
  {
    name: 'Matcha',
    tag: 'matcha',
    ingredient: 'Bột matcha',
    amount: 10,
    unit: 'g',
    profile: 'Matcha tạo màu xanh, vị trà thanh và hậu đắng nhẹ giúp cân bằng độ ngọt.',
    tip: 'Rây matcha trước khi dùng và tránh cho quá nhiều vì bột trà hút ẩm, dễ làm thành phẩm khô hoặc đắng.',
  },
  {
    name: 'Chocolate',
    tag: 'chocolate',
    ingredient: 'Chocolate đen',
    amount: 100,
    unit: 'g',
    profile: 'Chocolate đen tạo vị cacao đậm, béo vừa và phù hợp với cả món nướng lẫn món lạnh.',
    tip: 'Chocolate nên được làm tan nhẹ và để nguội bớt trước khi phối với trứng, kem hoặc gelatin.',
  },
  {
    name: 'Cà Phê',
    tag: 'coffee',
    ingredient: 'Cà phê espresso',
    amount: 60,
    unit: 'ml',
    profile: 'Espresso mang hương rang rõ, vị đắng nhẹ và giúp món ngọt có chiều sâu hơn.',
    tip: 'Dùng espresso đậm và để nguội hoàn toàn trước khi trộn để không làm chảy kem hoặc ảnh hưởng meringue.',
  },
  {
    name: 'Chanh Vàng',
    tag: 'lemon',
    ingredient: 'Nước cốt chanh vàng',
    amount: 50,
    unit: 'ml',
    profile: 'Chanh vàng tạo vị chua sáng, mùi citrus tươi và giúp giảm cảm giác ngấy của kem bơ hoặc sữa.',
    tip: 'Có thể thêm một ít vỏ chanh bào để tăng hương nhưng chỉ lấy phần vỏ vàng, tránh phần cùi trắng gây đắng.',
  },
  {
    name: 'Cam',
    tag: 'orange',
    ingredient: 'Nước cam vàng',
    amount: 70,
    unit: 'ml',
    profile: 'Cam mang vị chua ngọt dịu, hương citrus mềm và màu vàng cam tự nhiên.',
    tip: 'Nếu nước cam quá loãng, có thể cô nhẹ để tăng mùi và giảm lượng nước đưa vào công thức.',
  },
  {
    name: 'Phúc Bồn Tử',
    tag: 'raspberry',
    ingredient: 'Phúc bồn tử',
    amount: 120,
    unit: 'g',
    profile: 'Phúc bồn tử có vị chua rõ, màu đỏ hồng đẹp và tạo tương phản tốt với kem béo.',
    tip: 'Nên lọc puree phúc bồn tử qua rây nếu muốn loại bỏ hạt và có phần kem hoặc nhân mịn hơn.',
  },
  {
    name: 'Đào',
    tag: 'peach',
    ingredient: 'Đào vàng',
    amount: 130,
    unit: 'g',
    profile: 'Đào có mùi thơm dịu, vị ngọt thanh và phù hợp với các món bánh có kết cấu nhẹ.',
    tip: 'Đào tươi nên được thấm khô sau khi cắt; đào hộp cần để ráo syrup trước khi đưa vào công thức.',
  },
  {
    name: 'Vanilla',
    tag: 'vanilla',
    ingredient: 'Chiết xuất vanilla',
    amount: 5,
    unit: 'ml',
    profile: 'Vanilla có hương thơm ấm, nhẹ và giúp làm nổi bật vị sữa, bơ cùng các nguyên liệu nền.',
    tip: 'Không cần dùng quá nhiều vanilla; lượng nhỏ nhưng chất lượng tốt thường cho hương sạch và tự nhiên hơn.',
  },
  {
    name: 'Khoai Lang Tím',
    tag: 'purple-sweet-potato',
    ingredient: 'Khoai lang tím nghiền',
    amount: 130,
    unit: 'g',
    profile: 'Khoai lang tím tạo màu tím tự nhiên, vị ngọt bùi và giúp thành phẩm có cảm giác no, béo nhẹ.',
    tip: 'Khoai nên được hấp chín rồi nghiền thật mịn; nếu quá khô có thể thêm một ít sữa để dễ phối trộn.',
  },
  {
    name: 'Hạt Dẻ',
    tag: 'chestnut',
    ingredient: 'Hạt dẻ nghiền',
    amount: 100,
    unit: 'g',
    profile: 'Hạt dẻ tạo vị bùi, ngọt nhẹ và hương hạt ấm phù hợp với các món bánh mùa thu hoặc mùa lạnh.',
    tip: 'Hạt dẻ nghiền nên thật mịn; có thể thêm một ít sữa hoặc kem nếu hỗn hợp quá đặc khi trộn.',
  },
  {
    name: 'Earl Grey',
    tag: 'earl-grey',
    ingredient: 'Trà Earl Grey',
    amount: 8,
    unit: 'g',
    profile: 'Earl Grey có hương bergamot thanh, tạo cảm giác thơm nhẹ và sang hơn cho món bánh sữa hoặc bơ.',
    tip: 'Nên ngâm trà trong phần sữa hoặc kem ấm rồi lọc bỏ lá để lấy hương mà không tạo cảm giác lợn cợn.',
  },
  {
    name: 'Hạt Phỉ',
    tag: 'hazelnut',
    ingredient: 'Hạt phỉ rang',
    amount: 90,
    unit: 'g',
    profile: 'Hạt phỉ có vị béo đậm, hương rang rõ và kết hợp đặc biệt tốt với chocolate, caramel hoặc cà phê.',
    tip: 'Rang hạt phỉ trước khi xay giúp mùi thơm rõ hơn; để hạt nguội hoàn toàn trước khi phối với kem.',
  },
];

const families: Family[] = [
  {
    name: 'Mousse',
    description:
      'Mousse có kết cấu nhẹ, mịn và tan nhanh trong miệng. Phần kem được ổn định vừa đủ bằng gelatin để giữ dáng nhưng vẫn mềm khi ăn.',
    tags: ['mousse', 'cold-dessert'],
    ingredients: [['Whipping cream', 250, 'ml'], ['Gelatin', 7, 'g'], ['Đường', 60, 'g']],
    tools: [['Máy đánh trứng', 1], ['Tủ lạnh', 1], ['Khuôn mousse 16cm', 1]],
    portion: 6,
  },
  {
    name: 'Macaron',
    description:
      'Macaron kiểu Pháp có lớp vỏ mỏng giòn, ruột hơi dẻo và phần nhân ẩm mềm. Công thức cần kiểm soát meringue, kỹ thuật macaronage và thời gian hong mặt.',
    tags: ['macaron', 'french'],
    ingredients: [['Bột hạnh nhân', 120, 'g'], ['Đường bột', 120, 'g'], ['Lòng trắng trứng', 90, 'g'], ['Đường cát', 90, 'g']],
    tools: [['Lò nướng', 1], ['Túi bắt kem', 1], ['Tấm silicon', 1], ['Máy đánh trứng', 1]],
    portion: 16,
  },
  {
    name: 'Chiffon Cake',
    description:
      'Chiffon cake nhẹ, mềm và xốp nhờ meringue, trong khi dầu thực vật giữ phần ruột ẩm ngay cả khi bánh đã nguội. Bánh phù hợp dùng riêng hoặc ăn cùng kem tươi.',
    tags: ['chiffon', 'cake'],
    ingredients: [['Bột mì', 120, 'g'], ['Trứng gà', 5, 'quả'], ['Dầu thực vật', 55, 'ml'], ['Đường', 100, 'g']],
    tools: [['Lò nướng', 1], ['Khuôn chiffon', 1], ['Máy đánh trứng', 1]],
    portion: 8,
  },
  {
    name: 'Pudding',
    description:
      'Pudding lạnh có kết cấu mềm, mượt và vị sữa dịu. Gelatin chỉ được dùng vừa đủ để món ăn giữ hình nhưng vẫn mềm khi xúc bằng thìa.',
    tags: ['pudding', 'cold-dessert'],
    ingredients: [['Sữa tươi', 400, 'ml'], ['Đường', 70, 'g'], ['Gelatin', 6, 'g'], ['Whipping cream', 100, 'ml']],
    tools: [['Nồi nhỏ', 1], ['Tủ lạnh', 1], ['Cốc pudding', 6]],
    portion: 6,
  },
  {
    name: 'Cupcake',
    description:
      'Cupcake có phần cốt mềm ẩm, kích thước nhỏ gọn và dễ trang trí. Công thức dùng phương pháp đánh bơ với đường để tạo cấu trúc nhẹ và hương bơ rõ.',
    tags: ['cupcake', 'party'],
    ingredients: [['Bột mì', 180, 'g'], ['Trứng gà', 2, 'quả'], ['Bơ lạt', 100, 'g'], ['Đường', 130, 'g'], ['Sữa tươi', 90, 'ml']],
    tools: [['Lò nướng', 1], ['Khay cupcake', 1], ['Máy đánh trứng', 1], ['Túi bắt kem', 1]],
    portion: 12,
  },
];

function buildDescription(family: Family, flavor: Flavor): string {
  return `${family.description} Phiên bản ${flavor.name.toLowerCase()} sử dụng ${flavor.ingredient.toLowerCase()} để tạo hương vị chính. ${flavor.profile} Công thức được thiết kế đủ chi tiết để có thể dùng làm dữ liệu hiển thị, tìm kiếm theo nguyên liệu, hương vị và kỹ thuật làm bánh.`;
}

function buildFamilySteps(familyName: string, flavor: Flavor): string[] {
  const flavorAmount = `${flavor.amount}${flavor.unit}`;

  switch (familyName) {
    case 'Mousse':
      return [
        `Cân đầy đủ nguyên liệu và chuẩn bị ${flavorAmount} ${flavor.ingredient.toLowerCase()}. Nếu nguyên liệu ở dạng trái cây hoặc hạt, xay hoặc xử lý trước để phần tạo vị đủ mịn khi trộn vào mousse.`,
        'Ngâm gelatin với nước lạnh khoảng 10 phút để gelatin nở hoàn toàn. Sau đó làm tan gelatin bằng cách thủy hoặc vi sóng ngắn, chỉ làm nóng đến khi vừa tan và không đun sôi.',
        `Trộn ${flavor.ingredient.toLowerCase()} với đường và một phần nhỏ whipping cream hoặc sữa nếu cần. Khuấy đến khi hỗn hợp tạo vị đồng nhất rồi để nguội về mức ấm.`,
        'Đánh whipping cream lạnh ở tốc độ trung bình đến bông mềm, khi nhấc que đánh lên kem tạo chóp cong. Không đánh bông cứng vì mousse sẽ khó fold và kém mịn.',
        'Trộn gelatin đã tan vào hỗn hợp tạo vị. Lấy khoảng một phần ba whipping cream trộn trước để làm nhẹ hỗn hợp, sau đó fold phần kem còn lại theo hai lần.',
        'Rót mousse vào khuôn hoặc cốc, gõ nhẹ để loại các túi khí lớn rồi làm lạnh ít nhất 4-6 giờ để gelatin ổn định hoàn toàn.',
        `Trang trí bằng một lượng nhỏ ${flavor.ingredient.toLowerCase()} hoặc topping phù hợp ngay trước khi dùng. Giữ mousse lạnh cho đến sát thời điểm phục vụ để kết cấu ổn định.`,
      ];
    case 'Macaron':
      return [
        'Rây bột hạnh nhân và đường bột ít nhất một lần. Loại bỏ các hạt quá to để bề mặt macaron sau khi nướng mịn và ít sần.',
        'Đánh lòng trắng trứng ở tốc độ trung bình đến khi có bọt mịn, thêm đường cát từ từ và tiếp tục đánh đến meringue bóng, đứng chóp nhưng đầu chóp vẫn hơi cong.',
        'Cho hỗn hợp bột hạnh nhân vào meringue theo 2 lần. Dùng spatula thực hiện macaronage đến khi bột chảy thành dải liên tục và vệt bột trên mặt tự hòa lại sau khoảng 10-15 giây.',
        'Cho bột vào túi bắt kem, bắt các vòng tròn bằng nhau trên tấm silicon. Gõ khay xuống bàn vài lần để đẩy bọt khí lớn lên mặt rồi dùng tăm chọc các bọt còn sót.',
        'Hong mặt macaron đến khi chạm nhẹ không dính tay. Nướng ở khoảng 145-155°C tùy lò trong 13-16 phút, sau đó để vỏ nguội hoàn toàn trước khi gỡ khỏi tấm nướng.',
        `Chuẩn bị phần nhân từ ${flavorAmount} ${flavor.ingredient.toLowerCase()} bằng cách phối với ganache, buttercream hoặc cream cheese tùy độ ẩm của nguyên liệu. Nhân cần đủ đặc để không chảy khỏi vỏ.`,
        'Kẹp hai vỏ có kích thước tương đương với lượng nhân vừa phải. Bảo quản macaron kín trong tủ lạnh 12-24 giờ cho quá trình maturation rồi đưa ra ngoài 10 phút trước khi ăn.',
      ];
    case 'Chiffon Cake':
      return [
        'Làm nóng lò ở 165°C. Tách lòng đỏ và lòng trắng trứng vào hai tô riêng, đảm bảo tô lòng trắng sạch và không dính dầu để meringue đạt thể tích tốt.',
        `Trộn lòng đỏ với dầu thực vật rồi thêm ${flavorAmount} ${flavor.ingredient.toLowerCase()}. Nếu nguyên liệu đặc, khuấy cùng một ít sữa trước để hỗn hợp phân tán đều hơn.`,
        'Rây bột mì vào hỗn hợp lòng đỏ và khuấy vừa đủ đến khi không còn bột khô. Không khuấy quá lâu để hạn chế gluten làm cốt bánh bị dai.',
        'Đánh lòng trắng đến bọt mịn, thêm đường thành 3 lần và tiếp tục đánh đến chóp mềm-vừa. Meringue nên bóng, mịn và giữ được hình khi nhấc que đánh.',
        'Trộn một phần meringue vào hỗn hợp lòng đỏ để làm nhẹ, sau đó fold ngược toàn bộ vào phần meringue còn lại bằng thao tác vét từ đáy lên trên.',
        'Đổ bột vào khuôn chiffon không chống dính, dùng que đảo nhẹ vài vòng để phá bọt khí lớn rồi nướng 40-50 phút tùy kích thước khuôn.',
        'Ngay khi lấy khỏi lò, úp ngược khuôn trên chân khuôn hoặc cổ chai và để nguội hoàn toàn. Dùng dao mỏng tách thành khuôn rồi mới lấy bánh ra và cắt.',
      ];
    case 'Pudding':
      return [
        'Ngâm gelatin trong nước lạnh khoảng 10 phút. Chuẩn bị sẵn cốc pudding sạch và đặt trên khay phẳng để có thể di chuyển vào tủ lạnh dễ dàng.',
        `Xử lý ${flavorAmount} ${flavor.ingredient.toLowerCase()} thành puree, hỗn hợp ngâm hoặc dạng mịn phù hợp. Nếu có xơ hoặc hạt nhỏ, lọc qua rây để pudding mượt hơn.`,
        'Cho sữa tươi, whipping cream và đường vào nồi. Đun lửa nhỏ đến khi hỗn hợp nóng và đường tan hoàn toàn, tránh để sữa sôi mạnh.',
        `Cho phần ${flavor.ingredient.toLowerCase()} đã chuẩn bị vào hỗn hợp sữa, khuấy đều và nếm lại độ ngọt. Nhấc nồi khỏi bếp trước khi thêm gelatin.`,
        'Cho gelatin đã nở vào nồi và khuấy đến tan hoàn toàn. Lọc hỗn hợp qua rây một lần nữa nếu cần để loại bọt hoặc cặn nhỏ.',
        'Rót pudding vào cốc với lượng bằng nhau, để nguội khoảng 10 phút rồi làm lạnh ít nhất 4 giờ đến khi đông mềm.',
        'Trang trí sát thời điểm dùng để topping không ra nước lên bề mặt. Pudding nên được giữ lạnh và dùng trong 2-3 ngày để hương vị tươi nhất.',
      ];
    case 'Cupcake':
      return [
        'Làm nóng lò ở 170°C và đặt giấy cupcake vào khay. Đưa bơ và trứng về nhiệt độ phòng để hỗn hợp dễ nhũ hóa và không bị tách.',
        'Đánh bơ mềm với đường khoảng 3-4 phút đến khi sáng màu và xốp hơn. Thêm từng quả trứng, đánh vừa hòa quyện rồi vét thành tô trước khi thêm phần tiếp theo.',
        `Chuẩn bị ${flavorAmount} ${flavor.ingredient.toLowerCase()}. Trộn nguyên liệu tạo vị vào hỗn hợp bơ-trứng; nếu là chất lỏng, thêm từ từ xen kẽ với nguyên liệu khô để bột không bị tách.`,
        'Rây bột mì vào tô theo 2 lần, xen kẽ với sữa tươi. Dùng spatula hoặc máy ở tốc độ thấp trộn vừa hết bột, tránh đánh quá lâu sau khi cho bột mì.',
        'Chia bột vào từng cup khoảng 2/3 chiều cao. Gõ nhẹ khay xuống bàn để làm vỡ bọt khí lớn và giúp mặt bột phẳng hơn.',
        'Nướng 18-22 phút đến khi mặt bánh đàn hồi nhẹ và tăm thử chỉ còn vài vụn nhỏ. Để bánh trong khay 5 phút rồi chuyển lên rack cho nguội hoàn toàn.',
        `Chuẩn bị frosting phù hợp với vị ${flavor.name.toLowerCase()}, bắt kem lên cupcake đã nguội và trang trí bằng một lượng nhỏ ${flavor.ingredient.toLowerCase()} hoặc topping tương ứng.`,
      ];
    default:
      return [];
  }
}

function buildFamilyNotes(familyName: string, flavor: Flavor): string[] {
  const commonFlavorNote = flavor.tip;

  switch (familyName) {
    case 'Mousse':
      return [
        commonFlavorNote,
        'Whipping cream phải đủ lạnh để đánh bông ổn định. Chỉ đánh đến bông mềm-vừa vì mousse còn trải qua bước fold với hỗn hợp tạo vị.',
        'Gelatin quá nóng sẽ làm kem chảy, còn gelatin bắt đầu đông sẽ tạo sợi hoặc hạt. Nên phối khi gelatin còn ấm nhẹ và hỗn hợp tạo vị không quá lạnh.',
        'Mousse cần đủ thời gian làm lạnh trước khi tháo khuôn. Nếu làm bánh nhiều tầng, nên chờ từng lớp se mặt trước khi thêm lớp tiếp theo.',
      ];
    case 'Macaron':
      return [
        commonFlavorNote,
        'Độ ẩm không khí ảnh hưởng mạnh đến thời gian hong mặt. Chỉ đưa macaron vào lò khi bề mặt đã tạo màng và chạm nhẹ không dính tay.',
        'Không nên đưa nguyên liệu tạo vị quá nhiều nước trực tiếp vào phần vỏ macaron. Hương vị chính nên tập trung ở phần nhân để giữ cấu trúc vỏ ổn định.',
        'Macaron thường ngon hơn sau 12-24 giờ maturation trong hộp kín vì độ ẩm từ nhân thấm nhẹ vào vỏ, tạo ruột dẻo đặc trưng.',
      ];
    case 'Chiffon Cake':
      return [
        commonFlavorNote,
        'Không chống dính thành khuôn chiffon vì bột cần bám vào khuôn để leo cao trong lúc nướng. Chỉ tách khuôn sau khi bánh nguội hoàn toàn.',
        'Meringue ở mức chóp mềm-vừa giúp cốt bánh nở tốt nhưng vẫn dễ fold. Đánh quá cứng làm khó hòa trộn và tăng nguy cơ bánh có lỗ khí lớn.',
        'Úp ngược khuôn ngay sau khi nướng để hạn chế bánh xẹp khi cấu trúc bên trong còn nóng và mềm.',
      ];
    case 'Pudding':
      return [
        commonFlavorNote,
        'Không đun sôi gelatin lâu. Hỗn hợp chỉ cần đủ nóng để gelatin tan hoàn toàn rồi nên được làm nguội dần trước khi đưa vào tủ lạnh.',
        'Nếu muốn pudding mềm rung, không tăng gelatin tùy ý. Quá nhiều gelatin làm món ăn cứng, giảm cảm giác mượt khi ăn.',
        'Các topping nhiều nước nên thêm ngay trước khi dùng để hạn chế nước tách ra và làm bề mặt pudding bị loãng.',
      ];
    case 'Cupcake':
      return [
        commonFlavorNote,
        'Bơ, trứng và sữa nên gần cùng nhiệt độ để hỗn hợp nhũ hóa tốt. Nếu hỗn hợp trông tách hạt sau khi thêm trứng, có thể thêm một thìa bột mì để ổn định.',
        'Chỉ đổ bột khoảng 2/3 cup để bánh có không gian nở mà không tràn khỏi giấy. Các cup nên có lượng bột tương đương để chín cùng lúc.',
        'Cupcake phải nguội hoàn toàn trước khi bắt kem; nhiệt còn lại trong cốt bánh sẽ làm buttercream hoặc cream cheese frosting chảy.',
      ];
    default:
      return [commonFlavorNote];
  }
}

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
    await trx('recipe_steps').del();
    await trx('recipes').del();
    await trx('images').del();
    await trx('users').del();

    const userRows = await trx('users')
      .insert(users)
      .returning(['id', 'email', 'displayname', 'role']);

    const recipes: RecipeSeed[] = [...baseRecipes];

    for (const flavor of flavors) {
      for (const family of families) {
        recipes.push({
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

    if (recipes.length !== 100) {
      throw new Error(`Expected exactly 100 recipes, received ${recipes.length}`);
    }

    const imageRows = await trx('images')
      .insert(
        recipes.map((recipe, index) => ({
          display_name: `${recipe.title} cover`,
          original_name: `recipe-${index + 1}.jpg`,
          url:
            `https://picsum.photos/seed/` +
            `bakers-recipe-${index + 1}/800/600`,
          content_type: 'image/jpeg',
        })),
      )
      .returning(['id']);

    for (let index = 0; index < recipes.length; index += 1) {
      const recipe = recipes[index];
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
          created_at: trx.raw(
            `NOW() - (? * INTERVAL '1 day')`,
            [index],
          ),
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
