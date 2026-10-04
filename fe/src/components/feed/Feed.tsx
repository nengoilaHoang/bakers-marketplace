import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import PostCard, { PostCardSkeleton } from '@/components/posts/PostCard';
import Button, { ButtonLink } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import PageTitle from '@/components/ui/PageTitle';
import SearchBar from '@/components/ui/SearchBar';
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

function readQueryValue(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value : '';
}

function loadPostsPage(search: PostSearchParams, cursor?: PostCursor | null) {
  return search.q || search.tag
    ? searchPosts(search, { cursor })
    : getPosts({ cursor });
}

// "#tag" → lọc theo tag, còn lại → tìm theo từ khoá.
function parseSearchInput(value: string): PostSearchParams {
  if (value.startsWith('#')) return { tag: value.slice(1).trim() };
  return { q: value };
}

export default function Feed() {
  const router = useRouter();
  // Bộ lọc nằm trên URL (/?q=&tag=) để tag ở trang khác có thể dẫn thẳng về bảng tin đã lọc
  const q = readQueryValue(router.query.q);
  const tag = readQueryValue(router.query.tag);
  const searchKey = `${q}\n${tag}`;
  const [result, setResult] = useState<FeedResult | null>(null);
  const [attempt, setAttempt] = useState(0);
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
  }, [q, tag, searchKey, attempt]);

  // Ẩn kết quả của bộ lọc cũ ngay khi URL đổi
  const current = result?.searchKey === searchKey ? result : null;
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

  function retry() {
    setResult(null);
    setAttempt((value) => value + 1);
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

      updatePosts((posts) =>
        posts.map((item) =>
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

      updatePosts((posts) =>
        posts.map((item) =>
          item.id === post.id ? { ...item, isSaved: status.saved } : item,
        ),
      );
    } catch (requestError) {
      window.alert(getErrorMessage(requestError));
    }
  }

  return (
    <>
      <PageTitle title='Diễn đàn' />

      <section className='bg-primary text-on-primary'>
        <Container size='content' className='flex flex-col gap-6 py-10 lg:py-12'>
          <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
            <div>
              <h1 className='font-heading text-h1 font-semibold'>Diễn đàn</h1>
              <p className='mt-2 text-lead font-light text-on-primary/90'>
                Hỏi đáp, chia sẻ kinh nghiệm và công thức cùng cộng đồng làm bánh.
              </p>
            </div>
            <ButtonLink href='/posts/new' variant='outline-inverse' className='self-start sm:self-auto'>
              + Viết bài mới
            </ButtonLink>
          </div>

          <SearchBar
            key={searchKey}
            variant='hero'
            id='feed-search'
            placeholder='Tìm bài viết hoặc #tag'
            defaultValue={q || (tag ? `#${tag}` : '')}
            onSearch={(value) => applySearch(parseSearchInput(value))}
          />

          {isSearching && (
            <p className='flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm'>
              <span>
                Đang lọc: {q && <strong className='font-semibold'>“{q}” </strong>}
                {tag && <strong className='font-semibold'>#{tag}</strong>}
              </span>
              <button
                type='button'
                onClick={() => applySearch({})}
                className='rounded-control underline decoration-accent underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-accent'
              >
                Xoá bộ lọc
              </button>
            </p>
          )}
        </Container>
      </section>

      <Container size='content' className='py-12 lg:py-16'>
        {!current ? (
          <div role='status' aria-label='Đang tải bài viết' className='flex flex-col gap-7.5'>
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        ) : current.error ? (
          <ErrorState title='Không thể tải bài viết' message={current.error} onRetry={retry} />
        ) : current.posts.length === 0 ? (
          <EmptyState
            icon='message'
            title={isSearching ? 'Không có bài viết phù hợp' : 'Chưa có bài viết nào'}
            description={
              isSearching
                ? 'Hãy thử từ khoá khác hoặc xoá bộ lọc.'
                : 'Hãy là người mở đầu cuộc trò chuyện.'
            }
            action={<ButtonLink href='/posts/new'>Viết bài mới</ButtonLink>}
          />
        ) : (
          <>
            <ul className='flex flex-col gap-7.5'>
              {current.posts.map((post) => (
                <li key={post.id}>
                  <PostCard
                    post={post}
                    onToggleLike={(item) => void handleToggleLike(item)}
                    onToggleSave={(item) => void handleToggleSave(item)}
                  />
                </li>
              ))}
            </ul>

            <div className='mt-10 flex justify-center'>
              {current.cursor ? (
                <Button variant='outline' onClick={() => void handleLoadMore()} disabled={isLoadingMore}>
                  {isLoadingMore ? 'Đang tải...' : 'Tải thêm bài viết'}
                </Button>
              ) : (
                <p className='text-body-sm font-light text-ink-muted'>Bạn đã xem hết bài viết.</p>
              )}
            </div>
          </>
        )}
      </Container>
    </>
  );
}
