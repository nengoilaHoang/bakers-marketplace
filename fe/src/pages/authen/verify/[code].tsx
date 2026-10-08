import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

import AuthShell from '@/components/authen/AuthShell';
import Button, { ButtonLink } from '@/components/ui/Button';
import request, { ApiError } from '@/lib/api';

const TITLES = {
  loading: 'Đang xác minh email',
  success: 'Xác minh thành công',
  error: 'Không thể xác minh',
} as const;

export default function VerifyEmailPage() {
  const router = useRouter();
  const requestedCode = useRef<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Đang xác minh địa chỉ email của bạn...');

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const code = typeof router.query.code === 'string' ? router.query.code : '';
    const controller = new AbortController();
    const requestTimer = window.setTimeout(() => {
      if (!code) {
        setStatus('error');
        setMessage('Liên kết xác minh không hợp lệ.');
        return;
      }

      if (requestedCode.current === `${code}:${attempt}`) {
        return;
      }

      requestedCode.current = `${code}:${attempt}`;
      setStatus('loading');
      setMessage('Đang xác minh địa chỉ email của bạn...');

      void request(`/authen/verify/${encodeURIComponent(code)}`, {
        method: 'GET',
        signal: controller.signal,
      })
        .then(() => {
          setStatus('success');
          setMessage('Email đã được xác minh và tài khoản của bạn đã sẵn sàng.');
        })
        .catch((requestError: unknown) => {
          if (requestError instanceof DOMException && requestError.name === 'AbortError') {
            return;
          }

          setStatus('error');
          setMessage(
            requestError instanceof ApiError
              ? requestError.message
              : 'Không thể xác minh email. Liên kết có thể đã hết hạn.',
          );
        });
    }, 0);

    return () => {
      window.clearTimeout(requestTimer);
      controller.abort();
    };
  }, [attempt, router.isReady, router.query.code]);

  return (
    <AuthShell title={TITLES[status]} status={status} description={message}>
      {status === 'success' && (
        <ButtonLink href='/' size='lg' shape='rounded' block>
          Tiếp tục
        </ButtonLink>
      )}

      {status === 'error' && (
        <div className='flex flex-col gap-3'>
          <Button
            size='lg'
            shape='rounded'
            block
            onClick={() => setAttempt((current) => current + 1)}
          >
            Thử lại
          </Button>
          <ButtonLink href='/authen/register' variant='outline' size='lg' shape='rounded' block>
            Đăng ký lại
          </ButtonLink>
        </div>
      )}
    </AuthShell>
  );
}
