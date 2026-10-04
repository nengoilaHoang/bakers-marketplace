import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState, type FormEvent } from 'react';

import { ApiError } from '@/lib/api';
import { getCurrentUser, getPostById, updatePost } from '@/services/posts';
import type { PostRecipeSummary } from '@/types/post';
import { stripRecipeToken } from '@/utils/postContent';
import AppLayout from '@/components/layout/AppLayout';

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

  return (
    <>
      <Head>
        <title>Sửa bài viết</title>
      </Head>

      <div className='mx-auto max-w-3xl'>
        <Link href={id ? `/posts/${id}` : '/'} className='text-sm underline'>
          ← Quay lại bài viết
        </Link>

        <h1 className='mt-4 mb-4 text-2xl font-bold'>Sửa bài viết</h1>

        {isLoading ? (
          <p>Đang tải...</p>
        ) : loadError ? (
          <p className='text-red-600'>Lỗi: {loadError}</p>
        ) : (
          <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
            <label className='flex flex-col gap-1'>
              Tiêu đề *
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={255}
                className='border px-2 py-1'
              />
            </label>

            <label className='flex flex-col gap-1'>
              Nội dung *
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                required
                rows={8}
                className='border px-2 py-1'
              />
            </label>

            <label className='flex flex-col gap-1'>
              Tag (cách nhau bằng dấu phẩy, tối đa 10)
              <input
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                className='border px-2 py-1'
              />
            </label>

            {recipe && (
              <p className='text-sm'>
                Công thức đính kèm:{' '}
                <Link href={`/recipes/${recipe.id}`} className='underline'>
                  {recipe.title}
                </Link>{' '}
                <span className='text-gray-600'>(không đổi được sau khi đăng)</span>
              </p>
            )}

            {error && <p className='text-red-600'>Lỗi: {error}</p>}

            <button type='submit' disabled={isSubmitting} className='w-fit border px-4 py-1'>
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>
        )}
      </div>
    </>
  );
}

EditPostPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
