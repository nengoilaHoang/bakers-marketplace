import Link from 'next/link';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

type ChipProps = ComponentProps<typeof Link> & {
  active?: boolean;
  // sm: tag nhỏ trong thẻ (bài viết, công thức). md: liên kết nhanh cỡ thường.
  size?: 'sm' | 'md';
};

const SIZES = {
  sm: 'px-3 py-0.5 text-caption',
  md: 'px-5 py-1.5 text-body',
} as const;

// Thẻ dạng viên thuốc có thể bấm (tag, liên kết nhanh). Hover: viền accent.
export default function Chip({ active, size = 'md', className, ...props }: ChipProps) {
  return (
    <Link
      className={cn(
        'inline-flex items-center rounded-full border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent',
        SIZES[size],
        active
          ? 'border-secondary bg-secondary text-on-secondary'
          : 'border-border-soft bg-page text-ink-muted hover:border-accent',
        className,
      )}
      {...props}
    />
  );
}
