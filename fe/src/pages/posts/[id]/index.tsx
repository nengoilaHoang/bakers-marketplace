import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';

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
      await router.push('/posts/mine');
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
      <ul className={parentId ? 'mt-2 ml-6 space-y-2 border-l pl-3' : 'space-y-3'}>
        {items.map((comment) => {
          const canDelete = Boolean(
            currentUser &&
              (comment.userId === currentUser.id || post?.authorId === currentUser.id),
          );

          return (
            <li key={comment.id}>
              <p className='text-sm text-gray-600'>
                <b>{comment.author?.displayName ?? 'Người dùng đã xoá'}</b> ·{' '}
                {new Date(comment.createdAt).toLocaleString('vi-VN')}
              </p>
              <p className='whitespace-pre-line'>{comment.content}</p>

              <div className='flex gap-3 text-sm underline'>
                <button
                  type='button'
                  onClick={() => {
                    setReplyToId(replyToId === comment.id ? null : comment.id);
                    setReplyInput('');
                  }}
                >
                  Trả lời
                </button>
                {canDelete && (
                  <button
                    type='button'
                    onClick={() => void handleDeleteComment(comment.id)}
                    className='text-red-600'
                  >
                    Xoá
                  </button>
                )}
              </div>

              {replyToId === comment.id && (
                <form
                  onSubmit={(event) => void handleReplySubmit(event, comment.id)}
                  className='mt-2 flex gap-2'
                >
                  <input
                    value={replyInput}
                    onChange={(event) => setReplyInput(event.target.value)}
                    placeholder={`Trả lời ${comment.author?.displayName ?? ''}...`}
                    className='flex-1 border px-2 py-1'
                  />
                  <button type='submit' className='border px-3 py-1'>
                    Gửi
                  </button>
                </form>
              )}

              {renderComments(comment.id)}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <>
      <Head>
        <title>{post ? post.title : 'Bài viết'}</title>
      </Head>

      <main className='mx-auto max-w-3xl p-4'>
        <Link href='/posts' className='text-sm underline'>
          ← Quay lại danh sách
        </Link>

        {isLoading ? (
          <p className='mt-4'>Đang tải...</p>
        ) : error ? (
          <p className='mt-4 text-red-600'>Lỗi: {error}</p>
        ) : post ? (
          <>
            <article className='mt-4 border p-4'>
              <h1 className='text-2xl font-bold'>{post.title}</h1>
              <p className='text-sm text-gray-600'>
                {post.author?.displayName ?? 'Người dùng đã xoá'} ·{' '}
                {new Date(post.createdAt).toLocaleString('vi-VN')}
                {post.updatedAt !== post.createdAt && ' · đã chỉnh sửa'}
              </p>

              <p className='mt-3 whitespace-pre-line'>{post.content}</p>

              {post.recipe && (
                <p className='mt-3'>
                  Công thức đính kèm:{' '}
                  <Link href={`/recipes/${post.recipe.id}`} className='underline'>
                    {post.recipe.title}
                  </Link>
                </p>
              )}

              {post.tags.length > 0 && (
                <p className='mt-2 text-sm text-blue-700'>
                  {post.tags.map((tag) => `#${tag.name}`).join(' ')}
                </p>
              )}

              <div className='mt-3 flex flex-wrap gap-2 text-sm'>
                <button
                  type='button'
                  onClick={() => void handleToggleLike()}
                  className='border px-2 py-1'
                >
                  {post.isLiked ? '♥ Bỏ thích' : '♡ Thích'} ({post.likeCount})
                </button>
                <button
                  type='button'
                  onClick={() => void handleToggleSave()}
                  className='border px-2 py-1'
                >
                  {post.isSaved ? 'Bỏ lưu' : 'Lưu'}
                </button>
                {isOwner && (
                  <>
                    <Link href={`/posts/${post.id}/edit`} className='border px-2 py-1'>
                      Sửa
                    </Link>
                    <button
                      type='button'
                      onClick={() => void handleDeletePost()}
                      className='border px-2 py-1 text-red-600'
                    >
                      Xoá bài
                    </button>
                  </>
                )}
              </div>
            </article>

            {!isOwner && currentUser && (
              <section className='mt-4 border p-4'>
                <h2 className='font-semibold'>Báo cáo bài viết</h2>
                <form onSubmit={handleReportSubmit} className='mt-2 flex gap-2'>
                  <input
                    value={reportReason}
                    onChange={(event) => setReportReason(event.target.value)}
                    placeholder='Lý do (vd: spam, sai thông tin...)'
                    className='flex-1 border px-2 py-1'
                  />
                  <button type='submit' className='border px-3 py-1'>
                    Gửi báo cáo
                  </button>
                </form>
                {reportMessage && <p className='mt-2 text-sm'>{reportMessage}</p>}
              </section>
            )}

            <section className='mt-4 border p-4'>
              <h2 className='mb-3 font-semibold'>Bình luận ({post.commentCount})</h2>

              <form onSubmit={handleCommentSubmit} className='mb-4 flex gap-2'>
                <input
                  value={commentInput}
                  onChange={(event) => setCommentInput(event.target.value)}
                  placeholder='Viết bình luận...'
                  className='flex-1 border px-2 py-1'
                />
                <button type='submit' className='border px-3 py-1'>
                  Gửi
                </button>
              </form>

              {comments.length === 0 ? (
                <p className='text-sm text-gray-600'>Chưa có bình luận nào.</p>
              ) : (
                renderComments(null)
              )}
            </section>
          </>
        ) : null}
      </main>
    </>
  );
}
