import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

const PROVIDERS = {
  google: 'Google',
  facebook: 'Facebook',
} as const;

type SocialButtonProps = Omit<ComponentProps<'button'>, 'children'> & {
  provider: keyof typeof PROVIDERS;
  // Động từ đứng trước tên nhà cung cấp, ví dụ "Đăng nhập" → "Đăng nhập với Google".
  action: string;
};

// Nút đăng nhập/đăng ký qua tài khoản mạng xã hội (chỉ chữ, không dùng logo).
export default function SocialButton({
  provider,
  action,
  className,
  type = 'button',
  ...props
}: SocialButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-12 w-full items-center sm:w-auto sm:flex-1 justify-center rounded-control border border-ink-subtle bg-page px-4 text-body-sm text-ink transition-colors outline-none hover:border-accent focus-visible:ring-2 focus-visible:ring-accent',
        className,
      )}
      {...props}
    >
      {action} với {PROVIDERS[provider]}
    </button>
  );
}
