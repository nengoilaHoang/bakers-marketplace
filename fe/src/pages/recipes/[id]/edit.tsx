import { useRouter } from 'next/router';

import AppLayout from '@/components/layout/AppLayout';
import RecipeForm from '@/components/recipe/RecipeForm';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { ButtonLink } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import PageTitle from '@/components/ui/PageTitle';
import { useRecipeDetail } from '@/hooks/useRecipeDetail';
import { updateRecipe } from '@/services/recipes';

export default function EditRecipePage() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;
  const { recipe, error, isLoading, isNotFound, retry } = useRecipeDetail(
    id,
    router.isReady,
  );
  const detailHref = id ? `/recipes/${encodeURIComponent(id)}` : '/recipes';

  return (
    <>
      <PageTitle title={recipe ? `Sửa ${recipe.title}` : 'Sửa công thức'} />

      <Container size='narrow' className='pt-6 pb-20'>
        <Breadcrumb
          className='-ml-2'
          items={[
            { label: 'Công thức', href: '/recipes' },
            { label: recipe?.title ?? 'Chi tiết', href: detailHref },
            { label: 'Sửa' },
          ]}
        />
        <h1 className='mt-6 font-heading text-h2 font-bold text-ink [font-variant-caps:small-caps]'>
          Sửa công thức
        </h1>
        <p className='mt-2 text-body-sm font-light text-ink-muted'>
          Cập nhật thông tin và sắp xếp lại các bước, ghi chú khi cần.
        </p>

        <div className='mt-5'>
          {isLoading ? (
            <div
              role='status'
              aria-label='Đang tải công thức'
              className='h-96 animate-pulse rounded-control bg-surface-soft'
            />
          ) : isNotFound ? (
            <EmptyState
              icon='search'
              title='Không tìm thấy công thức'
              action={<ButtonLink href='/recipes'>Xem công thức khác</ButtonLink>}
            />
          ) : error ? (
            <ErrorState title='Không thể tải công thức' message={error} onRetry={retry} />
          ) : recipe ? (
            <RecipeForm
              key={recipe.id}
              initialRecipe={recipe}
              submitLabel='Lưu thay đổi'
              cancelHref={detailHref}
              onSubmit={async (values) => {
                await updateRecipe(recipe.id, values);
                await router.replace(`/recipes/${encodeURIComponent(recipe.id)}`);
              }}
            />
          ) : null}
        </div>
      </Container>
    </>
  );
}

EditRecipePage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
