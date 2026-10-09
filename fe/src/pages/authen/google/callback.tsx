import useAuth from '@/hooks/user/useAuthContext';
import { ApiError } from '@/lib/api';
import {
  consumeGoogleOAuthState,
  getGoogleOAuthRedirectUri,
} from '@/lib/googleOAuth';
import { googleLogin } from '@/services/users';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

import AuthShell from '@/components/authen/AuthShell';
import Alert from '@/components/ui/Alert';
import { ButtonLink } from '@/components/ui/Button';

function firstQueryValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default function GoogleOAuthCallbackPage() {
  const router = useRouter();
  const { setAccount } = useAuth();
  const callbackStarted = useRef(false);
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
      consumeGoogleOAuthState(state, 'login');
      queueMicrotask(() =>
        setError(
          oauthErrorDescription ||
            (oauthError === 'access_denied'
              ? 'Bạn đã hủy đăng nhập bằng Google.'
              : 'Google không thể xác thực tài khoản.'),
        ),
      );
      return;
    }

    if (!code || !state || !consumeGoogleOAuthState(state, 'login')) {
      queueMicrotask(() =>
        setError('Yêu cầu đăng nhập Google không hợp lệ hoặc đã hết hạn.'),
      );
      return;
    }

    void googleLogin(code, getGoogleOAuthRedirectUri('login'))
      .then((user) => {
        setAccount(user);

        const queryPath =
          typeof router.query.next === 'string' &&
          router.query.next.startsWith('/')
            ? router.query.next
            : '/';

        const isVendor = user.role === 'VENDOR';
        let destination = queryPath;

        if (isVendor) {
          destination = queryPath.startsWith('/vendors')
            ? queryPath
            : '/vendors';
        } else if (queryPath.startsWith('/vendors')) {
          destination = '/';
        }

        return router.replace(destination);
      })
      .catch((requestError: unknown) => {
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : 'Không thể đăng nhập bằng Google. Vui lòng thử lại.',
        );
      });
  }, [router, setAccount]);

  return (
    <>
      <Head>
        <meta name='robots' content='noindex' />
      </Head>
      <AuthShell
        title={error ? 'Không thể xác thực' : 'Đang xác thực với Google'}
        status={error ? 'error' : 'loading'}
        description={error ? undefined : 'Vui lòng không đóng trang này.'}
      >
        {error && (
          <div className='flex flex-col gap-4'>
            <Alert tone='danger'>{error}</Alert>
            <ButtonLink href='/authen/login' size='lg' shape='rounded' block>
              Quay lại đăng nhập
            </ButtonLink>
          </div>
        )}
      </AuthShell>
    </>
  );
}
