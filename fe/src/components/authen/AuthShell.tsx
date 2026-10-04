import Head from 'next/head';
import type { ReactNode } from 'react';

import Icon from '@/components/ui/Icon';
import { IconLink } from '@/components/ui/IconButton';
import Logo from '@/components/ui/Logo';
import ThemeRoot from '@/components/ui/ThemeRoot';
import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/cn';

type AuthStatus = 'loading' | 'success' | 'error';

type AuthShellProps = Readonly<{
  title: string;
  description?: ReactNode;
  // Biểu tượng trạng thái phía trên tiêu đề (trang xác minh, gửi email, callback…).
  status?: AuthStatus;
  // Khối đăng nhập bằng tài khoản khác, hiện sau dòng "HOẶC".
  social?: ReactNode;
  children?: ReactNode;
}>;

function StatusIcon({ status }: { status: AuthStatus }) {
  if (status === 'loading') {
    return (
      <span
        aria-hidden
        className='mb-6 size-11 animate-spin rounded-full border-2 border-line border-t-primary'
      />
    );
  }

  return (
    <Icon
      name={status === 'success' ? 'circle-check' : 'circle-alert'}
      className={cn('mb-4 size-12', status === 'success' ? 'text-success' : 'text-danger')}
    />
  );
}

// Khung trang đăng nhập / đăng ký: nền ảnh, logo đóng khung, thẻ form ở giữa.
export default function AuthShell({
  title,
  description,
  status,
  social,
  children,
}: AuthShellProps) {
  return (
    <ThemeRoot>
      <Head>
        <title>{`${title} · ${BRAND.name}`}</title>
      </Head>
      <div className='flex min-h-screen flex-col items-center bg-media px-4 py-8'>
        <Logo boxed className='bg-page/60' />
        <main
          aria-live={status ? 'polite' : undefined}
          className='relative mt-6 flex w-full max-w-175 flex-col items-center rounded-modal bg-page/85 px-5 pt-14 pb-10 sm:px-20'
        >
          <IconLink
            href='/'
            label='Về trang chủ'
            variant='ghost'
            size='lg'
            className='absolute top-4 right-4'
          >
            <Icon name='close' className='size-7' />
          </IconLink>
          {status && <StatusIcon status={status} />}
          <h1 className='text-center text-h1 font-semibold text-ink'>{title}</h1>
          {description && (
            <p className='mt-3 max-w-md text-center text-body-sm font-light text-ink-muted'>
              {description}
            </p>
          )}
          {children && <div className='mt-6 w-full'>{children}</div>}
          {social && (
            <>
              <div className='mt-6 flex w-full items-center gap-4 text-lead text-ink-subtle'>
                <span className='h-px flex-1 bg-ink-subtle/60' />
                HOẶC
                <span className='h-px flex-1 bg-ink-subtle/60' />
              </div>
              <div className='mt-6 flex w-full max-w-md flex-col gap-2.5 sm:flex-row'>
                {social}
              </div>
            </>
          )}
        </main>
      </div>
    </ThemeRoot>
  );
}
