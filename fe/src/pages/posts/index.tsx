import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';

import {
  getCurrentUser,
  getPosts,
  likePost,
  savePost,
  searchPosts,
  unlikePost,
  unsavePost,
} from '@/services/posts';
import type { Post, PostCursor, PostSearchParams } from '@/types/post';

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

function loadPostsPage(search: PostSearchParams, cursor?: PostCursor | null) {
  return search.q || search.tag
    ? searchPosts(search, { cursor })
    : getPosts({ cursor });
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<PostCursor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keywordInput, setKeywordInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [search, setSearch] = useState<PostSearchParams>({});

  useEffect(() => {
    let ignore = false;

    async function loadFirstPage() {
      try {
        // Làm mới token (nếu cần) trước, để isLiked/isSaved trả về đúng
        await getCurrentUser().catch(() => null);
        const page = await loadPostsPage(search);

        if (!ignore) {
          setPosts(page.posts);
          setCursor(page.cursor);
          setError(null);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadFirstPage();

    return () => {
      ignore = true;
    };
  }, [search]);

  function applySearch(nextSearch: PostSearchParams) {
    setIsLoading(true);
    setSearch(nextSearch);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applySearch({ q: keywordInput.trim(), tag: tagInput.trim() });
  }

  function handleTagClick(tagName: string) {
    setKeywordInput('');
    setTagInput(tagName);
    applySearch({ tag: tagName });
  }

  function handleClearSearch() {
    setKeywordInput('');
    setTagInput('');
    applySearch({});
  }

  async function handleLoadMore() {
    if (!cursor) return;

    setIsLoadingMore(true);

    try {
      const page = await loadPostsPage(search, cursor);
      setPosts((current) => [...current, ...page.posts]);
      setCursor(page.cursor);
    } catch (requestError) {
      window.alert(getErrorMessage(requestError));
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function handleToggleLike(post: Post) {
    try {
      const status = post.isLiked
        ? await unlikePost(post.id)
        : await likePost(post.id);

      setPosts((current) =>
        current.map((item) =>
          item.id === post.id
            ? { ...item, isLiked: status.liked, likeCount: status.likeCount }
            : item,
        ),
      );
    } catch (requestError) {
      window.alert(getErrorMessage(requestError));
    }
  }

  async function handleToggleSave(post: Post) {
    try {
      const status = post.isSaved
        ? await unsavePost(post.id)
        : await savePost(post.id);

      setPosts((current) =>
        current.map((item) =>
          item.id === post.id ? { ...item, isSaved: status.saved } : item,
        ),
      );
    } catch (requestError) {
      window.alert(getErrorMessage(requestError));
    }
  }

  const isSearching = Boolean(search.q || search.tag);

  return (
    <>
      <Head>
        <title>Bài viết</title>
      </Head>

      <main className='mx-auto max-w-3xl p-4'>
        <nav className='mb-4 flex flex-wrap gap-4 text-sm underline'>
          <Link href='/posts'>Bài viết</Link>
          <Link href='/posts/new'>Tạo bài viết</Link>
          <Link href='/posts/mine'>Bài của tôi</Link>
          <Link href='/posts/saved'>Đã lưu</Link>
        </nav>

        <h1 className='mb-4 text-2xl font-bold'>Bài viết</h1>

        <form onSubmit={handleSearchSubmit} className='mb-4 flex flex-wrap gap-2'>
          <input
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            placeholder='Từ khoá (vd: banh)'
            className='border px-2 py-1'
          />
          <input
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            placeholder='Tag (vd: hoi-dap)'
            className='border px-2 py-1'
          />
          <button type='submit' className='border px-3 py-1'>
            Tìm
          </button>
          {isSearching && (
            <button type='button' onClick={handleClearSearch} className='border px-3 py-1'>
              Xoá tìm kiếm
            </button>
          )}
        </form>

        {isSearching && (
          <p className='mb-4 text-sm'>
            Đang tìm: {search.q && <b>&quot;{search.q}&quot; </b>}
            {search.tag && <b>#{search.tag}</b>}
          </p>
        )}

        {isLoading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p className='text-red-600'>Lỗi: {error}</p>
        ) : posts.length === 0 ? (
          <p>Không có bài viết nào.</p>
        ) : (
          <>
            <ul className='space-y-4'>
              {posts.map((post) => (
                <li key={post.id} className='border p-3'>
                  <Link href={`/posts/${post.id}`} className='text-lg font-semibold underline'>
                    {post.title}
                  </Link>
                  <p className='text-sm text-gray-600'>
                    {post.author?.displayName ?? 'Người dùng đã xoá'} ·{' '}
                    {new Date(post.createdAt).toLocaleString('vi-VN')}
                  </p>

                  <p className='mt-2 whitespace-pre-line'>
                    {post.content.length > 200
                      ? `${post.content.slice(0, 200)}...`
                      : post.content}
                  </p>

                  {post.recipe && (
                    <p className='mt-2 text-sm'>
                      Công thức:{' '}
                      <Link href={`/recipes/${post.recipe.id}`} className='underline'>
                        {post.recipe.title}
                      </Link>
                    </p>
                  )}

                  {post.tags.length > 0 && (
                    <div className='mt-2 flex flex-wrap gap-2 text-sm'>
                      {post.tags.map((tag) => (
                        <button
                          key={tag.id}
                          type='button'
                          onClick={() => handleTagClick(tag.name)}
                          className='text-blue-700 underline'
                        >
                          #{tag.name}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className='mt-2 flex flex-wrap gap-2 text-sm'>
                    <button
                      type='button'
                      onClick={() => void handleToggleLike(post)}
                      className='border px-2 py-1'
                    >
                      {post.isLiked ? '♥ Bỏ thích' : '♡ Thích'} ({post.likeCount})
                    </button>
                    <button
                      type='button'
                      onClick={() => void handleToggleSave(post)}
                      className='border px-2 py-1'
                    >
                      {post.isSaved ? 'Bỏ lưu' : 'Lưu'}
                    </button>
                    <Link href={`/posts/${post.id}`} className='border px-2 py-1'>
                      Bình luận ({post.commentCount})
                    </Link>
                  </div>
                </li>
              ))}
            </ul>

            <div className='mt-4'>
              {cursor ? (
                <button
                  type='button'
                  onClick={() => void handleLoadMore()}
                  disabled={isLoadingMore}
                  className='border px-3 py-1'
                >
                  {isLoadingMore ? 'Đang tải...' : 'Tải thêm'}
                </button>
              ) : (
                <p className='text-sm text-gray-600'>Đã xem hết.</p>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}
