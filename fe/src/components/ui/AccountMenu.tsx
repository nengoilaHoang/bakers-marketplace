import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { useDropdown } from '@/hooks/useDropdown';
import request, { ApiError } from '@/lib/api';
import { cn } from '@/lib/cn';

import { ButtonLink } from './Button';
import Icon from './Icon';
import { IconLink } from './IconButton';

type SessionState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; displayName: string };

const MENU_LINKS = [
  { label: 'Trang của tôi', href: '/me' },
  { label: 'Cài đặt', href: '/settings' },
];

const MENU_ITEM_CLASSES =
  'block w-full px-4 py-2 text-left text-body-sm text-ink outline-none hover:bg-highlight-soft focus-visible:bg-highlight-soft';

// Khu vực tài khoản trên header: tự kiểm tra phiên đăng nhập rồi hiện nút đăng nhập hoặc menu tài khoản.
export default function AccountMenu() {
  const router = useRouter();
  const { ref, isOpen, toggle, close } = useDropdown();
  const [session, setSession] = useState<SessionState>({ status: 'loading' });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    void request<{ data: { displayName: string } }>('/authen/session')
      .then(({ data }) => {
        if (isActive) {
          setSession({ status: 'authenticated', displayName: data.displayName });
        }
      })
      .catch(() => {
        if (isActive) setSession({ status: 'anonymous' });
      });

    return () => {
      isActive = false;
    };
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      await request('/authen/logout', { method: 'POST' });
      close();
      setSession({ status: 'anonymous' });
      await router.replace('/authen/login');
    } catch (error) {
      setLogoutError(
        error instanceof ApiError
          ? error.message
          : 'Không thể đăng xuất. Vui lòng thử lại.',
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (session.status === 'loading') {
    return (
      <span
        aria-label='Đang kiểm tra trạng thái đăng nhập'
        className='size-9.5 animate-pulse rounded-full bg-media'
      />
    );
  }

  if (session.status === 'anonymous') {
    return (
      <ButtonLink href='/authen/login' size='sm' className='uppercase'>
        Đăng nhập / Đăng ký
      </ButtonLink>
    );
  }

  return (
    <>
      <IconLink href='/me?tab=saved' label='Bài viết đã lưu' variant='ghost'>
        <Icon name='bookmark' className='size-6.5' />
      </IconLink>
      <div ref={ref} className='relative'>
        <button
          type='button'
          onClick={toggle}
          aria-expanded={isOpen}
          aria-haspopup='menu'
          aria-label='Mở tùy chọn tài khoản'
          title={session.displayName}
          className='grid size-9.5 place-items-center rounded-full text-ink outline-none hover:bg-ink/5 focus-visible:ring-2 focus-visible:ring-accent'
        >
          <Icon name='user' className='size-6.5' />
        </button>

        {isOpen && (
          <div
            role='menu'
            aria-label='Tùy chọn tài khoản'
            className='absolute top-full right-0 z-30 mt-2 w-56 overflow-hidden rounded-box bg-page py-1 shadow-soft'
          >
            <p className='truncate border-b border-line px-4 py-2 text-meta text-ink-muted uppercase'>
              {session.displayName}
            </p>
            {MENU_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role='menuitem'
                onClick={close}
                className={MENU_ITEM_CLASSES}
              >
                {item.label}
              </Link>
            ))}
            <button
              type='button'
              role='menuitem'
              disabled={isLoggingOut}
              onClick={() => void handleLogout()}
              className={cn(
                MENU_ITEM_CLASSES,
                'border-t border-line disabled:cursor-wait disabled:text-ink-subtle',
              )}
            >
              {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </button>
            {logoutError && (
              <p role='alert' className='px-4 py-2 text-caption text-danger-strong'>
                {logoutError}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
