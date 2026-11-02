import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import PostFields from '@/components/posts/PostFields';
import Alert from '@/components/ui/Alert';
import Button, { ButtonLink } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Field from '@/components/ui/Field';
import PageTitle from '@/components/ui/PageTitle';
import Select from '@/components/ui/Select';
import { ApiError } from '@/lib/api';
import { createPost } from '@/services/posts';
import { getMyRecipes } from '@/services/recipes';
import type { Recipe } from '@/types/recipe';

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
  const [recipeId, setRecipeId] = useState('');
  const [myRecipes, setMyRecipes] = useState<Recipe[] | null>(null);
  const [recipesError, setRecipesError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Danh sách công thức để chọn đính kèm: chỉ các công thức trong kho của người viết.
  useEffect(() => {
    const controller = new AbortController();
    const requestTimer = window.setTimeout(() => {
      getMyRecipes({ signal: controller.signal })
        .then((recipes) => {
          if (!controller.signal.aborted) setMyRecipes(recipes);
        })
        .catch(() => {
          if (!controller.signal.aborted) setRecipesError(true);
        });
    }, 0);

    return () => {
      window.clearTimeout(requestTimer);
      controller.abort();
    };
  }, []);

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) {
      setError('Vui lòng nhập tiêu đề và nội dung bài viết.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const post = await createPost({
        title: title.trim(),
        content: content.trim(),
        tags: tagsInput
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        recipeId: recipeId || undefined,
      });

      await router.push(`/posts/${post.id}`);
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

          <Field
            label='Đính kèm công thức'
            htmlFor='post-recipe'
            hint='Chọn một công thức của bạn. Bài viết giữ bản lưu lúc đăng, sửa công thức sau này không ảnh hưởng tới bài. Bản đính kèm luôn công khai.'
          >
            {recipesError ? (
              <p className='text-body-sm text-danger'>
                Không tải được danh sách công thức của bạn. Bạn vẫn có thể đăng bài không kèm công thức.
              </p>
            ) : myRecipes !== null && myRecipes.length === 0 ? (
              <p className='text-body-sm text-ink-muted'>
                Bạn chưa có công thức nào.{' '}
                <Link href='/recipes/new' className='font-medium text-ink underline'>
                  Tạo công thức
                </Link>{' '}
                trước rồi quay lại đính kèm.
              </p>
            ) : (
              <Select
                id='post-recipe'
                tone='field'
                wrapperClassName='w-full'
                value={recipeId}
                onChange={(event) => setRecipeId(event.target.value)}
                disabled={isSubmitting || myRecipes === null}
              >
                <option value=''>
                  {myRecipes === null ? 'Đang tải công thức...' : 'Không đính kèm công thức'}
                </option>
                {myRecipes?.map((recipe) => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.title}
                    {recipe.isPublic ? '' : ' (riêng tư)'}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          {error && <Alert tone='danger'>{error}</Alert>}
          <div className='flex flex-wrap gap-4'>
            <Button
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
              className='min-w-38'
            >
              {isSubmitting ? 'Đang đăng...' : 'Đăng bài'}
            </Button>
            <ButtonLink href='/' variant='outline'>
              Hủy
            </ButtonLink>
          </div>
        </div>
      </Container>
    </>
  );
}

NewPostPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
