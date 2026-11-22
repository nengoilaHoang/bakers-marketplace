import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { formatDateTime } from '@/utils/format';

export type TimelineEntry = {
  id: string;
  title: string;
  description?: ReactNode;
  timestamp: string;
};

type TimelineProps = Readonly<{
  entries: TimelineEntry[];
  // Đánh dấu mục đầu danh sách là mốc hiện tại (danh sách xếp mới nhất trước).
  highlightFirst?: boolean;
  className?: string;
}>;

// Dòng thời gian dọc: chấm + tiêu đề + mô tả + thời điểm (lịch sử đơn, hành trình giao hàng).
export default function Timeline({ entries, highlightFirst = false, className }: TimelineProps) {
  return (
    <ol className={cn('flex flex-col', className)}>
      {entries.map((entry, index) => {
        const isCurrent = highlightFirst && index === 0;
        const isLast = index === entries.length - 1;

        return (
          <li key={entry.id} className='relative flex gap-4 pb-5 last:pb-0'>
            {!isLast && <span aria-hidden className='absolute top-4 bottom-0 left-1.5 w-px bg-line' />}
            <span
              aria-hidden
              className={cn(
                'relative mt-1.5 size-3 shrink-0 rounded-full',
                isCurrent ? 'bg-accent ring-4 ring-accent/25' : 'bg-ink-subtle',
              )}
            />
            <div className='flex min-w-0 flex-col gap-0.5'>
              <p className={cn('text-body-sm text-ink', isCurrent && 'font-semibold')}>{entry.title}</p>
              {entry.description && (
                <p className='text-body-sm font-light text-ink-muted'>{entry.description}</p>
              )}
              <p className='text-caption font-light text-ink-muted'>{formatDateTime(entry.timestamp)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
