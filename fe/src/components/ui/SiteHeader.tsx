import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { cn } from '@/lib/cn';

import AccountMenu from './AccountMenu';
import { ButtonLink } from './Button';
import CreateMenu from './CreateMenu';
import Icon from './Icon';
import { IconLink } from './IconButton';
import Logo from './Logo';
import SearchBar from './SearchBar';

type NavItem = { label: string; href: string };

const MAIN_NAV: NavItem[] = [
  { label: 'Diễn đàn', href: '/' },
  { label: 'Công thức', href: '/recipes' },
];

type SiteHeaderProps = Readonly<{
  // guest: chưa đăng nhập (nút Đăng nhập/Đăng ký). member: đã đăng nhập (icon đã lưu, tài khoản).
  // session: tự kiểm tra phiên đăng nhập rồi hiện một trong hai — dùng cho trang thật.
  variant?: 'guest' | 'member' | 'session';
  activeHref?: string;
}>;

function AccountActions({ variant }: { variant: SiteHeaderProps['variant'] }) {
  if (variant === 'session') return <AccountMenu />;

  if (variant === 'member') {
    return (
      <>
        <IconLink href='/me?tab=saved' label='Bài viết đã lưu' variant='ghost'>
          <Icon name='bookmark' className='size-6.5' />
        </IconLink>
        <IconLink href='/me' label='Tài khoản' variant='ghost'>
          <Icon name='user' className='size-6.5' />
        </IconLink>
      </>
    );
  }

  return (
    <ButtonLink href='/authen/login' size='sm' className='uppercase'>
      Đăng nhập / Đăng ký
    </ButtonLink>
  );
}

export default function SiteHeader({
  variant = 'member',
  activeHref,
}: SiteHeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className='relative z-20 bg-page shadow-header'>
      {/* Hàng 1: logo · điều hướng chính · tài khoản */}
      <div className='flex h-15 items-center justify-between gap-4 border-b border-line px-3 lg:px-4'>
        <div className='hidden sm:block'>
          <Logo size='md' />
        </div>
        <div className='sm:hidden'>
          <Logo size='sm' showWordmark={false} />
        </div>

        <nav aria-label='Điều hướng chính' className='hidden lg:block'>
          <ul className='flex items-center gap-2'>
            {MAIN_NAV.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  aria-current={activeHref === item.href ? 'page' : undefined}
                  className='inline-block px-3 py-2 text-lead font-medium text-ink uppercase outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-accent aria-[current=page]:underline aria-[current=page]:decoration-accent aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8'
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className='flex items-center gap-1.5 sm:gap-2.5'>
          <AccountActions variant={variant} />
          <button
            type='button'
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={menuOpen}
            aria-controls='mobile-nav'
            onClick={() => setMenuOpen((open) => !open)}
            className='grid size-9.5 place-items-center rounded-full outline-none hover:bg-ink/5 focus-visible:ring-2 focus-visible:ring-accent lg:hidden'
          >
            <Icon name={menuOpen ? 'close' : 'menu'} className='size-6' />
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <nav
        id='mobile-nav'
        aria-label='Điều hướng chính (di động)'
        className={cn('border-b border-line lg:hidden', !menuOpen && 'hidden')}
      >
        <ul className='flex flex-col px-3 py-2'>
          {MAIN_NAV.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                aria-current={activeHref === item.href ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
                className='block rounded-control px-3 py-2.5 text-lead font-medium uppercase hover:bg-highlight-soft aria-[current=page]:bg-highlight-soft'
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Hàng 2: tìm theo nguyên liệu · tìm kiếm · tạo mới */}
      <div className='flex flex-col gap-2 border-b border-line px-3 py-2 lg:h-9.5 lg:flex-row lg:items-center lg:justify-between lg:px-4 lg:py-0'>
        <p className='text-caption font-light text-ink'>
          Có sẵn nguyên liệu?{' '}
          <Link
            href='/recipes'
            className='rounded-control font-medium outline-none hover:underline hover:decoration-accent hover:decoration-2 hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-accent'
          >
            Tìm công thức phù hợp ›
          </Link>
        </p>
        <div className='flex items-center gap-3'>
          <SearchBar
            formClassName='flex-1 lg:w-58 lg:flex-none'
            onSearch={(query) =>
              void router.push({ pathname: '/recipes/search', query: query ? { q: query } : {} })
            }
          />
          <CreateMenu />
        </div>
      </div>
    </header>
  );
}
