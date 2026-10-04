import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type BadgeProps = Readonly<{
  children: ReactNode;
  tone?: 'secondary' | 'highlight' | 'light';
  className?: string;
}>;

const TONES = {
  secondary: 'bg-secondary text-on-secondary',
  highlight: 'bg-highlight text-ink',
  light: 'bg-page/80 text-ink',
} as const;

// Nhãn nhỏ viết hoa, ví dụ độ khó "NÂNG CAO" trên ảnh công thức.
export default function Badge({
  children,
  tone = 'secondary',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-micro font-medium uppercase',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
