import Head from 'next/head';
import type { ReactNode } from 'react';

import { BRAND } from '@/lib/brand';

import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';
import ThemeRoot from './ThemeRoot';

type SiteLayoutProps = Readonly<{
  // Bỏ trống khi dùng làm layout cố định (getLayout): từng trang tự đặt <title> qua next/head.
  title?: string;
  children: ReactNode;
  headerVariant?: 'guest' | 'member' | 'session';
  activeHref?: string;
}>;

// Khung trang chuẩn: header + nội dung + footer.
export default function SiteLayout({
  title,
  children,
  headerVariant = 'member',
  activeHref,
}: SiteLayoutProps) {
  return (
    <ThemeRoot className='flex flex-col'>
      {title && (
        <Head>
          <title>{`${title} · ${BRAND.name}`}</title>
        </Head>
      )}
      <a
        href='#main-content'
        className='sr-only z-50 rounded-control bg-ink px-4 py-2 text-body-sm text-page focus:not-sr-only focus:fixed focus:top-4 focus:left-4'
      >
        Đi đến nội dung chính
      </a>
      <SiteHeader variant={headerVariant} activeHref={activeHref} />
      <main id='main-content' className='flex-1'>
        {children}
      </main>
      <SiteFooter />
    </ThemeRoot>
  );
}
