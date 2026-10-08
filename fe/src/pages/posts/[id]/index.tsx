import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import Alert from '@/components/ui/Alert';
import Avatar from '@/components/ui/Avatar';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button, { ButtonLink } from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import Field from '@/components/ui/Field';
import Icon from '@/components/ui/Icon';
import Input, { Textarea } from '@/components/ui/Input';
import PageTitle from '@/components/ui/PageTitle';
import { ApiError } from '@/lib/api';
import {
  createPostComment,
  deletePost,
  deletePostComment,
  getCurrentUser,
  getPostById,
  getPostComments,
  likePost,
  reportPost,
  savePost,
  unlikePost,
  unsavePost,
} from '@/services/posts';
import type { Post, PostComment, SessionUser } from '@/types/post';
import { formatDateTime } from '@/utils/format';
import { stripRecipeToken } from '@/utils/postContent';

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

export default function PostDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [commentInput, setCommentInput] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportMessage, setReportMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady || !id) return;

    let ignore = false;

    async function loadPost(postId: string) {
      try {
        // Lấy user trước để làm mới token (nếu cần), nhờ vậy isLiked/isSaved đúng
        const user = await getCurrentUser().catch(() => null);
        const [loadedPost, loadedComments] = await Promise.all([
          getPostById(postId),
          getPostComments(postId),
        ]);

        if (!ignore) {
          setCurrentUser(user);
          setPost(loadedPost);
          setComments(loadedComments);
          setError(null);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(
            requestError instanceof ApiError && requestError.status === 404
              ? 'Không tìm thấy bài viết.'
              : getErrorMessage(requestError),
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadPost(id);

    return () => {
      ignore = true;
    };
  }, [id, router.isReady]);

  async function reloadComments(postId: string) {
    const loadedComments = await getPostComments(postId);

    setComments(loadedComments);
    setPost((current) =>
      current ? { ...current, commentCount: loadedComments.length } : current,
    );
  }

  async function handleToggleLike() {
    if (!post) return;

    // Khách: chuyển sang đăng nhập rồi quay lại bài viết này
    if (!currentUser) {
      void router.push({ pathname: '/authen/login', query: { next: router.asPath } });
      return;
    }

    try {
      const status = post.isLiked
        ? await unlikePost(post.id)
        : await likePost(post.id);

      setPost({ ...post, isLiked: status.liked, likeCount: status.likeCount });
    } catch (requestError) {
      window.alert(getErrorMessage(requestError));
    }
  }

  async function handleToggleSave() {
    if (!post) return;

    // Khách: chuyển sang đăng nhập rồi quay lại bài viết này
    if (!currentUser) {
      void router.push({ pathname: '/authen/login', query: { next: router.asPath } });
      return;
    }

    try {
      const status = post.isSaved
        ? await unsavePost(post.id)
        : await savePost(post.id);

      setPost({ ...post, isSaved: status.saved });
    } catch (requestError) {
      window.alert(getErrorMessage(requestError));
    }
  }

  async function handleDeletePost() {
    if (!post || !window.confirm('Xoá bài viết này?')) return;

    try {
      await deletePost(post.id);
      await router.push('/me');
    } catch (requestError) {
      window.alert(getErrorMessage(requestError));
    }
  }

  async function handleReportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!post || !reportReason.trim()) return;

    try {
      await reportPost(post.id, reportReason.trim());
      setReportReason('');
      setReportMessage('Đã gửi báo cáo. Cảm ơn bạn!');
    } catch (requestError) {
      setReportMessage(`Lỗi: ${getErrorMessage(requestError)}`);
    }
  }

  async function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!post || !commentInput.trim()) return;

    try {
      await createPostComment(post.id, commentInput.trim());
      setCommentInput('');
      await reloadComments(post.id);
    } catch (requestError) {
      window.alert(getErrorMessage(requestError));
    }
  }

  async function handleReplySubmit(
    event: FormEvent<HTMLFormElement>,
    parentCommentId: string,
  ) {
    event.preventDefault();
    if (!post || !replyInput.trim()) return;

    try {
      await createPostComment(post.id, replyInput.trim(), parentCommentId);
      setReplyInput('');
      setReplyToId(null);
      await reloadComments(post.id);
    } catch (requestError) {
      window.alert(getErrorMessage(requestError));
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!post || !window.confirm('Xoá bình luận này? Các trả lời bên dưới cũng bị xoá.')) {
      return;
    }

    try {
      await deletePostComment(post.id, commentId);
      await reloadComments(post.id);
    } catch (requestError) {
      window.alert(getErrorMessage(requestError));
    }
  }

  const isOwner = Boolean(post && currentUser && post.authorId === currentUser.id);

  // Gom comment theo comment cha để hiển thị dạng cây (null = comment gốc)
  const commentsByParentId = new Map<string | null, PostComment[]>();
  for (const comment of comments) {
    const siblings = commentsByParentId.get(comment.parentCommentId) ?? [];
    siblings.push(comment);
    commentsByParentId.set(comment.parentCommentId, siblings);
  }

  function renderComments(parentId: string | null): ReactNode {
    const items = commentsByParentId.get(parentId) ?? [];

    if (items.length === 0) return null;

    return (
      <ul
        className={
          parentId
            ? 'mt-2 flex flex-col border-l-2 border-line pl-4'
            : 'divide-y divide-line border-b border-line'
        }
      >
        {items.map((comment) => {
          const authorName = comment.author?.displayName ?? 'Người dùng đã xoá';
          const canDelete = Boolean(
            currentUser &&
              (comment.userId === currentUser.id || post?.authorId === currentUser.id),
          );

          return (
            <li key={comment.id} className={parentId ? 'py-3' : 'py-6'}>
              <div className='flex gap-4'>
                <Avatar size='sm' label={`Ảnh đại diện ${authorName}`} />
                <div className='flex min-w-0 flex-1 flex-col gap-2 pt-1'>
                  <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
                    <p className='text-lead font-semibold text-ink'>{authorName}</p>
                    <time
                      dateTime={comment.createdAt}
                      className='ml-auto text-meta font-medium text-ink-muted'
                    >
                      {formatDateTime(comment.createdAt)}
                    </time>
                  </div>
                  <p className='text-body-sm wrap-break-word whitespace-pre-line text-ink-muted'>
                    {comment.content}
                  </p>

                  {(currentUser || canDelete) && (
                    <div className='flex items-center gap-4 text-body-sm text-ink'>
                      {currentUser && (
                        <button
                          type='button'
                          aria-expanded={replyToId === comment.id}
                          onClick={() => {
                            setReplyToId(replyToId === comment.id ? null : comment.id);
                            setReplyInput('');
                          }}
                          className='inline-flex items-center gap-1.5 rounded-control outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent'
                        >
                          <Icon name='reply' className='size-4' />
                          Trả lời
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type='button'
                          onClick={() => void handleDeleteComment(comment.id)}
                          className='inline-flex items-center gap-1.5 rounded-control text-danger-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent'
                        >
                          <Icon name='trash' className='size-4' />
                          Xoá
                        </button>
                      )}
                    </div>
                  )}

                  {replyToId === comment.id && (
                    <form
                      onSubmit={(event) => void handleReplySubmit(event, comment.id)}
                      className='flex flex-col gap-2 sm:flex-row'
                    >
                      <Input
                        aria-label={`Trả lời ${authorName}`}
                        size='sm'
                        autoFocus
                        value={replyInput}
                        onChange={(event) => setReplyInput(event.target.value)}
                        placeholder={`Trả lời ${authorName}...`}
                      />
                      <Button type='submit' disabled={!replyInput.trim()}>
                        Gửi
                      </Button>
                    </form>
                  )}

                  {renderComments(comment.id)}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <>
      <PageTitle title={post?.title ?? 'Bài viết'} />

      <Container size='content' className='pt-6 pb-20'>
        <Breadcrumb
          className='-ml-2'
          items={[{ label: 'Diễn đàn', href: '/' }, { label: post?.title ?? 'Bài viết' }]}
        />

        {isLoading ? (
          <div role='status' aria-label='Đang tải bài viết' className='mt-4 flex flex-col gap-4 motion-safe:animate-pulse'>
            <div className='h-10 w-2/3 rounded-media bg-surface-soft' />
            <div className='h-4 w-48 rounded-media bg-surface-soft' />
            <div className='mt-6 h-4 w-full rounded-media bg-surface-soft' />
            <div className='h-4 w-5/6 rounded-media bg-surface-soft' />
            <div className='h-4 w-3/4 rounded-media bg-surface-soft' />
          </div>
        ) : error ? (
          <EmptyState
            icon='search'
            className='mt-8'
            title={error}
            action={<ButtonLink href='/'>Về diễn đàn</ButtonLink>}
          />
        ) : post ? (
          <>
            <article>
              <h1 className='mt-4 text-h1 font-semibold wrap-break-word text-ink'>{post.title}</h1>
              <p className='mt-1 flex flex-wrap items-center gap-x-2.5 text-caption font-light text-ink'>
                <span>
                  Bởi{' '}
                  <span className='text-body-sm font-normal text-ink-muted uppercase'>
                    {post.author?.displayName ?? 'Người dùng đã xoá'}
                  </span>
                </span>
                <time dateTime={post.createdAt}>{formatDateTime(post.createdAt)}</time>
                {post.updatedAt !== post.createdAt && <span>· đã chỉnh sửa</span>}
              </p>

              <div className='mt-7 flex flex-wrap items-center justify-between gap-4'>
                <div className='flex flex-wrap gap-3'>
                  <Button
                    variant='outline'
                    aria-pressed={post.isLiked}
                    onClick={() => void handleToggleLike()}
                    className='uppercase'
                  >
                    <Icon
                      name='heart'
                      fill={post.isLiked ? 'currentColor' : 'none'}
                      className={post.isLiked ? 'size-5 text-accent-strong' : 'size-5'}
                    />
                    {post.isLiked ? 'Đã thích' : 'Thích'} · {post.likeCount}
                  </Button>
                  <Button
                    variant='outline'
                    aria-pressed={post.isSaved}
                    onClick={() => void handleToggleSave()}
                    className='uppercase'
                  >
                    <Icon
                      name='bookmark'
                      fill={post.isSaved ? 'currentColor' : 'none'}
                      className={post.isSaved ? 'size-5 text-primary' : 'size-5'}
                    />
                    {post.isSaved ? 'Đã lưu' : 'Lưu'}
                  </Button>
                </div>
                {isOwner && (
                  <div className='flex flex-wrap gap-3'>
                    <ButtonLink href={`/posts/${post.id}/edit`} variant='ghost'>
                      <Icon name='edit' className='size-5' />
                      Sửa
                    </ButtonLink>
                    <Button variant='ghost' onClick={() => void handleDeletePost()}>
                      <Icon name='trash' className='size-5' />
                      Xoá bài
                    </Button>
                  </div>
                )}
              </div>

              <div className='mt-10 text-body wrap-break-word whitespace-pre-line text-ink-muted'>
                {stripRecipeToken(post.content)}
              </div>

              {post.recipe && (
                <section className='mt-10 flex flex-col items-start gap-4 rounded-panel bg-highlight px-6 py-5 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='flex items-center gap-3'>
                    <Icon name='chef-hat' strokeWidth={1.5} className='size-10 text-primary' />
                    <div>
                      <p className='text-meta text-ink-muted uppercase'>Công thức đính kèm</p>
                      <p className='text-h5 font-medium text-ink'>{post.recipe.title}</p>
                    </div>
                  </div>
                  <ButtonLink href={`/recipes/${encodeURIComponent(post.recipe.id)}`}>
                    Xem công thức
                  </ButtonLink>
                </section>
              )}

              {post.tags.length > 0 && (
                <section className='mt-10'>
                  <h2 className='text-h3 font-medium text-ink'>Tag</h2>
                  <ul className='mt-4 flex flex-wrap gap-3.5'>
                    {post.tags.map((tag) => (
                      <li key={tag.id}>
                        <Chip href={{ pathname: '/', query: { tag: tag.name } }}>#{tag.name}</Chip>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </article>

            <section
              id='comments'
              aria-labelledby='comments-title'
              className='mt-12 flex scroll-mt-8 flex-col gap-3 border-2 border-ink px-1 pb-6'
            >
              <h2 id='comments-title' className='px-2.5 pt-2 text-h3 font-medium text-ink'>
                Bình luận ({post.commentCount})
              </h2>

              {currentUser ? (
                <form
                  onSubmit={handleCommentSubmit}
                  className='flex flex-col gap-4 bg-surface-soft px-4 py-6 sm:px-8'
                >
                  <Field label='Bình luận của bạn' htmlFor='comment-input'>
                    <Textarea
                      id='comment-input'
                      rows={3}
                      value={commentInput}
                      onChange={(event) => setCommentInput(event.target.value)}
                      placeholder='Chia sẻ cảm nhận hoặc câu hỏi của bạn...'
                    />
                  </Field>
                  <Button type='submit' className='self-start' disabled={!commentInput.trim()}>
                    Gửi bình luận
                  </Button>
                </form>
              ) : (
                <p className='bg-surface-soft px-4 py-6 text-body-sm text-ink sm:px-8'>
                  <Link
                    href={{ pathname: '/authen/login', query: { next: `/posts/${post.id}` } }}
                    className='rounded-control font-medium underline decoration-accent underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-accent'
                  >
                    Đăng nhập
                  </Link>{' '}
                  để tham gia bình luận.
                </p>
              )}

              <div className='px-4'>
                {comments.length === 0 ? (
                  <p className='py-6 text-body-sm font-light text-ink-muted'>Chưa có bình luận nào.</p>
                ) : (
                  renderComments(null)
                )}
              </div>
            </section>

            {!isOwner && currentUser && (
              <details className='mt-8 rounded-box border border-line px-5 py-4'>
                <summary className='flex cursor-pointer list-none items-center gap-2 rounded-control text-body-sm text-ink-muted outline-none focus-visible:ring-2 focus-visible:ring-accent'>
                  <Icon name='flag' className='size-4' />
                  Báo cáo bài viết
                </summary>
                <form onSubmit={handleReportSubmit} className='mt-4 flex flex-col gap-3 sm:flex-row'>
                  <Input
                    aria-label='Lý do báo cáo'
                    size='sm'
                    value={reportReason}
                    onChange={(event) => setReportReason(event.target.value)}
                    placeholder='Lý do (vd: spam, sai thông tin...)'
                  />
                  <Button type='submit' variant='outline' disabled={!reportReason.trim()}>
                    Gửi báo cáo
                  </Button>
                </form>
                {reportMessage && (
                  <Alert tone={reportMessage.startsWith('Lỗi') ? 'danger' : 'success'} className='mt-3'>
                    {reportMessage}
                  </Alert>
                )}
              </details>
            )}
          </>
        ) : null}
      </Container>
    </>
  );
}

PostDetailPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
