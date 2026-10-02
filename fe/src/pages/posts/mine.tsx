import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { deletePost, getMyPosts } from '@/services/posts';
import type { Post, PostCursor } from '@/types/post';

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

export default function MyPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<PostCursor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadFirstPage() {
      try {
        const page = await getMyPosts();

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
      const page = await getMyPosts({ cursor });
      setPosts((current) => [...current, ...page.posts]);
      setCursor(page.cursor);
    } catch (requestError) {
      window.alert(getErrorMessage(requestError));
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function handleDelete(post: Post) {
    if (!window.confirm(`Xoá bài "${post.title}"?`)) return;

    try {
      await deletePost(post.id);
      setPosts((current) => current.filter((item) => item.id !== post.id));
    } catch (requestError) {
      window.alert(getErrorMessage(requestError));
    }
  }

  return (
    <>
      <Head>
        <title>Bài viết của tôi</title>
      </Head>

      <main className='mx-auto max-w-3xl p-4'>
        <nav className='mb-4 flex flex-wrap gap-4 text-sm underline'>
          <Link href='/posts'>Bài viết</Link>
          <Link href='/posts/new'>Tạo bài viết</Link>
          <Link href='/posts/mine'>Bài của tôi</Link>
          <Link href='/posts/saved'>Đã lưu</Link>
        </nav>

        <h1 className='mb-4 text-2xl font-bold'>Bài viết của tôi</h1>

        {isLoading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p className='text-red-600'>Lỗi: {error}</p>
        ) : posts.length === 0 ? (
          <p>
            Bạn chưa có bài viết nào.{' '}
            <Link href='/posts/new' className='underline'>
              Tạo bài đầu tiên
            </Link>
          </p>
        ) : (
          <>
            <table className='w-full border text-left text-sm'>
              <thead>
                <tr className='border-b'>
                  <th className='p-2'>Tiêu đề</th>
                  <th className='p-2'>Ngày đăng</th>
                  <th className='p-2'>Thích</th>
                  <th className='p-2'>Bình luận</th>
                  <th className='p-2' />
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className='border-b'>
                    <td className='p-2'>
                      <Link href={`/posts/${post.id}`} className='underline'>
                        {post.title}
                      </Link>
                    </td>
                    <td className='p-2'>
                      {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className='p-2'>{post.likeCount}</td>
                    <td className='p-2'>{post.commentCount}</td>
                    <td className='space-x-3 p-2 whitespace-nowrap'>
                      <Link href={`/posts/${post.id}/edit`} className='underline'>
                        Sửa
                      </Link>
                      <button
                        type='button'
                        onClick={() => void handleDelete(post)}
                        className='text-red-600 underline'
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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
