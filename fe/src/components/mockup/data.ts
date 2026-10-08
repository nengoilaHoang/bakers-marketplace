import type { ArticleCardData } from '@/components/ui/ArticleCard';
import type { CollectionCardData } from '@/components/ui/CollectionCard';
import type { RecipeCardData } from '@/components/ui/RecipeCard';

// Dữ liệu giả cho các trang mockup. Khi làm trang thật, thay bằng dữ liệu từ API.

export const RECIPES: RecipeCardData[] = [
  { id: 'r1', title: 'Bánh su kem', category: 'Bánh ngọt', author: 'Bếp của Mai', duration: '30 phút', level: 'Nâng cao', rating: 4, ratingCount: 18 },
  { id: 'r2', title: 'Bánh mì hoa cúc', category: 'Bánh mì', author: 'An Bakery', duration: '3 giờ', level: 'Trung bình', rating: 5, ratingCount: 42 },
  { id: 'r3', title: 'Cookie socola chip', category: 'Cookie', author: 'Linh Nguyễn', duration: '45 phút', level: 'Dễ', rating: 4, ratingCount: 27 },
  { id: 'r4', title: 'Bông lan trứng muối', category: 'Bánh ngọt', author: 'Bếp của Mai', duration: '1 giờ', level: 'Trung bình', rating: 4, ratingCount: 35 },
  { id: 'r5', title: 'Tiramisu', category: 'Tráng miệng', author: 'Chef Tuấn', duration: '40 phút', level: 'Dễ', rating: 5, ratingCount: 61 },
  { id: 'r6', title: 'Bánh flan caramel', category: 'Tráng miệng', author: 'Hà Phương', duration: '50 phút', level: 'Dễ', rating: 4, ratingCount: 23 },
  { id: 'r7', title: 'Croissant bơ', category: 'Bánh mì', author: 'An Bakery', duration: '12 giờ', level: 'Nâng cao', rating: 5, ratingCount: 16 },
  { id: 'r8', title: 'Bánh chuối nướng', category: 'Bánh ngọt', author: 'Linh Nguyễn', duration: '1 giờ', level: 'Dễ', rating: 4, ratingCount: 30 },
  { id: 'r9', title: 'Tart trứng', category: 'Bánh ngọt', author: 'Chef Tuấn', duration: '55 phút', level: 'Trung bình', rating: 4, ratingCount: 19 },
  { id: 'r10', title: 'Bánh mì sandwich', category: 'Bánh mì', author: 'An Bakery', duration: '2 giờ', level: 'Dễ', rating: 3, ratingCount: 12 },
  { id: 'r11', title: 'Cheesecake Nhật', category: 'Bánh kem', author: 'Hà Phương', duration: '1,5 giờ', level: 'Nâng cao', rating: 5, ratingCount: 48 },
  { id: 'r12', title: 'Bánh cuộn matcha', category: 'Bánh kem', author: 'Bếp của Mai', duration: '1 giờ', level: 'Trung bình', rating: 4, ratingCount: 21 },
];

export const ARTICLES: ArticleCardData[] = [
  {
    id: 'a1',
    title: 'Bí quyết để vỏ bánh su luôn phồng và giòn',
    excerpt:
      'Nhiệt độ lò, độ ẩm của bột và thời điểm mở cửa lò là ba yếu tố quyết định. Cùng tìm hiểu cách kiểm soát từng yếu tố.',
    author: 'Bếp của Mai',
    views: 128,
  },
  {
    id: 'a2',
    title: 'Chọn bơ nào cho bánh ngàn lớp?',
    excerpt:
      'Bơ lạt, bơ lên men hay bơ tấm chuyên dụng — mỗi loại cho kết cấu khác nhau. Bài viết so sánh chi tiết.',
    author: 'An Bakery',
    views: 96,
  },
  {
    id: 'a3',
    title: '5 lỗi thường gặp khi làm bánh mì tại nhà',
    excerpt:
      'Bột không nở, ruột bánh đặc hay vỏ quá cứng? Đây là những nguyên nhân phổ biến và cách khắc phục.',
    author: 'Chef Tuấn',
    views: 214,
  },
];

export const CRAVING_CATEGORIES = [
  'Bánh mì',
  'Bánh ngọt',
  'Tráng miệng',
  'Cookie',
  'Bánh kem',
  'Đồ uống',
];

export const COLLECTIONS: CollectionCardData[] = [
  { id: 'c1', name: 'Tráng miệng', recipeCount: 1, updatedAgo: '6 phút', covers: 1 },
  { id: 'c2', name: 'Bữa sáng', recipeCount: 4, updatedAgo: '1 ngày', covers: 4 },
];

export const LOREM =
  'Bánh su kem có lớp vỏ mỏng, xốp nhẹ ôm trọn phần nhân kem trứng mịn mượt. Món bánh tưởng khó nhưng chỉ cần nắm vững kỹ thuật nấu bột và kiểm soát nhiệt độ lò, bạn hoàn toàn có thể làm thành công ngay trong lần đầu.';
