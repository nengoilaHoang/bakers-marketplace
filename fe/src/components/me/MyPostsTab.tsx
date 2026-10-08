import Link from 'next/link';
import { useEffect, useState } from 'react';

import Alert from '@/components/ui/Alert';
import Button, { ButtonLink } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Icon from '@/components/ui/Icon';
import { deletePost, getMyPosts } from '@/services/posts';
import type { Post, PostCursor } from '@/types/post';
import { formatDate } from '@/utils/format';

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

export default function MyPostsTab() {
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

  if (isLoading) {
    return (
      <div role='status' aria-label='Đang tải bài viết' className='flex flex-col gap-3 motion-safe:animate-pulse'>
        <div className='h-20 rounded-box bg-surface-soft' />
        <div className='h-20 rounded-box bg-surface-soft' />
        <div className='h-20 rounded-box bg-surface-soft' />
      </div>
    );
  }

  if (error) return <Alert tone='danger'>{error}</Alert>;

  if (posts.length === 0) {
    return (
      <EmptyState
        icon='message'
        title='Bạn chưa có bài viết nào'
        description='Chia sẻ kinh nghiệm hoặc đặt câu hỏi cho cộng đồng.'
        action={<ButtonLink href='/posts/new'>Viết bài đầu tiên</ButtonLink>}
      />
    );
  }

  return (
    <>
      <ul className='divide-y divide-line rounded-panel bg-surface'>
        {posts.map((post) => (
          <li
            key={post.id}
            className='flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8'
          >
            <div className='min-w-0'>
              <Link
                href={`/posts/${post.id}`}
                className='rounded-control text-h5 font-medium text-ink outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent'
              >
                {post.title}
              </Link>
              <p className='mt-1 flex flex-wrap items-center gap-x-3 text-caption font-light text-ink-muted'>
                <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                <span className='inline-flex items-center gap-1'>
                  <Icon name='heart' className='size-3.5' />
                  {post.likeCount}
                  <span className='sr-only'>lượt thích</span>
                </span>
                <span className='inline-flex items-center gap-1'>
                  <Icon name='message' className='size-3.5' />
                  {post.commentCount}
                  <span className='sr-only'>bình luận</span>
                </span>
              </p>
            </div>
            <div className='flex shrink-0 gap-2'>
              <ButtonLink href={`/posts/${post.id}/edit`} variant='outline' size='sm'>
                <Icon name='edit' className='size-4' />
                Sửa
              </ButtonLink>
              <Button variant='ghost' size='sm' onClick={() => void handleDelete(post)}>
                <Icon name='trash' className='size-4' />
                Xoá
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {cursor && (
        <div className='mt-8 flex justify-center'>
          <Button variant='outline' onClick={() => void handleLoadMore()} disabled={isLoadingMore}>
            {isLoadingMore ? 'Đang tải...' : 'Tải thêm'}
          </Button>
        </div>
      )}
    </>
  );
}
