import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import AuthShell from '@/components/authen/AuthShell';
import GoogleOAuthButton from '@/components/authen/GoogleOAuthButton';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Input, { PasswordInput } from '@/components/ui/Input';
import request, { ApiError } from '@/lib/api';

const LINK_CLASSES =
  'rounded-control px-1 text-ink outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent';

export default function RegisterPage() {
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setSubmitting(true);

    try {
      await request<{ message: string }>('/authen/register', {
        method: 'POST',
        body: JSON.stringify({
          displayName: form.displayName.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      setSubmittedEmail(form.email.trim());
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Không thể gửi yêu cầu đăng ký. Vui lòng thử lại.',
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
            Chúng tôi đã gửi liên kết xác minh tới{' '}
            <strong className='font-semibold text-ink'>{submittedEmail}</strong>. Mở email và
            bấm vào liên kết để hoàn tất đăng ký.
          </>
        }
      >
        <div className='flex flex-col items-center gap-4'>
          <Alert tone='info' className='w-full'>
            Nếu chưa thấy email, hãy kiểm tra thư mục Spam hoặc Thư rác.
          </Alert>
          <Button variant='outline' onClick={() => setSubmittedEmail(null)}>
            Dùng email khác
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title='Tạo tài khoản'
      description='Điền đầy đủ thông tin. Chúng tôi sẽ gửi email để xác minh tài khoản của bạn.'
      social={<GoogleOAuthButton flow='register' action='Đăng ký' onError={setError} />}
    >
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <Field label='Tên hiển thị' htmlFor='register-name' size='sm'>
          <Input
            id='register-name'
            name='displayName'
            size='lg'
            autoComplete='name'
            required
            minLength={1}
            maxLength={255}
            value={form.displayName}
            onChange={(event) => setForm({ ...form, displayName: event.target.value })}
            placeholder='Nguyễn Văn An'
          />
        </Field>
        <Field label='Địa chỉ email' htmlFor='register-email' size='sm'>
          <Input
            id='register-email'
            name='email'
            type='email'
            size='lg'
            autoComplete='email'
            required
            maxLength={255}
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder='Nhập email của bạn'
          />
        </Field>
        <Field label='Mật khẩu' htmlFor='register-password' size='sm' hint='Từ 8 đến 72 ký tự.'>
          <PasswordInput
            id='register-password'
            name='password'
            size='lg'
            autoComplete='new-password'
            required
            minLength={8}
            maxLength={72}
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder='Nhập mật khẩu'
          />
        </Field>
        <Field label='Xác nhận mật khẩu' htmlFor='register-confirm-password' size='sm'>
          <PasswordInput
            id='register-confirm-password'
            name='confirmPassword'
            size='lg'
            autoComplete='new-password'
            required
            minLength={8}
            maxLength={72}
            value={form.confirmPassword}
            onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
            placeholder='Nhập lại mật khẩu'
          />
        </Field>

        {error && <Alert tone='danger'>{error}</Alert>}

        <Button type='submit' size='lg' shape='rounded' block disabled={submitting} className='mt-2'>
          {submitting ? 'Đang gửi email...' : 'Tạo tài khoản'}
        </Button>
        <p className='text-center text-body-sm text-ink-muted'>
          Đã có tài khoản?{' '}
          <Link href='/authen/login' className={LINK_CLASSES}>
            Đăng nhập
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
