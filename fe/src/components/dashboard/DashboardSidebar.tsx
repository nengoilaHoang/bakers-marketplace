import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useId, useState } from 'react';

import { cn } from '@/lib/cn';

import Icon, { type IconName } from '@/components/ui/Icon';

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: IconName;
  // Chỉ sáng khi đúng trang này (dùng cho trang tổng quan), mặc định sáng cho cả trang con.
  exact?: boolean;
  inners?: Array<{ label: string; href: string }>;
};

function isActive(pathname: string, item: Pick<DashboardNavItem, 'href' | 'exact'>) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

function SidebarItem({ item, pathname }: { item: DashboardNavItem; pathname: string }) {
  const active = isActive(pathname, item);
  const inners = item.inners ?? [];
  const submenuId = useId();
  const [open, setOpen] = useState(active);

  // Mở sẵn menu con khi đang ở trang thuộc mục này.
  useEffect(() => {
    if (active) queueMicrotask(() => setOpen(true));
  }, [active]);

  return (
    <li className='shrink-0'>
      <div
        className={cn(
          'flex items-center rounded-control text-body-sm transition-colors',
          active
            ? 'bg-secondary-soft font-semibold text-ink'
            : 'text-ink-muted hover:bg-surface-soft hover:text-ink',
        )}
      >
        <Link
          href={item.href}
          aria-current={active ? 'page' : undefined}
          className='flex flex-1 items-center gap-3 rounded-control px-4 py-2.5 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-accent'
        >
          <Icon name={item.icon} className='size-5 shrink-0' />
          {item.label}
        </Link>

        {inners.length > 0 && (
          <button
            type='button'
            aria-expanded={open}
            aria-controls={submenuId}
            aria-label={`${open ? 'Thu gọn' : 'Mở'} mục ${item.label}`}
            onClick={() => setOpen((current) => !current)}
            className={cn(
              'mr-1 hidden rounded-control p-2 text-ink-muted transition-transform duration-200 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent lg:block',
              !open && '-rotate-90',
            )}
          >
            <Icon name='chevron-down' className='size-4' />
          </button>
        )}
      </div>

      {/* Menu con chỉ hiện ở sidebar dọc (từ lg); trên mobile chỉ còn hàng mục chính */}
      {inners.length > 0 && (
        <div
          className={cn(
            'hidden transition-[grid-template-rows] duration-200 ease-out lg:grid',
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <ul
            id={submenuId}
            aria-hidden={!open}
            className='mt-1 ml-6 space-y-0.5 overflow-hidden border-l-2 border-line'
          >
            {inners.map((inner) => {
              const innerActive = pathname === inner.href;

              return (
                <li key={inner.href}>
                  <Link
                    href={inner.href}
                    tabIndex={open ? undefined : -1}
                    aria-current={innerActive ? 'page' : undefined}
                    className={cn(
                      'block rounded-r-control py-2 pl-4 text-body-sm transition-colors',
                      innerActive
                        ? 'bg-surface-soft font-semibold text-ink'
                        : 'text-ink-muted hover:bg-surface-soft hover:text-ink',
                    )}
                  >
                    {inner.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
}

// Điều hướng của khu quản lý (vendor, admin): cột trái từ lg, hàng ngang cuộn được
// trên màn hình hẹp. Mục có `inners` mở ra menu con ở cột trái.
export default function DashboardSidebar({
  items,
  label,
}: Readonly<{
  items: DashboardNavItem[];
  // Tên vùng điều hướng cho trình đọc màn hình.
  label: string;
}>) {
  const { pathname } = useRouter();

  return (
    <aside
      aria-label={label}
      className='shrink-0 border-b border-line bg-surface lg:w-65 lg:border-r lg:border-b-0'
    >
      <nav className='overflow-x-auto px-2 py-2 lg:py-4'>
        <ul className='flex gap-1 lg:flex-col'>
          {items.map((item) => (
            <SidebarItem key={item.href} item={item} pathname={pathname} />
          ))}
        </ul>
      </nav>
    </aside>
  );
}
