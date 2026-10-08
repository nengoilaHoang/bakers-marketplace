import { ButtonLink } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import RecipeGrid, { RecipeGridSkeleton } from '@/components/ui/RecipeGrid';
import { useMyRecipes } from '@/hooks/useMyRecipes';
import { toRecipeCardData } from '@/utils/recipeCard';

export default function MyRecipesTab() {
  const { recipes, isLoading, error, retry } = useMyRecipes();

  if (isLoading) return <RecipeGridSkeleton columns={3} count={3} />;

  if (error) {
    return <ErrorState title='Không thể tải công thức của bạn' message={error} onRetry={retry} />;
  }

  if (recipes.length === 0) {
    return (
      <EmptyState
        icon='chef-hat'
        title='Bạn chưa có công thức nào'
        description='Hãy tạo công thức đầu tiên để bắt đầu chia sẻ cùng cộng đồng.'
        action={<ButtonLink href='/recipes/new'>Tạo công thức mới</ButtonLink>}
      />
    );
  }

  return (
    <>
      <div className='mb-6 flex justify-end'>
        <ButtonLink href='/recipes/new' size='sm' className='uppercase'>
          + Thêm công thức
        </ButtonLink>
      </div>
      <RecipeGrid recipes={recipes.map(toRecipeCardData)} columns={3} savable={false} />
    </>
  );
}
