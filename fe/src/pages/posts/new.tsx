import { useRouter } from 'next/router';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import PostFields from '@/components/posts/PostFields';
import RecipeForm from '@/components/recipe/RecipeForm';
import Alert from '@/components/ui/Alert';
import Button, { ButtonLink } from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import Container from '@/components/ui/Container';
import PageTitle from '@/components/ui/PageTitle';
import { ApiError } from '@/lib/api';
import { createPost } from '@/services/posts';
import type { RecipeMutationPayload } from '@/types/recipe';

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

export default function NewPostPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [withRecipe, setWithRecipe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ném lỗi ra ngoài để nơi gọi hiển thị (RecipeForm tự hiện lỗi trong ô công thức)
  async function submitPost(recipe?: RecipeMutationPayload) {
    if (!title.trim() || !content.trim()) {
      throw new Error('Vui lòng nhập tiêu đề và nội dung bài viết.');
    }

    try {
      const post = await createPost({
        title: title.trim(),
        content: content.trim(),
        tags: tagsInput
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        recipe,
      });

      await router.push(`/posts/${post.id}`);
    } catch (requestError) {
      throw new Error(getErrorMessage(requestError));
    }
  }

  async function handleSubmitWithoutRecipe() {
    setIsSubmitting(true);
    setError(null);

    try {
      await submitPost();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageTitle title='Viết bài mới' />

      <Container size='narrow' className='pt-14 pb-20'>
        <h1 className='font-heading text-h2 font-bold text-ink [font-variant-caps:small-caps]'>
          Viết bài mới
        </h1>
        <p className='mt-2 text-body-sm font-light text-ink-muted'>
          Đặt câu hỏi, chia sẻ kinh nghiệm hoặc đăng kèm một công thức của bạn.
        </p>

        <div className='mt-5 flex flex-col gap-8 rounded-control bg-page px-5 pt-8 pb-10 shadow-raised sm:px-9'>
          <PostFields
            title={title}
            content={content}
            tagsInput={tagsInput}
            onTitleChange={setTitle}
            onContentChange={setContent}
            onTagsInputChange={setTagsInput}
            disabled={isSubmitting}
          />

          <div className='rounded-box bg-surface px-5 py-4'>
            <Checkbox
              label='Đăng kèm công thức'
              labelClassName='text-lead text-ink'
              checked={withRecipe}
              onChange={(event) => setWithRecipe(event.target.checked)}
            />
          </div>

          {!withRecipe && (
            <>
              {error && <Alert tone='danger'>{error}</Alert>}
              <div className='flex flex-wrap gap-4'>
                <Button
                  onClick={() => void handleSubmitWithoutRecipe()}
                  disabled={isSubmitting}
                  className='min-w-38'
                >
                  {isSubmitting ? 'Đang đăng...' : 'Đăng bài'}
                </Button>
                <ButtonLink href='/' variant='outline'>
                  Hủy
                </ButtonLink>
              </div>
            </>
          )}
        </div>

        {withRecipe && (
          <section className='mt-12'>
            <h2 className='font-heading text-h3 font-semibold text-ink'>Công thức đính kèm</h2>
            <Alert tone='info' className='mt-3'>
              Khi đăng, hệ thống tạo 2 bản công thức giống nhau: 1 bản nằm trong &quot;Công thức của
              tôi&quot;, 1 bản gắn cố định vào bài viết này. Cả hai luôn công khai (bỏ qua ô
              &quot;Công khai công thức này&quot; bên dưới).
            </Alert>
            <div className='mt-5'>
              <RecipeForm
                submitLabel='Đăng bài kèm công thức'
                cancelHref='/'
                onSubmit={(recipe) => submitPost({ ...recipe, isPublic: true })}
              />
            </div>
          </section>
        )}
      </Container>
    </>
  );
}

NewPostPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
