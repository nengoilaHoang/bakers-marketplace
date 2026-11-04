import type { ReactNode } from 'react';

import ErrorBoundary from '@/components/error/ErrorBoundary';

import DashboardSidebar, { type DashboardNavItem } from './DashboardSidebar';
import SiteLayout from '@/components/ui/SiteLayout';

type DashboardLayoutProps = Readonly<{
  // Header của khu, thường là <DashboardHeader />.
  header: ReactNode;
  nav: DashboardNavItem[];
  // Tên vùng điều hướng cho trình đọc màn hình.
  navLabel: string;
  title?: string;
  children: ReactNode;
}>;

// Khung chung của khu quản lý (vendor, admin): header gọn, không footer,
// DashboardSidebar + vùng nội dung tự cuộn, theme `dashboard`.
export default function DashboardLayout({
  header,
  nav,
  navLabel,
  title,
  children,
}: DashboardLayoutProps) {
  return (
    <SiteLayout theme='dashboard' title={title} header={header} hideFooter>
      <div className='flex min-h-0 w-full flex-1 flex-col lg:flex-row'>
        <DashboardSidebar items={nav} label={navLabel} />
        <div className='min-h-0 flex-1 overflow-y-auto'>
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </div>
    </SiteLayout>
  );
}
