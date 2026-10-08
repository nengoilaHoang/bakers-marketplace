import Link from 'next/link';

import AuthShell from '@/components/authen/AuthShell';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Input, { PasswordInput } from '@/components/ui/Input';
import SocialButton from '@/components/ui/SocialButton';

// Mockup: Sign up page (Figma node 1:1230)
export default function MockupSignupPage() {
  return (
    <AuthShell
      title='Tạo tài khoản'
      social={
        <>
          <SocialButton provider='google' action='Đăng ký' />
          <SocialButton provider='facebook' action='Đăng ký' />
        </>
      }
    >
      <form onSubmit={(event) => event.preventDefault()} className='flex flex-col gap-4'>
        <Field label='Họ và tên' htmlFor='signup-name' size='sm'>
          <Input id='signup-name' size='lg' autoComplete='name' placeholder='Nhập họ và tên' />
        </Field>
        <Field label='Địa chỉ email' htmlFor='signup-email' size='sm'>
          <Input id='signup-email' type='email' size='lg' autoComplete='email' placeholder='Nhập email của bạn' />
        </Field>
        <Field label='Mật khẩu' htmlFor='signup-password' size='sm'>
          <PasswordInput id='signup-password' size='lg' autoComplete='new-password' placeholder='Nhập mật khẩu' />
        </Field>
        <Button type='submit' size='lg' shape='rounded' block className='mt-2'>
          Tạo tài khoản
        </Button>
        <p className='text-center text-body-sm text-ink-muted'>
          Đã có tài khoản?{' '}
          <Link href='/mockup/login' className='px-1 text-ink hover:underline'>
            Đăng nhập
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
