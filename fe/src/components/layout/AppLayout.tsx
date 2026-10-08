import { useRouter } from 'next/router';
import type { ReactNode } from 'react';

import SiteLayout from '../ui/SiteLayout';

type AppLayoutProps = Readonly<{
  children: ReactNode;
}>;

function getActiveHref(pathname: string) {
  if (pathname.startsWith('/recipes')) return '/recipes';
  if (pathname === '/' || pathname.startsWith('/posts')) return '/';
  return undefined;
}

// Khung cho khu cộng đồng: header tự nhận biết phiên đăng nhập.
export default function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useRouter();

  return (
    <SiteLayout headerVariant='session' activeHref={getActiveHref(pathname)}>
      {children}
    </SiteLayout>
  );
}
