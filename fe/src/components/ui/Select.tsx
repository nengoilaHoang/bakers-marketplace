import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

import Icon from './Icon';

type SelectProps = Omit<ComponentProps<'select'>, 'size'> & {
  // filter: viền accent (bộ lọc tìm kiếm). plain: không viền (sắp xếp).
  tone?: 'filter' | 'plain';
  wrapperClassName?: string;
};

// Select gốc của trình duyệt (dễ truy cập) được tạo kiểu theo design system.
export default function Select({
  tone = 'filter',
  className,
  wrapperClassName,
  children,
  ...props
}: SelectProps) {
  return (
    <div className={cn('relative inline-flex', wrapperClassName)}>
      <select
        className={cn(
          'h-11 w-full cursor-pointer appearance-none rounded-control bg-field pr-9 pl-3 text-lead font-medium text-ink outline-none',
          'focus-visible:ring-2 focus-visible:ring-accent/50',
          tone === 'filter' ? 'border border-accent' : 'border border-transparent',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <Icon
        name='chevron-down'
        className='pointer-events-none absolute top-1/2 right-2.5 size-5 -translate-y-1/2 text-ink'
      />
    </div>
  );
}
