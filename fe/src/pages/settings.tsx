import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import MeHeader from '@/components/me/MeHeader';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import PageTitle from '@/components/ui/PageTitle';
import useAuth from '@/hooks/user/useAuthContext';
import request, { ApiError } from '@/lib/api';

type ResetEmailStatus = 'idle' | 'sending' | 'success' | 'error';

export default function SettingsPage() {
  const { account } = useAuth();
  const [status, setStatus] = useState<ResetEmailStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const sendResetEmail = async () => {
    setStatus('sending');
    setMessage(null);

    try {
      await request<{ message: string }>('/authen/reset-password/me', {
        method: 'POST',
      });
      setStatus('success');
      setMessage(
        'Email đổi mật khẩu đã được gửi. Hãy mở email và sử dụng liên kết trong vòng 15 phút. Nếu chưa thấy email, hãy kiểm tra thư mục Spam hoặc Thư rác.',
      );
    } catch (requestError) {
      setStatus('error');
      setMessage(
        requestError instanceof ApiError
          ? requestError.message
          : 'Không thể gửi email đổi mật khẩu. Vui lòng thử lại.',
      );
    }
  };

  return (
    <>
      <PageTitle title='Cài đặt' />
      <MeHeader title='Cài đặt' active='settings' account={account} />

      <Container size='narrow' className='flex flex-col gap-8 py-12'>
        <section
          aria-labelledby='account-title'
          className='flex flex-col gap-5 rounded-panel bg-surface px-5 py-6 sm:px-8'
        >
          <h2 id='account-title' className='text-h3 text-ink'>
            Tài khoản
          </h2>
          <dl className='grid gap-x-8 gap-y-3 text-body sm:grid-cols-[10rem_1fr]'>
            <dt className='font-medium text-ink'>Tên hiển thị</dt>
            <dd className='text-ink-muted'>{account?.displayName ?? '…'}</dd>
            <dt className='font-medium text-ink'>Email</dt>
            <dd className='break-all text-ink-muted'>
              {account?.email ?? '…'}
            </dd>
          </dl>
        </section>

        <section
          aria-labelledby='password-title'
          aria-live='polite'
          className='flex flex-col items-start gap-4 rounded-panel bg-surface px-5 py-6 sm:px-8'
        >
          <h2 id='password-title' className='text-h3 text-ink'>
            Đổi mật khẩu
          </h2>
          <p className='text-body-sm text-ink-muted'>
            Chúng tôi sẽ gửi liên kết đổi mật khẩu tới email của bạn.
          </p>
          <Button
            onClick={() => void sendResetEmail()}
            disabled={status === 'sending'}
          >
            {status === 'sending'
              ? 'Đang gửi...'
              : status === 'success'
                ? 'Gửi lại email'
                : 'Gửi email đổi mật khẩu'}
          </Button>
          {message && (
            <Alert
              tone={status === 'error' ? 'danger' : 'success'}
              className='w-full'
            >
              {message}
            </Alert>
          )}
        </section>
      </Container>
    </>
  );
}

SettingsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
