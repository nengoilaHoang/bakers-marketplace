import type { ReactNode } from 'react';

import Breadcrumb, { type BreadcrumbItem } from '@/components/ui/Breadcrumb';
import PageTitle from '@/components/ui/PageTitle';
import { cn } from '@/lib/cn';

type VendorPageProps = Readonly<{
  // Tiêu đề trang (h1) và <title> của tab.
  title: string;
  // Nội dung h1 khi cần khác title, ví dụ kèm nhãn trạng thái.
  heading?: ReactNode;
  description?: ReactNode;
  breadcrumb?: BreadcrumbItem[];
  // Các nút hành động bên phải tiêu đề.
  actions?: ReactNode;
  // page: bảng và lưới. narrow: form, trang chi tiết.
  size?: 'page' | 'narrow';
  children: ReactNode;
}>;

// Khung nội dung cho mọi trang trong khu vendor (đặt bên trong VendorLayout).
export default function VendorPage({
  title,
  heading,
  description,
  breadcrumb,
  actions,
  size = 'page',
  children,
}: VendorPageProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 py-8 sm:px-8 lg:py-10',
        size === 'narrow' ? 'max-w-narrow' : 'max-w-page',
      )}
    >
      <PageTitle title={title} />

      {breadcrumb && <Breadcrumb items={breadcrumb} className='-ml-2 mb-2' />}

      <header className='flex flex-wrap items-end justify-between gap-4'>
        <div className='min-w-0'>
          <h1 className='text-h2 font-semibold text-ink'>{heading ?? title}</h1>
          {description && (
            <p className='mt-1 text-body-sm text-ink-muted'>{description}</p>
          )}
        </div>
        {actions && <div className='flex flex-wrap items-center gap-2'>{actions}</div>}
      </header>

      <div className='mt-8 flex flex-col gap-6'>{children}</div>
    </div>
  );
}
