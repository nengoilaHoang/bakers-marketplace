import { useRouter } from 'next/router';

import PostCard, { PostCardSkeleton } from '@/components/posts/PostCard';
import Button, { ButtonLink } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import PageTitle from '@/components/ui/PageTitle';
import SearchBar from '@/components/ui/SearchBar';
import {
  getFeedPostElementId,
  useBidirectionalPosts,
} from '@/hooks/useBidirectionalPosts';
import {
  likePost,
  savePost,
  unlikePost,
  unsavePost,
} from '@/services/posts';
import type { Post, PostSearchParams } from '@/types/post';

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

function readQueryValue(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value : '';
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
  const {
    posts,
    isInitialLoading,
    isLoadingNewer,
    isLoadingOlder,
    initialError,
    newerError,
    olderError,
    hasMoreNewer,
    hasMoreOlder,
    topSentinelRef,
    bottomSentinelRef,
    loadNewer,
    loadOlder,
    retryInitial,
    updatePost,
  } = useBidirectionalPosts({ q, tag, enabled: router.isReady });
  const isSearching = Boolean(q || tag);

  function applySearch(nextSearch: PostSearchParams) {
    const query: Record<string, string> = {};
    if (nextSearch.q) query.q = nextSearch.q;
    if (nextSearch.tag) query.tag = nextSearch.tag;

    void router.push({ pathname: '/', query }, undefined, { shallow: true });
  }

  async function handleToggleLike(post: Post) {
    try {
      const status = post.isLiked
        ? await unlikePost(post.id)
        : await likePost(post.id);

      updatePost(
        post.id,
        (item) => ({
          ...item,
          isLiked: status.liked,
          likeCount: status.likeCount,
        }),
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

      updatePost(
        post.id,
        (item) => ({ ...item, isSaved: status.saved }),
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
        {isInitialLoading ? (
          <div role='status' aria-label='Đang tải bài viết' className='flex flex-col gap-7.5'>
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        ) : initialError ? (
          <ErrorState title='Không thể tải bài viết' message={initialError} onRetry={retryInitial} />
        ) : posts.length === 0 ? (
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
            <div
              ref={topSentinelRef}
              className='mb-6 flex min-h-12 flex-col items-center justify-center gap-3 text-center'
              aria-live='polite'
            >
              {isLoadingNewer ? (
                <p className='flex items-center gap-3 text-body-sm text-ink-muted'>
                  <span
                    aria-hidden
                    className='size-5 animate-spin rounded-full border-2 border-line border-t-primary'
                  />
                  Đang kiểm tra bài viết mới...
                </p>
              ) : newerError ? (
                <ErrorState
                  title='Không thể tải bài viết mới'
                  message={newerError}
                  onRetry={() => void loadNewer()}
                  compact
                />
              ) : (
                <Button variant='outline' onClick={() => void loadNewer()}>
                  {hasMoreNewer ? 'Tải tiếp bài viết mới' : 'Kiểm tra bài viết mới'}
                </Button>
              )}
            </div>

            <ul className='flex flex-col gap-7.5'>
              {posts.map((post) => (
                <li key={post.id} id={getFeedPostElementId(post.id)}>
                  <PostCard
                    post={post}
                    onToggleLike={(item) => void handleToggleLike(item)}
                    onToggleSave={(item) => void handleToggleSave(item)}
                  />
                </li>
              ))}
            </ul>

            <div
              ref={bottomSentinelRef}
              className='mt-10 flex min-h-24 flex-col items-center justify-center gap-3 text-center'
              aria-live='polite'
            >
              {isLoadingOlder ? (
                <p className='flex items-center gap-3 text-body-sm text-ink-muted'>
                  <span
                    aria-hidden
                    className='size-5 animate-spin rounded-full border-2 border-line border-t-primary'
                  />
                  Đang tải thêm bài viết...
                </p>
              ) : olderError ? (
                <ErrorState
                  title='Không thể tải thêm bài viết'
                  message={olderError}
                  onRetry={() => void loadOlder()}
                  compact
                />
              ) : hasMoreOlder ? (
                <Button variant='outline' onClick={() => void loadOlder()}>
                  Tải thêm bài viết
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
