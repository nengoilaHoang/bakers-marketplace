import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/cn';

type IconButtonStyleProps = {
  // outline: vòng tròn viền mực (nút chia sẻ). muted: viền xám. ghost: không viền.
  variant?: 'outline' | 'muted' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

const VARIANTS = {
  outline: 'border border-ink hover:bg-ink/5',
  muted: 'border border-ink-muted hover:bg-ink/5',
  ghost: 'hover:bg-ink/5',
} as const;

const SIZES = {
  sm: 'size-8',
  md: 'size-9.5',
  lg: 'size-13',
} as const;

function iconButtonClasses({
  variant = 'outline',
  size = 'md',
}: IconButtonStyleProps) {
  return cn(
    'inline-grid shrink-0 place-items-center rounded-full text-ink transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent',
    VARIANTS[variant],
    SIZES[size],
  );
}

type IconButtonProps = Omit<ComponentProps<'button'>, 'children'> &
  IconButtonStyleProps & {
    label: string;
    children: ReactNode;
  };

export default function IconButton({
  label,
  variant,
  size,
  className,
  children,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(iconButtonClasses({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  );
}

type IconLinkProps = Omit<ComponentProps<typeof Link>, 'children'> &
  IconButtonStyleProps & {
    label: string;
    children: ReactNode;
  };

export function IconLink({
  label,
  variant,
  size,
  className,
  children,
  ...props
}: IconLinkProps) {
  return (
    <Link
      aria-label={label}
      title={label}
      className={cn(iconButtonClasses({ variant, size }), className)}
      {...props}
    >
      {children}
    </Link>
  );
}
