import Link from 'next/link';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

export type ButtonVariant =
  | 'primary'
  | 'outline'
  | 'outline-inverse'
  | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

type ButtonStyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  // pill: bo tròn hoàn toàn (mặc định). rounded: bo góc vừa (nút rộng trong form đăng nhập).
  shape?: 'pill' | 'rounded';
  block?: boolean;
};

const VARIANTS: Record<ButtonVariant, string> = {
  // CTA chính: nền accent, chữ tối, viền mảnh màu mực.
  primary:
    'border border-ink bg-accent text-on-accent hover:bg-accent-strong',
  // Nút phụ trên nền sáng.
  outline: 'border border-ink bg-transparent text-ink hover:bg-ink/5',
  // Nút phụ trên nền tối (section primary).
  'outline-inverse':
    'border border-accent bg-transparent text-on-primary hover:bg-accent hover:text-on-accent',
  ghost: 'border border-transparent bg-transparent text-ink hover:bg-ink/5',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-4 text-body-sm',
  md: 'h-10 gap-2 px-5 text-body',
  lg: 'h-14 gap-2.5 px-6 text-lead',
  // Nút lớn trong banner.
  xl: 'h-16 gap-3 px-10 text-h4',
};

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  shape = 'pill',
  block = false,
}: ButtonStyleProps = {}) {
  return cn(
    'inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    shape === 'pill' ? 'rounded-full' : 'rounded-control',
    VARIANTS[variant],
    SIZES[size],
    block && 'w-full',
  );
}

type ButtonProps = ComponentProps<'button'> & ButtonStyleProps;

export default function Button({
  variant,
  size,
  shape,
  block,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonClasses({ variant, size, shape, block }), className)}
      {...props}
    />
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & ButtonStyleProps;

export function ButtonLink({
  variant,
  size,
  shape,
  block,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonClasses({ variant, size, shape, block }), className)}
      {...props}
    />
  );
}
