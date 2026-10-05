import useAuth from '@/hooks/user/useAuthContext';
import { ApiError } from '@/lib/api';
import {
  consumeGoogleOAuthState,
  getGoogleOAuthRedirectUri,
} from '@/lib/googleOAuth';
import { googleRegister } from '@/services/users';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

import AuthShell from '@/components/authen/AuthShell';
import Alert from '@/components/ui/Alert';
import Button, { ButtonLink } from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';

function firstQueryValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default function GoogleOAuthRegisterCallbackPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const callbackStarted = useRef(false);
  const [authorizationCode, setAuthorizationCode] = useState<string | null>(
    null,
  );
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady || callbackStarted.current) {
      return;
    }

    callbackStarted.current = true;

    const oauthError = firstQueryValue(router.query.error);
    const oauthErrorDescription = firstQueryValue(
      router.query.error_description,
    );
    const code = firstQueryValue(router.query.code);
    const state = firstQueryValue(router.query.state);

    if (oauthError) {
      consumeGoogleOAuthState(state, 'register');
      queueMicrotask(() =>
        setError(
          oauthErrorDescription ||
            (oauthError === 'access_denied'
              ? 'Bạn đã hủy đăng ký bằng Google.'
              : 'Google không thể xác thực tài khoản.'),
        ),
      );
      return;
    }

    if (!code || !state || !consumeGoogleOAuthState(state, 'register')) {
      queueMicrotask(() =>
        setError('Yêu cầu đăng ký Google không hợp lệ hoặc đã hết hạn.'),
      );
      return;
    }

    queueMicrotask(() => setAuthorizationCode(code));
  }, [router]);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedDisplayName = displayName.trim();

    if (!authorizationCode || !normalizedDisplayName) {
      setError('Vui lòng nhập tên hiển thị.');
      return;
    }

    setSubmitting(true);
    setError(null);

    googleRegister(
      authorizationCode,
      getGoogleOAuthRedirectUri('register'),
      normalizedDisplayName,
    )
      .then((user) => {
        setUser(user);
        return router.replace('/');
      })
      .catch((e) => {
        setError(
          e instanceof ApiError
            ? e.message
            : 'Không thể hoàn tất đăng ký. Vui lòng thử lại.',
        );
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      <Head>
        <meta name='robots' content='noindex' />
      </Head>
      {error && !authorizationCode ? (
        <AuthShell title='Không thể tiếp tục đăng ký' status='error'>
          <div className='flex flex-col gap-4'>
            <Alert tone='danger'>{error}</Alert>
            <ButtonLink href='/authen/register' size='lg' shape='rounded' block>
              Quay lại đăng ký
            </ButtonLink>
          </div>
        </AuthShell>
      ) : authorizationCode ? (
        <AuthShell
          title='Hoàn tất đăng ký'
          description='Nhập tên hiển thị. Email sẽ được lấy trực tiếp từ tài khoản Google của bạn.'
        >
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <Field label='Tên hiển thị' htmlFor='google-display-name' size='sm'>
              <Input
                id='google-display-name'
                name='displayName'
                size='lg'
                autoComplete='name'
                required
                minLength={1}
                maxLength={255}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder='Nguyễn Văn An'
              />
            </Field>

            {error && <Alert tone='danger'>{error}</Alert>}

            <Button
              type='submit'
              size='lg'
              shape='rounded'
              block
              disabled={submitting}
              className='mt-2'
            >
              {submitting ? 'Đang hoàn tất...' : 'Hoàn tất đăng ký'}
            </Button>
          </form>
        </AuthShell>
      ) : (
        <AuthShell
          title='Đang xác thực tài khoản Google'
          status='loading'
          description='Vui lòng không đóng trang này.'
        />
      )}
    </>
  );
}
