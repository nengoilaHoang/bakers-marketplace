import type { ReactNode } from 'react';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import type { DashboardNavItem } from '@/components/dashboard/DashboardSidebar';

import AdminGuard from './AdminGuard';

const ADMIN_NAV: DashboardNavItem[] = [
  { label: 'Tổng quan', href: '/admin', icon: 'summary', exact: true },
  { label: 'Bài viết', href: '/admin/posts', icon: 'message' },
  { label: 'Công thức', href: '/admin/recipes', icon: 'chef-hat' },
  { label: 'Người dùng', href: '/admin/users', icon: 'users' },
  { label: 'Vendor', href: '/admin/vendors', icon: 'cart' },
];

// Khu quản trị: chỉ tài khoản ADMIN, dùng chung khung với khu vendor.
export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AdminGuard>
      <DashboardLayout
        header={<DashboardHeader label='Quản trị' />}
        nav={ADMIN_NAV}
        navLabel='Điều hướng quản trị'
      >
        {children}
      </DashboardLayout>
    </AdminGuard>
  );
}
