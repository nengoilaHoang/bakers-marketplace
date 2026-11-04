import type { ReactNode } from 'react';

import AccountMenu from '@/components/ui/AccountMenu';
import Badge from '@/components/ui/Badge';
import Logo from '@/components/ui/Logo';

type DashboardHeaderProps = Readonly<{
  // Nhãn nhỏ cạnh logo, ví dụ "Quản trị".
  label?: string;
  // Điều khiển riêng của từng khu, đặt bên trái menu tài khoản.
  actions?: ReactNode;
}>;

// Header gọn cho khu quản lý (vendor, admin): logo, nhãn khu vực, menu tài khoản.
export default function DashboardHeader({ label, actions }: DashboardHeaderProps) {
  return (
    <header className='relative z-20 bg-page shadow-header'>
      <div className='flex h-15 items-center justify-between gap-4 border-b border-line px-3 lg:px-4'>
        <div className='flex items-center gap-3'>
          <Logo size='md' />
          {label && <Badge tone='neutral'>{label}</Badge>}
        </div>

        <div className='flex h-full items-center gap-3.5'>
          {actions}
          <div className='flex h-full items-center border-l border-line pl-3'>
            <AccountMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
