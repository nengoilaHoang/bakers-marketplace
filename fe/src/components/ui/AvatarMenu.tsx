import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import request, { ApiError } from '@/lib/api';
import NavLink from './NavLink';

type AvatarMenuProps = Readonly<{
  actions: ReadonlyArray<{
    label: string;
    href: string;
    callbackFn?: () => void;
  }>;
}>;

type SessionState =
	| { status: 'loading' }
	| { status: 'anonymous' }
	| { status: 'authenticated'; displayName: string };

export default function AvatarMenu({ actions }: AvatarMenuProps) {
	const router = useRouter();
	const [session, setSession] = useState<SessionState>({ status: 'loading' });
  const [isOpen, setIsOpen] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [logoutError, setLogoutError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let isActive = true;

		void request<{ data: { displayName: string } }>('/authen/session')
			.then(({ data }) => {
				if (isActive) {
					setSession({
						status: 'authenticated',
						displayName: data.displayName,
					});
				}
			})
			.catch(() => {
				if (isActive) {
					setSession({ status: 'anonymous' });
				}
			});

		return () => {
			isActive = false;
		};
	}, []);

  useEffect(() => {
    function closeWhenClickingOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', closeWhenClickingOutside);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeWhenClickingOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const handleLogout = async () => {
		setIsLoggingOut(true);
		setLogoutError(null);

		try {
			await request('/authen/logout', { method: 'POST' });
			setIsOpen(false);
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
	};

	if (session.status === 'loading') {
		return (
			<div
				aria-label='Đang kiểm tra trạng thái đăng nhập'
				className='size-9 animate-pulse rounded-full bg-zinc-200'
			/>
		);
	}

	if (session.status === 'anonymous') {
		return (
			<div className='flex items-center gap-2'>
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
		);
	}

	const avatarLabel = session.displayName.trim().charAt(0).toUpperCase() || 'U';

  return (
    <div ref={menuRef} className='relative'>
      <button
        type='button'
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-haspopup='menu'
        aria-label='Mở tùy chọn tài khoản'
        className='flex size-9 cursor-pointer items-center justify-center rounded-full bg-zinc-950 text-sm font-semibold text-white transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950'
      >
        {avatarLabel}
      </button>

      {isOpen && (
        <div
          role='menu'
          aria-label='Tùy chọn tài khoản'
          className='absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg'
        >
			<NavLink
				href='/authen/change-password'
				role='menuitem'
				className='block cursor-pointer px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:bg-zinc-100 focus-visible:outline-none'
				onClick={() => setIsOpen(false)}
			>
				Đổi mật khẩu
			</NavLink>

          {actions.map((action) => (
            <NavLink
              key={`${action.href}-${action.label}`}
              href={action.href}
              role='menuitem'
              className='block cursor-pointer px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:bg-zinc-100 focus-visible:outline-none'
              onClick={() => {
                action.callbackFn?.();
                setIsOpen(false);
              }}
            >
              {action.label}
            </NavLink>
          ))}

					<div className='my-1 border-t border-zinc-200' />

					<button
						type='button'
						role='menuitem'
						disabled={isLoggingOut}
						onClick={handleLogout}
						className='block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:bg-zinc-100 focus-visible:outline-none disabled:cursor-wait disabled:text-zinc-400'
					>
						{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
					</button>

					{logoutError && (
						<p role='alert' className='px-3 py-2 text-xs leading-5 text-red-700'>
							{logoutError}
						</p>
					)}
        </div>
      )}
    </div>
  );
}
