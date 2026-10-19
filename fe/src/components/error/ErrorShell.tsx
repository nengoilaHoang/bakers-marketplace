// components/ui/ErrorShell.tsx
import { BRAND } from '@/lib/brand';
import Head from 'next/head';
import Link from 'next/link';
import type { ReactNode } from 'react';
import Logo from '../ui/Logo';
import ThemeRoot from '../ui/ThemeRoot';

type ErrorShellProps = Readonly<{
  title: string;
  children: ReactNode;
  theme?: 'vendor' | 'default';
}>;

export default function ErrorShell({
  title,
  children,
  theme = 'default',
}: ErrorShellProps) {
  return (
    <ThemeRoot theme={theme} className='flex min-h-screen flex-col bg-page'>
      <Head>
        <title>{`${title} — ${BRAND.name}`}</title>
      </Head>

      <header className='border-b border-line bg-page px-6 py-4 shadow-header'>
        <div className='mx-auto flex max-w-page items-center justify-between'>
          <Logo size='sm' />
          <Link
            href='/'
            className='text-body-sm font-medium text-ink hover:underline'
          >
            Về trang chủ
          </Link>
        </div>
      </header>

      <main
        id='main-content'
        className='flex flex-1 flex-col justify-center min-h-0'
      >
        {children}
      </main>
    </ThemeRoot>
  );
}
