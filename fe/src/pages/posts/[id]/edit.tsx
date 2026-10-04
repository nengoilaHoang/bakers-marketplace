import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState, type FormEvent } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import PostFields from '@/components/posts/PostFields';
import Alert from '@/components/ui/Alert';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button, { ButtonLink } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import PageTitle from '@/components/ui/PageTitle';
import { ApiError } from '@/lib/api';
import { getCurrentUser, getPostById, updatePost } from '@/services/posts';
import type { PostRecipeSummary } from '@/types/post';
import { stripRecipeToken } from '@/utils/postContent';

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError && Array.isArray(error.details)) {
    const details = (error.details as { path: string; message: string }[])
      .map((detail) => `${detail.path}: ${detail.message}`)
      .join(', ');

    return `${error.message} (${details})`;
  }

  return error instanceof Error && error.message
    ? error.message
    : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

export default function EditPostPage() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [recipe, setRecipe] = useState<PostRecipeSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady || !id) return;

    let ignore = false;

    async function loadPost(postId: string) {
      try {
        const [post, user] = await Promise.all([
          getPostById(postId),
          getCurrentUser(),
        ]);

        if (ignore) return;

        if (!user || post.authorId !== user.id) {
          setLoadError('Bạn không có quyền sửa bài viết này.');
          return;
        }

        setTitle(post.title);
        // BE tự giữ lại token công thức nếu content gửi lên không có
        setContent(stripRecipeToken(post.content));
        setTagsInput(post.tags.map((tag) => tag.name).join(', '));
        setRecipe(post.recipe);
      } catch (requestError) {
        if (!ignore) setLoadError(getErrorMessage(requestError));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void loadPost(id);

    return () => {
      ignore = true;
    };
  }, [id, router.isReady]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await updatePost(id, {
        title: title.trim(),
        content: content.trim(),
        tags: tagsInput
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      });

      await router.push(`/posts/${id}`);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setIsSubmitting(false);
    }
  }

  const postHref = id ? `/posts/${id}` : '/';

  return (
    <>
      <PageTitle title='Sửa bài viết' />

      <Container size='narrow' className='pt-6 pb-20'>
        <Breadcrumb
          className='-ml-2'
          items={[
            { label: 'Diễn đàn', href: '/' },
            { label: title || 'Bài viết', href: postHref },
            { label: 'Sửa' },
          ]}
        />
        <h1 className='mt-6 font-heading text-h2 font-bold text-ink [font-variant-caps:small-caps]'>
          Sửa bài viết
        </h1>

        <div className='mt-5'>
          {isLoading ? (
            <div
              role='status'
              aria-label='Đang tải bài viết'
              className='h-96 animate-pulse rounded-control bg-surface-soft'
            />
          ) : loadError ? (
            <Alert tone='danger' action={<ButtonLink href={postHref} variant='outline' size='sm'>Quay lại bài viết</ButtonLink>}>
              {loadError}
            </Alert>
          ) : (
            <form
              onSubmit={handleSubmit}
              className='flex flex-col gap-8 rounded-control bg-page px-5 pt-8 pb-10 shadow-raised sm:px-9'
            >
              <PostFields
                title={title}
                content={content}
                tagsInput={tagsInput}
                onTitleChange={setTitle}
                onContentChange={setContent}
                onTagsInputChange={setTagsInput}
                disabled={isSubmitting}
              />

              {recipe && (
                <p className='flex flex-wrap items-center gap-2 rounded-box bg-highlight px-5 py-4 text-body-sm text-ink'>
                  <Icon name='chef-hat' className='size-5 text-primary' />
                  Công thức đính kèm:
                  <Link
                    href={`/recipes/${encodeURIComponent(recipe.id)}`}
                    className='rounded-control font-medium underline decoration-accent underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-accent'
                  >
                    {recipe.title}
                  </Link>
                  <span className='font-light text-ink-muted'>(không đổi được sau khi đăng)</span>
                </p>
              )}

              {error && <Alert tone='danger'>{error}</Alert>}

              <div className='flex flex-wrap gap-4'>
                <Button type='submit' disabled={isSubmitting} className='min-w-38'>
                  {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
                <ButtonLink href={postHref} variant='outline'>
                  Hủy
                </ButtonLink>
              </div>
            </form>
          )}
        </div>
      </Container>
    </>
  );
}

EditPostPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
