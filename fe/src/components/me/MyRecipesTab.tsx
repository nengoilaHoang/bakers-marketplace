import Link from 'next/link';

import RecipeGrid from '@/components/recipe/RecipeGrid';
import RecipeGridSkeleton from '@/components/recipe/RecipeGridSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useMyRecipes } from '@/hooks/useMyRecipes';

export default function MyRecipesTab() {
  const { recipes, isLoading, error, retry } = useMyRecipes();

  if (isLoading) return <RecipeGridSkeleton />;

  if (error) {
    return <ErrorState title='Không thể tải công thức của bạn' message={error} onRetry={retry} />;
  }

  if (recipes.length === 0) {
    return (
      <section className='rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center'>
        <h2 className='text-lg font-semibold text-zinc-950'>Bạn chưa có công thức nào</h2>
        <p className='mt-2 text-sm leading-6 text-zinc-600'>
          Hãy tạo công thức đầu tiên để bắt đầu chia sẻ cùng cộng đồng.
        </p>
        <Link
          href='/recipes/new'
          className='mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950'
        >
          Tạo công thức mới
        </Link>
      </section>
    );
  }

  return <RecipeGrid recipes={recipes} />;
}
