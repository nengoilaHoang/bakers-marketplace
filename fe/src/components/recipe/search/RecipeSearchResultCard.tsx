import Link from 'next/link';

import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/Icon';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import { cn } from '@/lib/cn';
import type { RecipeSearchResult } from '@/types/recipe';

function MatchRow({
  label,
  matched,
  total,
  missing,
}: {
  label: string;
  matched: number;
  total: number;
  missing: string[];
}) {
  const isComplete = missing.length === 0;

  return (
    <div className='rounded-box bg-surface-soft px-3 py-2.5'>
      <div className='flex items-center justify-between gap-3 text-caption'>
        <span className='font-medium text-ink'>{label}</span>
        <span className={isComplete ? 'text-success-strong' : 'text-warning-strong'}>
          {matched}/{total} phù hợp
        </span>
      </div>
      <div className='mt-2 h-1.5 overflow-hidden rounded-full bg-line'>
        <div
          className={cn('h-full rounded-full', isComplete ? 'bg-success' : 'bg-warning')}
          style={{ width: `${total === 0 ? 100 : Math.round((matched / total) * 100)}%` }}
        />
      </div>
      {missing.length > 0 && (
        <p className='mt-2 truncate text-micro font-light text-ink-muted'>
          Thiếu: {missing.join(', ')}
        </p>
      )}
    </div>
  );
}

export default function RecipeSearchResultCard({
  result,
}: {
  result: RecipeSearchResult;
}) {
  const isComplete = result.matchMode === 'complete';

  return (
    <article className='group relative flex h-full flex-col gap-3 bg-page p-2 shadow-card transition-transform focus-within:-translate-y-0.5 hover:-translate-y-0.5'>
      <div className='relative'>
        <ImagePlaceholder
          label={`Ảnh món ${result.title}`}
          className='aspect-video w-full rounded-media'
        />
        <Badge tone={isComplete ? 'secondary' : 'highlight'} className='absolute top-3 left-2.5'>
          {isComplete ? 'Khớp đầy đủ' : 'Khớp linh hoạt'}
        </Badge>
      </div>

      <div className='flex flex-1 flex-col gap-3 px-1.5 pb-2'>
        <div className='flex items-start justify-between gap-3'>
          <h2 className='text-h4 font-medium text-ink'>
            <Link
              href={`/recipes/${encodeURIComponent(result.id)}`}
              className='outline-none after:absolute after:inset-0 focus-visible:underline'
            >
              {result.title}
            </Link>
          </h2>
          {result.portion ? (
            <p className='inline-flex shrink-0 items-center gap-1 pt-1 text-caption font-light text-ink-muted'>
              <Icon name='users' className='size-3.5' />
              {result.portion} phần
            </p>
          ) : null}
        </div>
        <p className='line-clamp-2 text-caption font-light text-ink-muted'>
          {result.description || 'Công thức này chưa có mô tả.'}
        </p>

        <div className='mt-auto grid gap-2 sm:grid-cols-2'>
          <MatchRow label='Nguyên liệu' {...result.ingredientMatch} />
          <MatchRow label='Dụng cụ' {...result.toolMatch} />
        </div>
      </div>
    </article>
  );
}
