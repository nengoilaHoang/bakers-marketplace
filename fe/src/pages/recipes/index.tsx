import AppLayout from '@/components/layout/AppLayout';
import RecipeSearchHero from '@/components/recipe/search/RecipeSearchHero';
import RecipeSearchPanel from '@/components/recipe/search/RecipeSearchPanel';
import Button, { ButtonLink } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import PageTitle from '@/components/ui/PageTitle';
import RecipeGrid, { RecipeGridSkeleton } from '@/components/ui/RecipeGrid';
import SectionHeading from '@/components/ui/SectionHeading';
import { useInfiniteRecipes } from '@/hooks/useInfiniteRecipes';
import { toRecipeCardData } from '@/utils/recipeCard';

export default function RecipesPage() {
  const {
    recipes,
    isInitialLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    retry,
    sentinelRef,
  } = useInfiniteRecipes();

  return (
    <>
      <PageTitle
        title='Công thức'
        description='Khám phá công thức mới nhất và tìm món phù hợp với nguyên liệu bạn có.'
      />

      <RecipeSearchHero
        breadcrumb={[{ label: 'Trang chủ', href: '/' }, { label: 'Công thức' }]}
        title='Tìm công thức phù hợp với bạn'
        description='Tìm theo tên món hoặc chọn những dụng cụ, nguyên liệu bạn đang có.'
      >
        <RecipeSearchPanel />
      </RecipeSearchHero>

      <Container as='section' className='py-16 lg:py-24'>
        <SectionHeading title='Công thức mới nhất' />
        {!isInitialLoading && recipes.length > 0 && (
          <p className='mt-1 text-caption font-light text-ink-muted' aria-live='polite'>
            Đã tải {recipes.length} công thức
          </p>
        )}

        <div className='mt-8'>
          {isInitialLoading ? (
            <RecipeGridSkeleton />
          ) : error && recipes.length === 0 ? (
            <ErrorState message={error} onRetry={retry} />
          ) : recipes.length === 0 ? (
            <EmptyState
              title='Chưa có công thức nào'
              description='Các công thức mới sẽ xuất hiện tại đây.'
              action={<ButtonLink href='/recipes/new'>Thêm công thức</ButtonLink>}
            />
          ) : (
            <>
              <RecipeGrid recipes={recipes.map(toRecipeCardData)} savable={false} />

              {error && (
                <div className='mt-8'>
                  <ErrorState
                    title='Không thể tải thêm công thức'
                    message={error}
                    onRetry={retry}
                    compact
                  />
                </div>
              )}

              <div
                ref={sentinelRef}
                className='flex min-h-24 items-center justify-center py-6 text-center'
                aria-live='polite'
              >
                {isLoadingMore ? (
                  <p className='flex items-center gap-3 text-body-sm text-ink-muted'>
                    <span
                      aria-hidden
                      className='size-5 animate-spin rounded-full border-2 border-line border-t-primary'
                    />
                    Đang tải thêm công thức...
                  </p>
                ) : hasMore && !error ? (
                  <Button variant='outline' onClick={() => void loadMore()}>
                    Tải thêm công thức
                  </Button>
                ) : !hasMore ? (
                  <p className='text-body-sm font-light text-ink-muted'>
                    Bạn đã xem hết danh sách công thức.
                  </p>
                ) : null}
              </div>
            </>
          )}
        </div>
      </Container>
    </>
  );
}

RecipesPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
