import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import Icon, { type IconName } from './Icon';

type EmptyStateProps = Readonly<{
  title: string;
  description?: ReactNode;
  icon?: IconName;
  // Một nút/link hành động (ví dụ "Tạo công thức mới").
  action?: ReactNode;
  className?: string;
}>;

// Trạng thái rỗng: khung nét đứt accent, icon lớn, mô tả ngắn, một hành động.
export default function EmptyState({
  title,
  description,
  icon = 'notebook',
  action,
  className,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        'flex flex-col items-center gap-3 rounded-box border-2 border-dashed border-accent px-6 py-12 text-center',
        className,
      )}
    >
      <Icon name={icon} strokeWidth={1.25} className='size-14 text-ink-subtle' />
      <h2 className='text-lead font-semibold text-ink'>{title}</h2>
      {description && (
        <p className='max-w-md text-body-sm text-ink-muted'>{description}</p>
      )}
      {action && <div className='mt-2'>{action}</div>}
    </section>
  );
}
