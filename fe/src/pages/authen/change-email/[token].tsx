import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import Alert from '@/components/ui/Alert';
import useAuth from '@/hooks/user/useAuthContext';
import request, { ApiError } from '@/lib/api';
import { getSession } from '@/services/users';

type EmailChangeInfo = {
  stage: 'WAITING_CURRENT_CONFIRMATION' | 'WAITING_NEW_CONFIRMATION';
  newEmail: string;
};

export default function ChangeEmailPage() {
  const router = useRouter();
  const { account, setAccount, isAuthenticating } = useAuth();
  const token = typeof router.query.token === 'string' ? router.query.token : '';
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<{
    token: string; attempt: number; data: EmailChangeInfo | null; error: string; expired: boolean;
  } | null>(null);
  const [confirmation, setConfirmation] = useState('');
  const [action, setAction] = useState<{
    token: string; status: 'idle' | 'sending' | 'waiting' | 'success' | 'error' | 'expired'; message: string;
  }>({ token: '', status: 'idle', message: '' });
  const mutation = useRef<AbortController | null>(null);
  const info = loaded?.token === token && loaded.attempt === attempt ? loaded : null;
  const result = action.token === token ? action : null;
  const data = info?.data;
  const busy = result?.status === 'sending';
  const finished = result?.status === 'success' || result?.status === 'waiting' || result?.status === 'expired';
  const currentStep = data?.stage === 'WAITING_CURRENT_CONFIRMATION';

  useEffect(() => {
    if (!router.isReady) return;
    const controller = new AbortController();
    async function inspect() {
      try {
        if (!/^[a-f0-9]{64}$/.test(token)) throw new ApiError(404, 'Liên kết xác nhận không hợp lệ.');
        const { data: pending } = await request<{ data: EmailChangeInfo }>('/authen/change-email/inspect', {
          method: 'POST', body: JSON.stringify({ token }), signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setLoaded({ token, attempt, data: pending, error: '', expired: false });
          setAction({ token, status: 'idle', message: '' });
          setConfirmation('');
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoaded({ token, attempt, data: null,
            error: error instanceof ApiError ? error.message : 'Không thể kiểm tra liên kết. Vui lòng thử lại.',
            expired: error instanceof ApiError && [400, 403, 404, 409].includes(error.status),
          });
        }
      }
    }
    void inspect();
    return () => controller.abort();
  }, [router.isReady, token, attempt]);

  useEffect(() => () => {
    mutation.current?.abort();
    mutation.current = null;
  }, [token]);

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data || mutation.current || isAuthenticating) return;
    const newEmail = confirmation.trim().toLowerCase();
    if (currentStep && newEmail !== data.newEmail) {
      setAction({ token, status: 'error', message: 'Vui lòng nhập lại đúng email mới đã yêu cầu.' });
      return;
    }
    const controller = new AbortController();
    mutation.current = controller;
    setAction({ token, status: 'sending', message: '' });
    try {
      if (currentStep) {
        await request('/authen/change-email/confirm-current', {
          method: 'POST', body: JSON.stringify({ token, newEmail }), signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setAction({ token, status: 'waiting', message: `Đã xác nhận email hiện tại. Hãy mở hộp thư ${data.newEmail} và xác minh email mới bằng liên kết có hiệu lực trong 15 phút. Nếu chưa thấy thư, hãy kiểm tra Spam.` });
      } else {
        const { data: receipt } = await request<{ data: { email: string } }>('/authen/change-email/complete', {
          method: 'POST', body: JSON.stringify({ token }), signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setAction({ token, status: 'success', message: `Đã đổi email thành công sang ${receipt.email}. Các phiên đăng nhập hiện có vẫn được giữ.` });
        // A bearer link never signs anyone in. Refresh only the browser's own session.
        try {
          const currentAccount = await getSession();
          if (!controller.signal.aborted) setAccount(currentAccount);
        } catch (error) {
          if (!controller.signal.aborted && error instanceof ApiError && error.status === 401) setAccount(null);
        }
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      const expired = error instanceof ApiError && [403, 404, 409, 500].includes(error.status);
      setAction({ token, status: expired ? 'expired' : 'error', message:
        error instanceof ApiError ? error.message : 'Không thể hoàn tất yêu cầu. Bạn có thể thử lại hoặc kiểm tra email tài khoản trong Cài đặt.',
      });
    } finally {
      if (mutation.current === controller) mutation.current = null;
    }
  }

  return (
    <div className='min-h-screen bg-white px-6 py-12 text-black' style={{ fontFamily: 'system-ui, sans-serif' }}>
      <Head>
        <title>Xác nhận đổi email</title>
        <meta name='robots' content='noindex,nofollow' />
        <meta name='referrer' content='no-referrer' />
      </Head>
      <main className='mx-auto max-w-lg border border-black p-6 sm:p-8'>
        <h1 className='text-2xl font-semibold'>Xác nhận đổi email</h1>
        <div className='mt-6 flex flex-col gap-5'>
          {!info && <Alert appearance='neutral'>Đang kiểm tra liên kết…</Alert>}
          {info?.error && (
            <Alert tone='danger' appearance='neutral' action={!info.expired && (
              <button type='button' onClick={() => setAttempt((value) => value + 1)} className='underline'>Thử lại</button>
            )}>{info.error}</Alert>
          )}
          {result?.message && (
            <Alert appearance='neutral' tone={result.status === 'error' || result.status === 'expired' ? 'danger' : 'success'}>
              {result.message}
            </Alert>
          )}
          {data && !finished && (
            <form onSubmit={confirm} className='flex flex-col gap-5'>
              <p className='text-sm leading-6'>
                {currentStep ? 'Bạn đã yêu cầu đổi email tài khoản sang:' : 'Xác minh địa chỉ email mới của bạn:'}
                <strong className='mt-1 block break-all'>{data.newEmail}</strong>
              </p>
              {currentStep ? (
                <div>
                  <label htmlFor='confirm-new-email' className='block text-sm font-medium'>Nhập lại email mới</label>
                  <input id='confirm-new-email' name='newEmail' type='email' autoComplete='email' required maxLength={255}
                    value={confirmation} disabled={busy} onChange={(event) => setConfirmation(event.target.value)}
                    className='mt-2 w-full border border-black bg-white p-3' />
                  <p className='mt-2 text-sm text-neutral-600'>Sau bước này, chúng tôi gửi thêm một liên kết tới email mới. Email tài khoản vẫn chưa thay đổi.</p>
                </div>
              ) : <p className='text-sm text-neutral-600'>Nhấn nút bên dưới để hoàn tất đổi email tài khoản.</p>}
              <button type='submit' disabled={busy || isAuthenticating}
                className='border border-black bg-black px-5 py-3 text-white disabled:opacity-50'>
                {busy ? 'Đang xử lý…' : currentStep ? 'Xác nhận và gửi email xác minh' : 'Xác minh email mới'}
              </button>
            </form>
          )}
          <div className='flex flex-wrap gap-4 border-t border-neutral-300 pt-5 text-sm'>
            {account ? <Link href='/settings' className='underline'>Về cài đặt</Link>
              : <Link href='/authen/login?next=%2Fsettings' className='underline'>Đăng nhập</Link>}
            <Link href='/' className='underline'>Trang chủ</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
