import { useEffect, useRef, useState, type FormEvent } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import MeHeader from '@/components/me/MeHeader';
import Alert, { type AlertTone } from '@/components/ui/Alert';
import Button, { ButtonLink } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import PageTitle from '@/components/ui/PageTitle';
import useAuth from '@/hooks/user/useAuthContext';
import request, { ApiError } from '@/lib/api';
import type { User } from '@/types/user';

type AccountSettings = {
  authProvider: 'GOOGLE' | null;
  canChangeEmail: boolean;
  canResetPassword: boolean;
};

export default function SettingsPage() {
  const { account, setAccount, isAuthenticating } = useAuth();
  const [draft, setDraft] = useState<{ userId: string; value: string } | null>(null);
  const displayName = draft?.userId === account?.id ? draft?.value ?? '' : account?.displayName ?? '';
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [busy, setBusy] = useState<'profile' | 'email' | 'password' | null>(null);
  const [notice, setNotice] = useState<{ tone: AlertTone; message: string } | null>(null);
  const [passwordEmailSent, setPasswordEmailSent] = useState(false);
  const [settingsAttempt, setSettingsAttempt] = useState(0);
  const [settings, setSettings] = useState<{
    userId: string; attempt: number; data: AccountSettings | null; error: string;
  } | null>(null);
  const currentSettings = settings?.userId === account?.id && settings?.attempt === settingsAttempt ? settings : null;
  const canChangeEmail = currentSettings?.data?.canChangeEmail === true;
  const canResetPassword = currentSettings?.data?.canResetPassword === true;
  const pending = useRef<AbortController | null>(null);
  const disabled = isAuthenticating || !account || busy !== null;

  useEffect(() => {
    if (!account?.id) return;
    const userId = account.id;
    const controller = new AbortController();
    void request<{ data: AccountSettings }>('/users/me/settings', { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setSettings({ userId, attempt: settingsAttempt, data, error: '' });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setSettings({ userId, attempt: settingsAttempt, data: null,
          error: error instanceof ApiError ? error.message : 'Không thể tải tùy chọn tài khoản. Vui lòng thử lại.',
        });
      });
    return () => controller.abort();
  }, [account?.id, settingsAttempt]);

  useEffect(() => () => {
    pending.current?.abort();
    pending.current = null;
  }, [account?.id]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account || pending.current) return;
    const normalizedName = displayName.trim();
    if (!normalizedName || normalizedName.length > 255) {
      setNotice({ tone: 'danger', message: 'Tên hiển thị phải có từ 1 đến 255 ký tự.' });
      return;
    }
    const controller = new AbortController();
    pending.current = controller;
    setBusy('profile');
    setNotice(null);
    try {
      const { data } = await request<{ data: User }>('/users/me', {
        method: 'PATCH', body: JSON.stringify({ displayName: normalizedName }), signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setAccount(data);
      setDraft(null);
      setNotice({ tone: 'success', message: 'Đã cập nhật tên hiển thị.' });
    } catch (error) {
      if (!controller.signal.aborted) {
        setNotice({ tone: 'danger', message: error instanceof ApiError ? error.message : 'Không thể lưu hồ sơ. Vui lòng thử lại.' });
      }
    } finally {
      if (pending.current === controller) { pending.current = null; setBusy(null); }
    }
  }

  async function changeEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account || pending.current) return;
    if (!canChangeEmail) {
      setNotice({ tone: 'warning', message: currentSettings?.data?.authProvider === 'GOOGLE'
        ? 'Tài khoản đăng nhập bằng Google không được đổi email.'
        : 'Chưa xác định được quyền đổi email. Vui lòng tải lại tùy chọn tài khoản.',
      });
      return;
    }
    const normalizedEmail = newEmail.trim().toLowerCase();
    if (!normalizedEmail || normalizedEmail.length > 255 || normalizedEmail === account.email.toLowerCase()) {
      setNotice({ tone: 'danger', message: 'Nhập địa chỉ email mới hợp lệ và khác email hiện tại.' });
      return;
    }
    const controller = new AbortController();
    pending.current = controller;
    setBusy('email');
    setNotice(null);
    try {
      await request('/authen/change-email', {
        method: 'POST', body: JSON.stringify({ newEmail: normalizedEmail }), signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setShowEmailForm(false);
      setNewEmail('');
      setNotice({ tone: 'success', message:
        `Đã gửi yêu cầu xác nhận đến ${account.email}. Hãy mở liên kết trong 15 phút để xác nhận đổi sang ${normalizedEmail}. Sau đó bạn cần xác minh thêm hộp thư mới. Nếu chưa thấy thư, hãy kiểm tra Spam.`,
      });
    } catch (error) {
      if (!controller.signal.aborted) {
        setNotice({ tone: 'danger', message: error instanceof ApiError ? error.message : 'Không thể gửi yêu cầu đổi email. Vui lòng thử lại.' });
      }
    } finally {
      if (pending.current === controller) { pending.current = null; setBusy(null); }
    }
  }

  async function sendResetEmail() {
    if (!account || pending.current || !canResetPassword) return;
    const controller = new AbortController();
    pending.current = controller;
    setBusy('password');
    setNotice(null);
    try {
      await request('/authen/reset-password/me', { method: 'POST', signal: controller.signal });
      if (controller.signal.aborted) return;
      setPasswordEmailSent(true);
      setNotice({ tone: 'success', message:
        'Email đổi mật khẩu đã được gửi. Hãy dùng liên kết trong 15 phút và đăng nhập lại sau khi đổi mật khẩu. Nếu chưa thấy email, hãy kiểm tra Spam hoặc Thư rác.',
      });
    } catch (error) {
      if (!controller.signal.aborted) {
        setNotice({ tone: 'danger', message: error instanceof ApiError ? error.message : 'Không thể gửi email đổi mật khẩu. Vui lòng thử lại.' });
      }
    } finally {
      if (pending.current === controller) { pending.current = null; setBusy(null); }
    }
  }

  return (
    <>
      <PageTitle title='Cài đặt' />
      <MeHeader title='Cài đặt' active='settings' account={account} />

      <Container size='narrow' className='flex flex-col gap-8 py-12'>
        {notice && <Alert tone={notice.tone}>{notice.message}</Alert>}
        {!isAuthenticating && !account && (
          <Alert tone='warning' action={<ButtonLink href='/authen/login?next=%2Fsettings' variant='outline'>Đăng nhập</ButtonLink>}>
            Vui lòng đăng nhập để chỉnh sửa tài khoản.
          </Alert>
        )}
        <section
          aria-labelledby='account-title'
          className='flex flex-col gap-5 rounded-panel border border-line bg-page px-5 py-6 sm:px-8'
        >
          <h2 id='account-title' className='text-h3 text-ink'>
            Tài khoản
          </h2>
          <form onSubmit={saveProfile} className='flex flex-col items-start gap-4'>
            <Field label='Tên hiển thị' htmlFor='profile-name' required className='w-full'>
              <Input id='profile-name' name='displayName' autoComplete='nickname' required maxLength={255}
                disabled={disabled} value={displayName}
                onChange={(event) => { if (account) setDraft({ userId: account.id, value: event.target.value }); }} />
            </Field>
            <Button type='submit' variant='outline' disabled={disabled || displayName.trim() === account?.displayName}>
              {busy === 'profile' ? 'Đang lưu…' : 'Lưu thay đổi'}
            </Button>
          </form>
          <div className='flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5'>
            <div className='min-w-0'>
              <p className='text-body-sm font-medium text-ink'>Email hiện tại</p>
              <p className='mt-1 break-all text-body-sm text-ink-muted'>{account?.email ?? 'Đang tải…'}</p>
            </div>
            <Button variant='outline' size='sm' disabled={disabled || !canChangeEmail} aria-expanded={showEmailForm && canChangeEmail} aria-controls='change-email-form'
              onClick={() => setShowEmailForm((current) => !current)}>
              {showEmailForm ? 'Đóng' : 'Đổi email'}
            </Button>
          </div>
          {account && !currentSettings && <Alert>Đang tải tùy chọn tài khoản…</Alert>}
          {currentSettings?.error && (
            <Alert tone='danger' action={<Button variant='outline' size='sm' onClick={() => setSettingsAttempt((value) => value + 1)}>Thử lại</Button>}>
              {currentSettings.error}
            </Alert>
          )}
          {currentSettings?.data?.authProvider === 'GOOGLE' && (
            <Alert>Tài khoản đăng nhập bằng Google không được đổi email. Bạn vẫn có thể chỉnh sửa tên hiển thị.</Alert>
          )}
          {showEmailForm && canChangeEmail && (
            <form id='change-email-form' onSubmit={changeEmail} className='flex flex-col items-start gap-4 border-t border-line pt-5'>
              <p className='text-body-sm text-ink-muted'>Xác nhận qua email hiện tại trước, sau đó xác minh email mới. Email tài khoản chỉ đổi khi hoàn tất cả hai bước.</p>
              <Field label='Email mới' htmlFor='profile-new-email' required className='w-full'>
                <Input id='profile-new-email' name='newEmail' type='email' autoComplete='email' required maxLength={255}
                  disabled={disabled} value={newEmail} onChange={(event) => setNewEmail(event.target.value)} />
              </Field>
              <Button type='submit' variant='outline' disabled={disabled}>
                {busy === 'email' ? 'Đang gửi…' : 'Gửi yêu cầu đổi email'}
              </Button>
            </form>
          )}
        </section>

        <section
          aria-labelledby='password-title'
          className='flex flex-col items-start gap-4 rounded-panel border border-line bg-page px-5 py-6 sm:px-8'
        >
          <h2 id='password-title' className='text-h3 text-ink'>
            Đổi mật khẩu
          </h2>
          {currentSettings?.data && !canResetPassword ? (
            <Alert>
              {currentSettings.data.authProvider === 'GOOGLE'
                ? 'Bạn đăng nhập bằng Google. Hãy quản lý mật khẩu trong tài khoản Google.'
                : 'Tài khoản này chưa có mật khẩu đăng nhập để đặt lại.'}
            </Alert>
          ) : (
            <>
              <p className='text-body-sm text-ink-muted'>Chúng tôi sẽ gửi liên kết đổi mật khẩu tới email hiện tại của bạn.</p>
              <Button variant='outline' onClick={() => void sendResetEmail()} disabled={disabled || !canResetPassword}>
                {busy === 'password' ? 'Đang gửi…' : passwordEmailSent ? 'Gửi lại email' : 'Gửi email đổi mật khẩu'}
              </Button>
            </>
          )}
        </section>
      </Container>
    </>
  );
}

SettingsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
