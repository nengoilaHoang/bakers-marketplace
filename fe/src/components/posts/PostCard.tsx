import Link from 'next/link';

import Chip from '@/components/ui/Chip';
import Icon from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import type { Post } from '@/types/post';
import { formatDate } from '@/utils/format';
import { stripRecipeToken } from '@/utils/postContent';

type PostCardProps = Readonly<{
  post: Post;
  // Không truyền → chỉ hiện số lượt thích, không có nút (ví dụ trên landing).
  onToggleLike?: (post: Post) => void;
  onToggleSave?: (post: Post) => void;
  className?: string;
}>;

const ACTION_CLASSES =
  'inline-flex items-center gap-1.5 rounded-full px-2 py-1 outline-none hover:bg-ink/5 focus-visible:ring-2 focus-visible:ring-accent';

// Thẻ bài viết diễn đàn: khung viền mực kiểu sổ tay, tác giả · ngày, tiêu đề, trích đoạn, tag, tương tác.
export default function PostCard({ post, onToggleLike, onToggleSave, className }: PostCardProps) {
  const href = `/posts/${post.id}`;
  const postedAt = formatDate(post.createdAt);

  return (
    <article className={cn('flex flex-col gap-3 border border-ink bg-page px-5 py-6 sm:px-8', className)}>
      <p className='text-meta font-medium text-ink-muted uppercase'>
        {post.author?.displayName ?? 'Người dùng đã xoá'}
        {postedAt && (
          <>
            <span aria-hidden> · </span>
            <time dateTime={post.createdAt}>{postedAt}</time>
          </>
        )}
      </p>
      <h2 className='text-h4 font-medium text-ink'>
        <Link
          href={href}
          className='rounded-control outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent'
        >
          {post.title}
        </Link>
      </h2>
      <p className='line-clamp-3 text-body-sm font-light whitespace-pre-line text-ink-muted'>
        {stripRecipeToken(post.content)}
      </p>

      {post.recipe && (
        <Link
          href={`/recipes/${encodeURIComponent(post.recipe.id)}`}
          className='inline-flex w-fit items-center gap-2 rounded-full bg-highlight px-4 py-1.5 text-caption text-ink outline-none hover:bg-highlight-soft focus-visible:ring-2 focus-visible:ring-accent'
        >
          <Icon name='chef-hat' className='size-4' />
          Công thức: {post.recipe.title}
        </Link>
      )}

      {post.tags.length > 0 && (
        <ul aria-label='Tag' className='flex flex-wrap gap-2'>
          {post.tags.map((tag) => (
            <li key={tag.id}>
              <Chip size='sm' href={{ pathname: '/', query: { tag: tag.name } }}>
                #{tag.name}
              </Chip>
            </li>
          ))}
        </ul>
      )}

      <div className='mt-1 flex items-center justify-between gap-4 border-t border-line pt-3 text-caption text-ink'>
        <div className='-ml-2 flex items-center gap-2'>
          {onToggleLike ? (
            <button
              type='button'
              aria-pressed={post.isLiked}
              aria-label={`${post.isLiked ? 'Bỏ thích' : 'Thích'} · ${post.likeCount} lượt thích`}
              onClick={() => onToggleLike(post)}
              className={ACTION_CLASSES}
            >
              <Icon
                name='heart'
                fill={post.isLiked ? 'currentColor' : 'none'}
                className={cn('size-4.5', post.isLiked && 'text-accent-strong')}
              />
              {post.likeCount}
            </button>
          ) : (
            <span className='inline-flex items-center gap-1.5 px-2 py-1'>
              <Icon name='heart' className='size-4.5' />
              {post.likeCount}
              <span className='sr-only'>lượt thích</span>
            </span>
          )}
          <Link href={`${href}#comments`} className={ACTION_CLASSES}>
            <Icon name='message' className='size-4.5' />
            {post.commentCount}
            <span className='sr-only'>bình luận</span>
          </Link>
        </div>
        {onToggleSave && (
          <button
            type='button'
            aria-pressed={post.isSaved}
            onClick={() => onToggleSave(post)}
            className={cn(ACTION_CLASSES, '-mr-2 uppercase')}
          >
            <Icon
              name='bookmark'
              fill={post.isSaved ? 'currentColor' : 'none'}
              className={cn('size-4.5', post.isSaved && 'text-primary')}
            />
            {post.isSaved ? 'Đã lưu' : 'Lưu'}
          </button>
        )}
      </div>
    </article>
  );
}

// Khung giữ chỗ khi đang tải bài viết.
export function PostCardSkeleton() {
  return (
    <div aria-hidden className='flex flex-col gap-3 border border-line bg-page px-5 py-6 motion-safe:animate-pulse sm:px-8'>
      <div className='h-3 w-40 rounded-media bg-surface-soft' />
      <div className='h-6 w-3/4 rounded-media bg-surface-soft' />
      <div className='h-4 w-full rounded-media bg-surface-soft' />
      <div className='h-4 w-5/6 rounded-media bg-surface-soft' />
    </div>
  );
}
