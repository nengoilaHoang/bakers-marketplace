import { useEffect, useState } from 'react';

import PostCard, { PostCardSkeleton } from '@/components/posts/PostCard';
import Alert from '@/components/ui/Alert';
import Button, { ButtonLink } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { getSavedPosts, unsavePost } from '@/services/posts';
import type { Post, PostCursor } from '@/types/post';

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

export default function SavedPostsTab() {
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

  if (isLoading) {
    return (
      <div role='status' aria-label='Đang tải bài viết đã lưu' className='flex flex-col gap-7.5'>
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    );
  }

  if (error) return <Alert tone='danger'>{error}</Alert>;

  if (posts.length === 0) {
    return (
      <EmptyState
        icon='bookmark'
        title='Bạn chưa lưu bài viết nào'
        description='Bấm "Lưu" trên bài viết ở diễn đàn để xem lại sau.'
        action={<ButtonLink href='/'>Đến diễn đàn</ButtonLink>}
      />
    );
  }

  return (
    <>
      <ul className='flex flex-col gap-7.5'>
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard post={post} onToggleSave={(item) => void handleUnsave(item)} />
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
