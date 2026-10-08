import type { RecipeCardData } from '@/components/ui/RecipeCard';
import type { Recipe } from '@/types/recipe';

import { formatDate } from './format';

// Chuyển công thức từ API sang dữ liệu thẻ: chỉ điền những gì API có (không có sao, tác giả, thời gian nấu).
export function toRecipeCardData(recipe: Recipe): RecipeCardData {
  return {
    id: recipe.id,
    title: recipe.title,
    href: `/recipes/${encodeURIComponent(recipe.id)}`,
    description: recipe.description?.trim() || undefined,
    postedAt: formatDate(recipe.createdAt),
    servings: recipe.portion != null ? `${recipe.portion} phần` : undefined,
    level: recipe.isPublic === false ? 'Riêng tư' : undefined,
  };
}
