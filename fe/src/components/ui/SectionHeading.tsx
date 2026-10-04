import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import Icon from './Icon';

type SeeMoreLinkProps = Readonly<{
  href: string;
  label?: string;
  className?: string;
}>;

// Link "XEM THÊM ›" viết hoa, chữ mảnh.
export function SeeMoreLink({ href, label = 'Xem thêm', className }: SeeMoreLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex shrink-0 items-center gap-2 pb-1 text-body font-light text-ink-muted uppercase hover:text-ink',
        className,
      )}
    >
      {label}
      <Icon name='chevron-right' className='size-4' />
    </Link>
  );
}

type SectionHeadingProps = Readonly<{
  title: ReactNode;
  // Link "XEM THÊM ›" bên phải tiêu đề.
  actionHref?: string;
  actionLabel?: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}>;

// Tiêu đề section kiểu tạp chí: serif Playfair + link xem thêm viết hoa.
export default function SectionHeading({
  title,
  actionHref,
  actionLabel,
  as: Heading = 'h2',
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('flex items-end justify-between gap-4', className)}>
      <Heading className='font-heading text-h2 font-semibold text-ink'>
        {title}
      </Heading>
      {actionHref && <SeeMoreLink href={actionHref} label={actionLabel} />}
    </div>
  );
}
