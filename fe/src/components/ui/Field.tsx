import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type FieldProps = Readonly<{
  label: ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: ReactNode;
  // Thông báo lỗi dưới ô nhập (gắn thêm aria-invalid cho ô nhập để viền đỏ).
  error?: ReactNode;
  // sm: nhãn nhẹ (form đăng nhập). md: nhãn đậm (form thêm công thức, hồ sơ).
  size?: 'sm' | 'md';
  // inline: nhãn nằm cùng hàng với ô nhập.
  inline?: boolean;
  children: ReactNode;
  className?: string;
}>;

export default function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  size = 'md',
  inline = false,
  children,
  className,
}: FieldProps) {
  return (
    <div
      className={cn(
        'flex',
        inline ? 'flex-wrap items-center gap-3' : 'flex-col gap-2',
        className,
      )}
    >
      <div className='flex flex-col gap-0.5'>
        <label
          htmlFor={htmlFor}
          className={cn(
            size === 'md'
              ? 'text-lead font-medium text-ink'
              : 'text-body-sm text-ink-muted',
          )}
        >
          {label}
          {required && (
            <span aria-hidden className='ml-1 font-semibold text-danger'>
              *
            </span>
          )}
        </label>
        {hint && <p className='text-body text-ink-muted/60'>{hint}</p>}
      </div>
      {children}
      {error && (
        <p role='alert' className='text-caption text-danger-strong'>
          {error}
        </p>
      )}
    </div>
  );
}
