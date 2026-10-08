import Link from 'next/link';
import { Fragment } from 'react';

import { cn } from '@/lib/cn';

import Icon from './Icon';

export type BreadcrumbItem = { label: string; href?: string };

type BreadcrumbProps = Readonly<{
  items: BreadcrumbItem[];
  // inverse: đặt trên nền tối.
  tone?: 'default' | 'inverse';
  className?: string;
}>;

export default function Breadcrumb({
  items,
  tone = 'default',
  className,
}: BreadcrumbProps) {
  const color = tone === 'inverse' ? 'text-on-primary/90' : 'text-ink-muted';
  return (
    <nav aria-label='Đường dẫn' className={className}>
      <ol className={cn('flex flex-wrap items-center text-caption', color)}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              <li>
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className='inline-block px-2 py-2 hover:underline'
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    className='inline-block px-2 py-2'
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li aria-hidden className='flex'>
                  <Icon name='chevron-right' className='size-3.5' />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
