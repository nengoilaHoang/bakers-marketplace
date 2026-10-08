import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type ContainerProps = Readonly<{
  // page: 1216px (lưới 4 thẻ). content: 1064px (bài chi tiết). narrow: 992px (form).
  size?: 'page' | 'content' | 'narrow';
  as?: 'div' | 'section' | 'article';
  className?: string;
  children: ReactNode;
}>;

const SIZES = {
  page: 'max-w-page',
  content: 'max-w-content',
  narrow: 'max-w-narrow',
} as const;

// Căn giữa nội dung với lề hai bên chuẩn.
export default function Container({
  size = 'page',
  as: Tag = 'div',
  className,
  children,
}: ContainerProps) {
  return (
    <Tag className={cn('mx-auto w-full px-4 sm:px-6', SIZES[size], className)}>
      {children}
    </Tag>
  );
}
