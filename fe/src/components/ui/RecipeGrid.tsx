import { cn } from '@/lib/cn';

import RecipeCard, { type RecipeCardData, RecipeCardSkeleton } from './RecipeCard';

type RecipeGridProps = Readonly<{
  recipes: RecipeCardData[];
  columns?: 3 | 4;
  // Ẩn nút lưu trên thẻ khi tính năng lưu công thức chưa có.
  savable?: boolean;
  className?: string;
}>;

function gridClasses(columns: 3 | 4, className?: string) {
  return cn(
    'grid gap-x-7.5 gap-y-10 sm:grid-cols-2',
    columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
    className,
  );
}

// Lưới thẻ công thức responsive: 1 → 2 → 3/4 cột.
export default function RecipeGrid({
  recipes,
  columns = 4,
  savable = true,
  className,
}: RecipeGridProps) {
  return (
    <ul className={gridClasses(columns, className)}>
      {recipes.map((recipe) => (
        <li key={recipe.id}>
          <RecipeCard recipe={recipe} savable={savable} className='h-full' />
        </li>
      ))}
    </ul>
  );
}

type RecipeGridSkeletonProps = Readonly<{
  count?: number;
  columns?: 3 | 4;
  className?: string;
}>;

// Lưới giữ chỗ khi đang tải công thức.
export function RecipeGridSkeleton({
  count = 4,
  columns = 4,
  className,
}: RecipeGridSkeletonProps) {
  return (
    <div role='status' aria-label='Đang tải công thức' className={gridClasses(columns, className)}>
      {Array.from({ length: count }, (_, index) => (
        <RecipeCardSkeleton key={index} />
      ))}
    </div>
  );
}
