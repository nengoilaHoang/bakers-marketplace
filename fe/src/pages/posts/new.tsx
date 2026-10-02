import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import RecipeForm from '@/components/recipe/RecipeForm';
import { ApiError } from '@/lib/api';
import { createPost } from '@/services/posts';
import type { RecipeMutationPayload } from '@/types/recipe';
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
      <Head>
        <title>Tạo bài viết</title>
      </Head>

      <div className='mx-auto max-w-3xl'>
        <Link href='/' className='text-sm underline'>
          ← Quay lại danh sách
        </Link>

        <h1 className='mt-4 mb-4 text-2xl font-bold'>Tạo bài viết</h1>

        <div className='flex flex-col gap-3'>
          <label className='flex flex-col gap-1'>
            Tiêu đề *
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={255}
              className='border px-2 py-1'
            />
          </label>

          <label className='flex flex-col gap-1'>
            Nội dung *
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={8}
              className='border px-2 py-1'
            />
          </label>

          <label className='flex flex-col gap-1'>
            Tag (cách nhau bằng dấu phẩy, tối đa 10)
            <input
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder='vd: cake, matcha, tips'
              className='border px-2 py-1'
            />
          </label>

          <label className='flex w-fit items-center gap-2'>
            <input
              type='checkbox'
              checked={withRecipe}
              onChange={(event) => setWithRecipe(event.target.checked)}
            />
            Đăng kèm công thức
          </label>
        </div>

        {withRecipe ? (
          <section className='mt-4 border-2 border-dashed border-gray-400 p-4'>
            <h2 className='text-lg font-semibold'>Công thức đính kèm</h2>
            <p className='mb-4 text-sm text-gray-600'>
              Khi đăng, hệ thống tạo 2 bản công thức giống nhau: 1 bản nằm trong
              &quot;Công thức của tôi&quot;, 1 bản gắn cố định vào bài viết này. Cả hai
              luôn công khai (bỏ qua ô &quot;Công khai công thức này&quot; bên dưới).
            </p>

            <RecipeForm
              submitLabel='Đăng bài kèm công thức'
              cancelHref='/'
              onSubmit={(recipe) => submitPost({ ...recipe, isPublic: true })}
            />
          </section>
        ) : (
          <div className='mt-4'>
            {error && <p className='mb-2 text-red-600'>Lỗi: {error}</p>}

            <button
              type='button'
              onClick={() => void handleSubmitWithoutRecipe()}
              disabled={isSubmitting}
              className='border px-4 py-1'
            >
              {isSubmitting ? 'Đang đăng...' : 'Đăng bài'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

NewPostPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
