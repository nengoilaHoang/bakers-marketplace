import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { getSavedPosts, unsavePost } from '@/services/posts';
import type { Post, PostCursor } from '@/types/post';

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

export default function SavedPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<PostCursor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadFirstPage() {
      try {
        const page = await getSavedPosts();

        if (!ignore) {
          setPosts(page.posts);
          setCursor(page.cursor);
        }
      } catch (requestError) {
        if (!ignore) setError(getErrorMessage(requestError));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void loadFirstPage();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleLoadMore() {
    if (!cursor) return;

    setIsLoadingMore(true);

    try {
      const page = await getSavedPosts({ cursor });
      setPosts((current) => [...current, ...page.posts]);
      setCursor(page.cursor);
    } catch (requestError) {
      window.alert(getErrorMessage(requestError));
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function handleUnsave(post: Post) {
    try {
      await unsavePost(post.id);
      setPosts((current) => current.filter((item) => item.id !== post.id));
    } catch (requestError) {
      window.alert(getErrorMessage(requestError));
    }
  }

  return (
    <>
      <Head>
        <title>Bài viết đã lưu</title>
      </Head>

      <main className='mx-auto max-w-3xl p-4'>
        <nav className='mb-4 flex flex-wrap gap-4 text-sm underline'>
          <Link href='/posts'>Bài viết</Link>
          <Link href='/posts/new'>Tạo bài viết</Link>
          <Link href='/posts/mine'>Bài của tôi</Link>
          <Link href='/posts/saved'>Đã lưu</Link>
        </nav>

        <h1 className='mb-4 text-2xl font-bold'>Bài viết đã lưu</h1>

        {isLoading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p className='text-red-600'>Lỗi: {error}</p>
        ) : posts.length === 0 ? (
          <p>Bạn chưa lưu bài viết nào.</p>
        ) : (
          <>
            <ul className='space-y-3'>
              {posts.map((post) => (
                <li key={post.id} className='border p-3'>
                  <Link href={`/posts/${post.id}`} className='font-semibold underline'>
                    {post.title}
                  </Link>
                  <p className='text-sm text-gray-600'>
                    {post.author?.displayName ?? 'Người dùng đã xoá'} ·{' '}
                    {new Date(post.createdAt).toLocaleString('vi-VN')}
                  </p>
                  <button
                    type='button'
                    onClick={() => void handleUnsave(post)}
                    className='mt-2 border px-2 py-1 text-sm'
                  >
                    Bỏ lưu
                  </button>
                </li>
              ))}
            </ul>

            {cursor && (
              <button
                type='button'
                onClick={() => void handleLoadMore()}
                disabled={isLoadingMore}
                className='mt-4 border px-3 py-1'
              >
                {isLoadingMore ? 'Đang tải...' : 'Tải thêm'}
              </button>
            )}
          </>
        )}
      </main>
    </>
  );
}
