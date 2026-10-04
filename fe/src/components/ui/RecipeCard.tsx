import Link from 'next/link';

import { cn } from '@/lib/cn';

import Badge from './Badge';
import Icon from './Icon';
import ImagePlaceholder from './ImagePlaceholder';
import RatingStars from './RatingStars';

// Chỉ `id` và `title` là bắt buộc: trường nào không có dữ liệu thì phần đó tự ẩn.
export type RecipeCardData = {
  id: string;
  title: string;
  href?: string;
  category?: string;
  description?: string;
  author?: string;
  // Ngày đăng đã định dạng (ví dụ "12/09/2026").
  postedAt?: string;
  duration?: string;
  servings?: string;
  level?: string;
  rating?: number;
  ratingCount?: number;
};

type RecipeCardProps = Readonly<{
  recipe: RecipeCardData;
  href?: string;
  saved?: boolean;
  // Ẩn nút lưu khi tính năng lưu công thức chưa có.
  savable?: boolean;
  className?: string;
}>;

// Thẻ công thức: ảnh + badge + nút lưu, danh mục, tên món, mô tả, sao, tác giả, thời gian.
export default function RecipeCard({
  recipe,
  href,
  saved = false,
  savable = true,
  className,
}: RecipeCardProps) {
  const meta = recipe.author ?? recipe.postedAt;
  const quickFact = recipe.duration
    ? { icon: 'clock' as const, text: recipe.duration }
    : recipe.servings
      ? { icon: 'users' as const, text: recipe.servings }
      : null;

  return (
    <article
      className={cn(
        'group relative flex flex-col gap-2 bg-page p-2 shadow-card transition-transform focus-within:-translate-y-0.5 hover:-translate-y-0.5',
        className,
      )}
    >
      <div className='relative'>
        <ImagePlaceholder
          label={`Ảnh món ${recipe.title}`}
          className='aspect-355/272 w-full rounded-media'
        />
        {recipe.level && (
          <Badge className='absolute top-3 left-2.5'>{recipe.level}</Badge>
        )}
        {savable && (
          <button
            type='button'
            aria-label={saved ? 'Bỏ lưu công thức' : 'Lưu công thức'}
            aria-pressed={saved}
            className='absolute top-1.5 right-1 z-10 grid size-9 place-items-center rounded-full text-ink outline-none hover:bg-page/60 focus-visible:ring-2 focus-visible:ring-accent'
          >
            <Icon
              name='bookmark'
              className={cn('size-6', saved && 'text-primary')}
            />
          </button>
        )}
      </div>

      <div className='flex flex-1 flex-col px-0.5 pb-1'>
        {recipe.category && (
          <p className='text-caption font-medium text-ink-muted uppercase'>
            {recipe.category}
          </p>
        )}
        <h3 className='truncate text-h3 font-medium text-ink'>
          <Link
            href={href ?? recipe.href ?? '/mockup/recipe'}
            className='outline-none after:absolute after:inset-0 focus-visible:underline'
          >
            {recipe.title}
          </Link>
        </h3>
        {recipe.description && (
          <p className='mt-0.5 line-clamp-2 text-caption font-light text-ink-muted'>
            {recipe.description}
          </p>
        )}
        <div className='mt-auto flex items-end justify-between gap-2 pt-1'>
          <div className='flex flex-col'>
            {recipe.rating !== undefined && (
              <RatingStars value={recipe.rating} count={recipe.ratingCount} />
            )}
            {meta && <p className='text-meta text-ink-muted uppercase'>{meta}</p>}
          </div>
          {quickFact && (
            <p className='inline-flex items-center gap-1 text-caption font-light text-ink-muted'>
              <Icon name={quickFact.icon} className='size-3.5' />
              {quickFact.text}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

// Khung giữ chỗ khi đang tải, cùng hình khối với thẻ thật.
export function RecipeCardSkeleton() {
  return (
    <div aria-hidden className='flex flex-col gap-2 bg-page p-2 shadow-card'>
      <div className='aspect-355/272 w-full animate-pulse rounded-media bg-media' />
      <div className='flex flex-col gap-2 px-0.5 pt-1 pb-2'>
        <div className='h-6 w-3/4 animate-pulse rounded-media bg-surface-soft' />
        <div className='h-4 w-full animate-pulse rounded-media bg-surface-soft' />
        <div className='h-3 w-1/3 animate-pulse rounded-media bg-surface-soft' />
      </div>
    </div>
  );
}
