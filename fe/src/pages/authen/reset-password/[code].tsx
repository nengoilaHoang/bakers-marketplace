import { useRouter } from 'next/router';
import { useState, type FormEvent } from 'react';

import AuthShell from '@/components/authen/AuthShell';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import { PasswordInput } from '@/components/ui/Input';
import request, { ApiError } from '@/lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const code = typeof router.query.code === 'string' ? router.query.code : '';
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const logoutAndRedirect = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await request('/authen/logout', { method: 'POST' });
      await router.replace('/');
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? `Mật khẩu đã được đổi nhưng chưa thể đăng xuất: ${requestError.message}`
          : 'Mật khẩu đã được đổi nhưng chưa thể đăng xuất. Vui lòng thử lại.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!code) {
      setError('Liên kết đặt lại mật khẩu không hợp lệ.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setSubmitting(true);

    try {
      await request<{ message: string }>(
        `/authen/reset-password/${encodeURIComponent(code)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ password, confirmPassword }),
        },
      );
      setPasswordChanged(true);
      await logoutAndRedirect();
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Không thể đổi mật khẩu. Liên kết có thể đã hết hạn.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (passwordChanged) {
    return (
      <AuthShell
        title='Mật khẩu đã được thay đổi'
        status='success'
        description={
          submitting
            ? 'Đang đăng xuất và đưa bạn về trang chủ...'
            : 'Hãy đăng nhập lại bằng mật khẩu mới.'
        }
      >
        {(error || !submitting) && (
          <div className='flex flex-col gap-4'>
            {error && <Alert tone='danger'>{error}</Alert>}
            {!submitting && (
              <Button size='lg' shape='rounded' block onClick={() => void logoutAndRedirect()}>
                Đăng xuất và về trang chủ
              </Button>
            )}
          </div>
        )}
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title='Tạo mật khẩu mới'
      description='Mật khẩu mới phải có từ 8 đến 72 ký tự và được nhập giống nhau ở cả hai ô.'
    >
      {router.isReady && !code ? (
        <Alert tone='danger'>Liên kết đặt lại mật khẩu không hợp lệ.</Alert>
      ) : (
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <Field label='Mật khẩu mới' htmlFor='reset-password' size='sm'>
            <PasswordInput
              id='reset-password'
              name='password'
              size='lg'
              autoComplete='new-password'
              autoFocus
              required
              minLength={8}
              maxLength={72}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder='Nhập mật khẩu mới'
            />
          </Field>
          <Field
            label='Nhập lại mật khẩu mới'
            htmlFor='reset-confirm-password'
            size='sm'
            error={passwordsMismatch ? 'Hai mật khẩu chưa giống nhau.' : undefined}
          >
            <PasswordInput
              id='reset-confirm-password'
              name='confirmPassword'
              size='lg'
              autoComplete='new-password'
              required
              minLength={8}
              maxLength={72}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              aria-invalid={passwordsMismatch}
              placeholder='Nhập lại mật khẩu mới'
            />
          </Field>

          {error && <Alert tone='danger'>{error}</Alert>}

          <Button
            type='submit'
            size='lg'
            shape='rounded'
            block
            disabled={submitting || !router.isReady || passwordsMismatch}
            className='mt-2'
          >
            {submitting ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
