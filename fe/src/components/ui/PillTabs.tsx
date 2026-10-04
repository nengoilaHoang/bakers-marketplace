import Link from 'next/link';

import { cn } from '@/lib/cn';

export type PillTab = { label: string; href: string; active?: boolean };

type PillTabsProps = Readonly<{
  items: PillTab[];
  label: string;
  className?: string;
}>;

// Tab dạng viên thuốc lớn (trang hồ sơ).
export default function PillTabs({ items, label, className }: PillTabsProps) {
  return (
    <nav aria-label={label} className={className}>
      <ul className='flex flex-wrap gap-3'>
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.active ? 'page' : undefined}
              className={cn(
                'inline-flex h-13 min-w-44 items-center justify-center rounded-full px-8 text-lead font-medium shadow-header transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent',
                item.active
                  ? 'bg-primary text-on-primary'
                  : 'bg-primary-soft text-ink hover:bg-primary-soft/80',
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
