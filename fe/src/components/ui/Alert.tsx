import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import Icon, { type IconName } from './Icon';

export type AlertTone = 'success' | 'warning' | 'danger' | 'info';

const TONES: Record<AlertTone, { box: string; icon: IconName; iconColor: string }> = {
  success: {
    box: 'border-success-border bg-success-soft text-success-strong',
    icon: 'circle-check',
    iconColor: 'text-success',
  },
  warning: {
    box: 'border-warning-border bg-warning-soft text-warning-strong',
    icon: 'triangle-alert',
    iconColor: 'text-warning',
  },
  danger: {
    box: 'border-danger-border bg-danger-soft text-danger-strong',
    icon: 'circle-alert',
    iconColor: 'text-danger',
  },
  info: {
    box: 'border-info-border bg-info-soft text-info-strong',
    icon: 'info',
    iconColor: 'text-info',
  },
};

type AlertProps = Readonly<{
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  // Nút/link hành động đặt cuối hộp (ví dụ "Thử lại").
  action?: ReactNode;
  className?: string;
}>;

// Hộp thông báo theo trạng thái: thành công, cảnh báo, lỗi, thông tin.
export default function Alert({
  tone = 'info',
  title,
  children,
  action,
  className,
}: AlertProps) {
  const style = TONES[tone];
  return (
    <div
      role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-box border px-4 py-3', style.box, className)}
    >
      <Icon name={style.icon} className={cn('mt-0.5 size-5', style.iconColor)} />
      <div className='flex min-w-0 flex-1 flex-col gap-1'>
        {title && <p className='text-body-sm font-semibold'>{title}</p>}
        {children && <div className='text-body-sm'>{children}</div>}
        {action && <div className='mt-1'>{action}</div>}
      </div>
    </div>
  );
}
