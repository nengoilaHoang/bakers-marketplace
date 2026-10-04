import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, type FormEvent } from 'react';

import AuthShell from '@/components/authen/AuthShell';
import GoogleOAuthButton from '@/components/authen/GoogleOAuthButton';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Input, { PasswordInput } from '@/components/ui/Input';
import request, { ApiError } from '@/lib/api';
import { cn } from '@/lib/cn';

const LINK_CLASSES =
  'rounded-control px-1 text-ink outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await request('/authen/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const nextPath =
        typeof router.query.next === 'string' &&
        router.query.next.startsWith('/') &&
        !router.query.next.startsWith('//')
          ? router.query.next
          : '/';

      await router.replace(nextPath);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Không thể đăng nhập. Vui lòng thử lại.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title='Đăng nhập'
      social={<GoogleOAuthButton flow='login' action='Đăng nhập' onError={setError} />}
    >
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <Field label='Địa chỉ email' htmlFor='login-email' size='sm'>
          <Input
            id='login-email'
            name='email'
            type='email'
            size='lg'
            autoComplete='email'
            required
            maxLength={255}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder='Nhập email của bạn'
          />
        </Field>
        <Field label='Mật khẩu' htmlFor='login-password' size='sm'>
          <PasswordInput
            id='login-password'
            name='password'
            size='lg'
            autoComplete='current-password'
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder='Nhập mật khẩu'
          />
        </Field>
        <Link href='/authen/forgot-password' className={cn('-mt-1 self-end text-body-sm', LINK_CLASSES)}>
          Quên mật khẩu?
        </Link>

        {error && <Alert tone='danger'>{error}</Alert>}

        <Button type='submit' size='lg' shape='rounded' block disabled={submitting} className='mt-2'>
          {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
        <p className='text-center text-body-sm text-ink-muted'>
          Chưa có tài khoản?{' '}
          <Link href='/authen/register' className={LINK_CLASSES}>
            Đăng ký
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
