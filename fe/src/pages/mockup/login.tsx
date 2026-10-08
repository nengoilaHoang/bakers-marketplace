import Link from 'next/link';

import AuthShell from '@/components/authen/AuthShell';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Input, { PasswordInput } from '@/components/ui/Input';
import SocialButton from '@/components/ui/SocialButton';

// Mockup: login page (Figma node 1:1269)
export default function MockupLoginPage() {
  return (
    <AuthShell
      title='Đăng nhập'
      social={
        <>
          <SocialButton provider='google' action='Đăng nhập' />
          <SocialButton provider='facebook' action='Đăng nhập' />
        </>
      }
    >
      <form onSubmit={(event) => event.preventDefault()} className='flex flex-col gap-4'>
        <Field label='Địa chỉ email' htmlFor='login-email' size='sm'>
          <Input id='login-email' type='email' size='lg' autoComplete='email' placeholder='Nhập email của bạn' />
        </Field>
        <Field label='Mật khẩu' htmlFor='login-password' size='sm'>
          <PasswordInput id='login-password' size='lg' autoComplete='current-password' placeholder='Nhập mật khẩu' />
        </Field>
        <Button type='submit' size='lg' shape='rounded' block className='mt-2'>
          Đăng nhập
        </Button>
        <p className='text-center text-body-sm text-ink-muted'>
          Chưa có tài khoản?{' '}
          <Link href='/mockup/signup' className='px-1 text-ink hover:underline'>
            Đăng ký
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
