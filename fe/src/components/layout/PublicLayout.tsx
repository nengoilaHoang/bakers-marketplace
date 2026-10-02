import Link from 'next/link';
import type { ReactNode } from 'react';

type PublicLayoutProps = Readonly<{
  children: ReactNode;
}>;

const NAV_ITEMS = [
  { label: 'Công thức', href: '/recipes' },
  { label: 'Diễn đàn', href: '/#featured-posts' },
];

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className='flex min-h-screen flex-col bg-zinc-50 text-zinc-950'>
      <a
        href='#main-content'
        className='sr-only z-50 rounded-md bg-black px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4'
      >
        Đi đến nội dung chính
      </a>

      <header className='border-b border-zinc-200 bg-white'>
        <div className='mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8'>
          <Link
            href='/'
            className='text-lg font-semibold tracking-tight text-black outline-none ring-offset-4 hover:text-zinc-600 focus-visible:ring-2 focus-visible:ring-black'
          >
            Bakers Marketplace
          </Link>

          <div className='flex items-center gap-2'>
            <nav
              aria-label='Điều hướng chính'
              className='flex items-center gap-1'
            >
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='rounded-md px-3 py-2 text-sm font-medium text-zinc-700 outline-none ring-offset-2 hover:bg-zinc-100 hover:text-black focus-visible:ring-2 focus-visible:ring-black'
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              href='/authen/login'
              className='inline-flex min-h-9 items-center justify-center rounded-full border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 transition hover:border-black hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
            >
              Đăng nhập
            </Link>
            <Link
              href='/authen/register'
              className='inline-flex min-h-9 items-center justify-center rounded-full bg-black px-4 text-sm font-semibold text-white transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </header>

      <main
        id='main-content'
        className='mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-12 lg:px-8'
      >
        {children}
      </main>

      <footer className='border-t border-zinc-200 bg-white'>
        <div className='mx-auto w-full max-w-6xl px-4 py-6 text-sm text-zinc-500 sm:px-6 lg:px-8'>
          Cộng đồng chia sẻ công thức và kinh nghiệm làm bánh.
        </div>
      </footer>
    </div>
  );
}
