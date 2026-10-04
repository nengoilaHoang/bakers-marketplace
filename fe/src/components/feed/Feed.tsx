import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
import { stripRecipeToken } from '@/utils/postContent';

type FeedResult = {
  searchKey: string;
  posts: Post[];
  cursor: PostCursor | null;
  error: string | null;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

function toExcerpt(text: string): string {
  return text.length > 200 ? `${text.slice(0, 200)}...` : text;
}

function readQueryValue(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value : '';
}

function loadPostsPage(search: PostSearchParams, cursor?: PostCursor | null) {
  return search.q || search.tag
    ? searchPosts(search, { cursor })
    : getPosts({ cursor });
}

export default function Feed() {
  const router = useRouter();
  // Bộ lọc nằm trên URL (/?q=&tag=) để tag ở trang khác có thể dẫn thẳng về bảng tin đã lọc
  const q = readQueryValue(router.query.q);
  const tag = readQueryValue(router.query.tag);
  const searchKey = `${q}\n${tag}`;
  const [result, setResult] = useState<FeedResult | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadFirstPage() {
      try {
        // Làm mới token (nếu cần) trước, để isLiked/isSaved trả về đúng
        await getCurrentUser().catch(() => null);
        const page = await loadPostsPage({ q, tag });

        if (!ignore) {
          setResult({ searchKey, posts: page.posts, cursor: page.cursor, error: null });
        }
      } catch (requestError) {
        if (!ignore) {
          setResult({ searchKey, posts: [], cursor: null, error: getErrorMessage(requestError) });
        }
      }
    }

    void loadFirstPage();

    return () => {
      ignore = true;
    };
  }, [q, tag, searchKey]);

  // Ẩn kết quả của bộ lọc cũ ngay khi URL đổi
  const current = result?.searchKey === searchKey ? result : null;
  const isLoading = !current;
  const posts = current?.posts ?? [];
  const isSearching = Boolean(q || tag);

  function updatePosts(update: (posts: Post[]) => Post[]) {
    setResult((previous) => previous && { ...previous, posts: update(previous.posts) });
  }

  function applySearch(nextSearch: PostSearchParams) {
    const query: Record<string, string> = {};
    if (nextSearch.q) query.q = nextSearch.q;
    if (nextSearch.tag) query.tag = nextSearch.tag;

    void router.push({ pathname: '/', query }, undefined, { shallow: true });
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    applySearch({
      q: String(formData.get('q') ?? '').trim(),
      tag: String(formData.get('tag') ?? '').trim(),
    });
  }

  async function handleLoadMore() {
    if (!current?.cursor) return;

    setIsLoadingMore(true);

    try {
      const page = await loadPostsPage({ q, tag }, current.cursor);
      setResult((previous) =>
        previous?.searchKey === searchKey
          ? { ...previous, posts: [...previous.posts, ...page.posts], cursor: page.cursor }
          : previous,
      );
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

      updatePosts((current) =>
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

      updatePosts((current) =>
        current.map((item) =>
          item.id === post.id ? { ...item, isSaved: status.saved } : item,
        ),
      );
    } catch (requestError) {
      window.alert(getErrorMessage(requestError));
    }
  }

  return (
    <>
      <Head>
        <title>Diễn đàn | Bakers Marketplace</title>
      </Head>

      <div className='mx-auto max-w-3xl'>
        <h1 className='mb-4 text-2xl font-bold'>Diễn đàn</h1>

        <form key={searchKey} onSubmit={handleSearchSubmit} className='mb-4 flex flex-wrap gap-2'>
          <input
            name='q'
            defaultValue={q}
            placeholder='Từ khoá (vd: banh)'
            className='border px-2 py-1'
          />
          <input
            name='tag'
            defaultValue={tag}
            placeholder='Tag (vd: hoi-dap)'
            className='border px-2 py-1'
          />
          <button type='submit' className='border px-3 py-1'>
            Tìm
          </button>
          {isSearching && (
            <button type='button' onClick={() => applySearch({})} className='border px-3 py-1'>
              Xoá tìm kiếm
            </button>
          )}
        </form>

        {isSearching && (
          <p className='mb-4 text-sm'>
            Đang tìm: {q && <b>&quot;{q}&quot; </b>}
            {tag && <b>#{tag}</b>}
          </p>
        )}

        {isLoading ? (
          <p>Đang tải...</p>
        ) : current.error ? (
          <p className='text-red-600'>Lỗi: {current.error}</p>
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
                    {toExcerpt(stripRecipeToken(post.content))}
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
                      {post.tags.map((postTag) => (
                        <button
                          key={postTag.id}
                          type='button'
                          onClick={() => applySearch({ tag: postTag.name })}
                          className='text-blue-700 underline'
                        >
                          #{postTag.name}
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
              {current.cursor ? (
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
      </div>
    </>
  );
}
