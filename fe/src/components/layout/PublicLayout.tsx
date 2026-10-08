import type { ReactNode } from 'react';

import SiteLayout from '../ui/SiteLayout';

type PublicLayoutProps = Readonly<{
  children: ReactNode;
}>;

// Khung cho khách (landing): header có nút Đăng nhập / Đăng ký.
export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <SiteLayout headerVariant='guest'>
      {children}
    </SiteLayout>
  );
}
