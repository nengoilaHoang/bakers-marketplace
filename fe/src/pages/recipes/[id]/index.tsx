import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import RecipeDetailSkeleton from '@/components/recipe/detail/RecipeDetailSkeleton';
import RecipeDetailView from '@/components/recipe/detail/RecipeDetailView';
import Alert from '@/components/ui/Alert';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button, { ButtonLink } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import Icon from '@/components/ui/Icon';
import PageTitle from '@/components/ui/PageTitle';
import { useRecipeDetail } from '@/hooks/useRecipeDetail';
import { getCurrentUser } from '@/services/posts';
import { deleteRecipe } from '@/services/recipes';
import type { SessionUser } from '@/types/post';

export default function RecipeDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;
  const { recipe, error, isLoading, isNotFound, retry } = useRecipeDetail(id, router.isReady);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    void getCurrentUser()
      .catch(() => null)
      .then((user) => {
        if (isActive) setCurrentUser(user);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const isOwner = Boolean(recipe?.userId && recipe.userId === currentUser?.id);

  async function handleDelete() {
    if (!recipe || !window.confirm(`Xóa công thức “${recipe.title}”?`)) {
      return;
    }

    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deleteRecipe(recipe.id);
      await router.replace('/me?tab=recipes');
    } catch (requestError) {
      setDeleteError(
        requestError instanceof Error
          ? requestError.message
          : 'Không thể xóa công thức. Vui lòng thử lại.',
      );
      setIsDeleting(false);
    }
  }

  return (
    <>
      <PageTitle
        title={recipe?.title ?? 'Chi tiết công thức'}
        description={recipe?.description || 'Xem nguyên liệu và hướng dẫn thực hiện công thức.'}
      />

      <Container size='content' className='pt-6 pb-20'>
        <Breadcrumb
          className='-ml-2'
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Công thức', href: '/recipes' },
            { label: recipe?.title ?? 'Chi tiết' },
          ]}
        />

        {deleteError && (
          <Alert tone='danger' className='mt-4'>
            {deleteError}
          </Alert>
        )}

        {isLoading ? (
          <RecipeDetailSkeleton />
        ) : isNotFound ? (
          <EmptyState
            icon='search'
            className='mt-8'
            title='Không tìm thấy công thức'
            description='Công thức này không tồn tại hoặc đã bị xóa.'
            action={<ButtonLink href='/recipes'>Xem công thức khác</ButtonLink>}
          />
        ) : error ? (
          <div className='mt-8'>
            <ErrorState title='Không thể tải công thức' message={error} onRetry={retry} />
          </div>
        ) : recipe ? (
          <RecipeDetailView
            recipe={recipe}
            actions={
              isOwner && (
                <>
                  <ButtonLink
                    href={`/recipes/${encodeURIComponent(recipe.id)}/edit`}
                    variant='outline'
                    className='uppercase'
                  >
                    <Icon name='edit' className='size-5' />
                    Sửa
                  </ButtonLink>
                  <Button
                    variant='outline'
                    onClick={() => void handleDelete()}
                    disabled={isDeleting}
                    className='uppercase'
                  >
                    <Icon name='trash' className='size-5' />
                    {isDeleting ? 'Đang xóa...' : 'Xóa'}
                  </Button>
                </>
              )
            }
          />
        ) : null}
      </Container>
    </>
  );
}

RecipeDetailPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
