import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/cn';
import Head from 'next/head';
import type { ReactNode } from 'react';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';
import ThemeRoot from './ThemeRoot';

export type SiteLayoutProps = Readonly<{
  title?: string;
  children: ReactNode;
  activeHref?: string;
  header?: ReactNode;
  hideFooter?: boolean;
  mainClassName?: string;
  theme?: 'vendor' | 'default';
}>;

export default function SiteLayout({
  title,
  children,
  activeHref,
  header,
  hideFooter = false,
  mainClassName,
  theme,
}: SiteLayoutProps) {
  return (
    <ThemeRoot theme={theme} className='flex min-h-screen flex-col'>
      {title && (
        <Head>
          <title>{`${title} — ${BRAND.name}`}</title>
        </Head>
      )}
      <a
        href='#main-content'
        className='sr-only z-50 rounded-control bg-ink px-4 py-2 text-body-sm text-page focus:not-sr-only focus:fixed focus:top-4 focus:left-4'
      >
        Nội dung chính
      </a>

      {/* Render custom header if provided (e.g. VendorSiteHeader), else fallback to SiteHeader */}
      {header ?? <SiteHeader activeHref={activeHref} />}

      <main
        id='main-content'
        className={cn('flex flex-1 flex-col min-h-0', mainClassName)}
      >
        {children}
      </main>

      {!hideFooter && <SiteFooter />}
    </ThemeRoot>
  );
}
