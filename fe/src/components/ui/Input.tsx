import type { ComponentProps } from 'react';
import { useState } from 'react';

import { cn } from '@/lib/cn';

import Icon from './Icon';

type FieldStyleProps = {
  // accent: viền màu accent (các ô trong danh sách nguyên liệu / bước làm).
  tone?: 'default' | 'accent';
  size?: 'sm' | 'md' | 'lg';
};

const SIZES = {
  sm: 'h-10',
  md: 'h-12',
  lg: 'h-14',
} as const;

export function fieldClasses({ tone = 'default' }: FieldStyleProps = {}) {
  return cn(
    'w-full rounded-field border bg-field px-5 text-body-sm text-ink outline-none transition-colors placeholder:font-light placeholder:text-placeholder',
    'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40',
    'aria-invalid:border-danger',
    tone === 'accent' ? 'border-accent' : 'border-border',
  );
}

type InputProps = Omit<ComponentProps<'input'>, 'size'> & FieldStyleProps;

export default function Input({
  tone,
  size = 'md',
  className,
  ...props
}: InputProps) {
  return (
    <input
      className={cn(fieldClasses({ tone }), SIZES[size], className)}
      {...props}
    />
  );
}

type TextareaProps = ComponentProps<'textarea'> &
  Omit<FieldStyleProps, 'size'>;

export function Textarea({ tone, className, rows = 4, ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(fieldClasses({ tone }), 'resize-y py-4', className)}
      {...props}
    />
  );
}

type PasswordInputProps = Omit<InputProps, 'type'>;

export function PasswordInput({ className, size = 'md', ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className='relative'>
      <Input
        type={visible ? 'text' : 'password'}
        size={size}
        className={cn('pr-14', className)}
        {...props}
      />
      <button
        type='button'
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        aria-pressed={visible}
        className='absolute inset-y-0 right-3 grid place-items-center px-1 text-ink-subtle outline-none hover:text-ink focus-visible:text-ink'
      >
        <Icon name={visible ? 'eye-off' : 'eye'} className='size-5.5' />
      </button>
    </div>
  );
}
