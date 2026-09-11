import type { Knex } from 'knex';

const authors = [
  'Nguyễn Minh Anh',
  'Trần Bảo Ngọc',
  'Lê Hoàng Nam',
  'Phạm Thảo Vy',
  'Đặng Quốc Huy',
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

export async function seed(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    await trx('recipe_tags').del();
    await trx('recipe_notes').del();
    await trx('recipe_tools').del();
    await trx('recipe_ingredients').del();
    await trx('steps').del();
    await trx('recipes').del();
    await trx('images').del();
    await trx('authors').del();

    const authorRows = await trx('authors')
      .insert(authors.map((display_name) => ({ display_name })))
      .returning(['id', 'display_name']);

    const recipes = [...baseRecipes];

    for (const [flavorName, flavorTag, flavorIngredient] of flavors) {
      for (const family of families) {
        recipes.push({
          title: `${family.name} ${flavorName}`,
          description: `${family.description} Phiên bản ${flavorName.toLowerCase()} thơm rõ vị và dễ ăn.`,
          portion: family.name === 'Macaron' ? 16 : family.name === 'Cupcake' ? 12 : 6,
          tags: [...family.tags, flavorTag, 'homemade'],
          ingredients: [...family.ingredients, [flavorIngredient, 120, 'g']],
          tools: family.tools,
          steps: familySteps[family.name],
          notes: [
            `Có thể điều chỉnh lượng ${String(flavorIngredient).toLowerCase()} theo khẩu vị.`,
            'Bảo quản kín và dùng sớm để giữ chất lượng tốt nhất.',
          ],
        });
      }
    }

    const imageRows = await trx('images')
      .insert(
        recipes.map((recipe, index) => ({
          display_name: `${recipe.title} cover`,
          original_name: `recipe-${index + 1}.jpg`,
          url: `https://picsum.photos/seed/bakers-recipe-${index + 1}/800/600`,
          content_type: 'image/jpeg',
        })),
      )
      .returning(['id']);

    for (let index = 0; index < recipes.length; index += 1) {
      const recipe = recipes[index];
      const author = authorRows[index % authorRows.length];
      const image = imageRows[index];

      const isPublic = index % 7 !== 0;
      const isSnapshot = isPublic && index % 11 === 0;

      const [createdRecipe] = await trx('recipes')
        .insert({
          cover_img_id: image.id,
          title: recipe.title,
          description: recipe.description,
          portion: recipe.portion,
          author_id: author.id,
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

      await trx('steps').insert(
        recipe.steps.map((description, stepIndex) => ({
          recipe_id: recipeId,
          step_order: stepIndex + 1,
          description,
        })),
      );

      await trx('recipe_notes').insert(
        recipe.notes.map((content) => ({
          recipe_id: recipeId,
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
  });
}
