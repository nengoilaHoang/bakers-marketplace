import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import type { DashboardNavItem } from '@/components/dashboard/DashboardSidebar';
import VendorSiteHeader from '../vendor/VendorSiteHeader';

const VENDOR_NAV: DashboardNavItem[] = [
  { label: 'Sản phẩm', href: '/vendors/products', icon: 'cart' },
  { label: 'Tồn kho', href: '/vendors/stocks', icon: 'summary' },
  { label: 'Bộ sưu tập', href: '/vendors/collections', icon: 'hand-platter' },
  {
    label: 'Storefront',
    href: '/vendors/storefronts',
    icon: 'smartphone',
    inners: [
      {
        label: 'Overview',
        href: '/vendors/storefronts',
      },
    ],
  },
  { label: 'Cài đặt', href: '/settings', icon: 'edit' },
];

// Khu vendor dùng chung khung DashboardLayout với khu quản trị.
const VendorLayout = ({
  children,
  title,
}: Readonly<{
  children: React.ReactNode;
  title?: string;
}>) => {
  return (
    <DashboardLayout
      header={<VendorSiteHeader />}
      nav={VENDOR_NAV}
      navLabel='Điều hướng cửa hàng'
      title={title}
    >
      {children}
    </DashboardLayout>
  );
};

export default VendorLayout;
