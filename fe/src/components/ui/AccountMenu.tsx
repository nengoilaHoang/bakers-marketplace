import Link from 'next/link';

import { cn } from '@/lib/cn';

import { useDropdown } from '@/hooks/useDropdown';
import useAuth from '@/hooks/user/useAuthContext';
import { ButtonLink } from './Button';
import Icon from './Icon';

const MENU_ITEM_CLASSES =
  'block w-full px-4 py-2 text-left text-body-sm text-ink outline-none hover:bg-highlight-soft focus-visible:bg-highlight-soft';

// Khu vực tài khoản trên header: tự kiểm tra phiên đăng nhập rồi hiện nút đăng nhập hoặc menu tài khoản.
export default function AccountMenu() {
  const { account, isAuthenticated, isAuthenticating, logout } = useAuth();
  const { ref, isOpen, toggle, close } = useDropdown();

  const isVendor = account?.role === 'VENDOR';

  if (!isAuthenticated || !account) {
    return (
      <ButtonLink href='/authen/login' size='sm' className='uppercase'>
        Đăng nhập / Đăng ký
      </ButtonLink>
    );
  }

  if (isAuthenticating) {
    return (
      <span
        aria-label='Đang kiểm tra trạng thái đăng nhập'
        className='size-9.5 animate-pulse rounded-full bg-media'
      />
    );
  }

  return (
    <div ref={ref} className='relative'>
      <button
        type='button'
        onClick={toggle}
        aria-expanded={isOpen}
        aria-haspopup='menu'
        aria-label='Mở tùy chọn tài khoản'
        title={account.displayName}
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
            {account.displayName}
          </p>
          {isVendor ? (
            <Link href='/vendors' className={MENU_ITEM_CLASSES}>
              Quản lý cửa hàng
            </Link>
          ) : (
            <Link href='/me' className={MENU_ITEM_CLASSES}>
              Trang cá nhân
            </Link>
          )}
          <Link href='/settings' className={MENU_ITEM_CLASSES} onClick={close}>
            Cài đặt
          </Link>

          <button
            onClick={() => void logout()}
            className={cn(MENU_ITEM_CLASSES, 'border-t border-line')}
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
