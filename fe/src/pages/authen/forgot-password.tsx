import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import AuthShell from '@/components/authen/AuthShell';
import Alert from '@/components/ui/Alert';
import Button, { ButtonLink } from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import request, { ApiError } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const normalizedEmail = email.trim();

    try {
      await request<{ message: string }>('/authen/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail }),
      });
      setSubmittedEmail(normalizedEmail);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedEmail) {
    return (
      <AuthShell
        title='Kiểm tra email của bạn'
        status='success'
        description={
          <>
            Liên kết đặt lại mật khẩu đã được gửi tới{' '}
            <strong className='font-semibold text-ink'>{submittedEmail}</strong>.
          </>
        }
      >
        <div className='flex flex-col gap-4'>
          <Alert tone='info'>
            Liên kết có hiệu lực trong 15 phút. Nếu chưa thấy email, hãy kiểm tra thư mục Spam
            hoặc Thư rác.
          </Alert>
          <ButtonLink href='/authen/login' size='lg' shape='rounded' block>
            Về trang đăng nhập
          </ButtonLink>
          <Button
            variant='outline'
            size='lg'
            shape='rounded'
            block
            onClick={() => {
              setSubmittedEmail(null);
              setError(null);
            }}
          >
            Dùng email khác
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title='Quên mật khẩu?'
      description='Nhập email dùng để đăng nhập. Chúng tôi sẽ gửi cho bạn một liên kết để tạo mật khẩu mới.'
    >
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <Field label='Địa chỉ email' htmlFor='forgot-email' size='sm'>
          <Input
            id='forgot-email'
            name='email'
            type='email'
            size='lg'
            autoComplete='email'
            autoFocus
            required
            maxLength={255}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder='Nhập email của bạn'
          />
        </Field>

        {error && <Alert tone='danger'>{error}</Alert>}

        <Button type='submit' size='lg' shape='rounded' block disabled={submitting} className='mt-2'>
          {submitting ? 'Đang gửi email...' : 'Gửi liên kết đặt lại mật khẩu'}
        </Button>
        <p className='text-center text-body-sm text-ink-muted'>
          Nhớ ra mật khẩu?{' '}
          <Link
            href='/authen/login'
            className='rounded-control px-1 text-ink outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent'
          >
            Đăng nhập
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
