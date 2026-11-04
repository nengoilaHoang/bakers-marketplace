import Link from 'next/link';
import type { ReactNode } from 'react';

import Icon, { type IconName } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

type StatCardProps = Readonly<{
  label: string;
  value: ReactNode;
  icon?: IconName;
  // Màu của icon, theo trạng thái số liệu.
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  // Thẻ đang được chọn làm bộ lọc.
  active?: boolean;
  onClick?: () => void;
  href?: string;
}>;

const ICON_TONES = {
  default: 'bg-surface-soft text-ink-muted',
  success: 'bg-success-soft text-success-strong',
  warning: 'bg-warning-soft text-warning-strong',
  danger: 'bg-danger-soft text-danger-strong',
  info: 'bg-info-soft text-info-strong',
} as const;

// Thẻ số liệu cho trang tổng quan / tồn kho. Có onClick hoặc href thì bấm được.
export default function StatCard({
  label,
  value,
  icon,
  tone = 'default',
  active = false,
  onClick,
  href,
}: StatCardProps) {
  const className = cn(
    'flex w-full items-center gap-4 rounded-box border bg-surface px-5 py-4 text-left transition-colors outline-none',
    active ? 'border-ink ring-1 ring-ink' : 'border-line',
    (onClick || href) && 'hover:border-ink focus-visible:ring-2 focus-visible:ring-accent',
  );

  const content = (
    <>
      {icon && (
        <span className={cn('grid size-10 shrink-0 place-items-center rounded-full', ICON_TONES[tone])}>
          <Icon name={icon} className='size-5' />
        </span>
      )}
      <span className='flex min-w-0 flex-col'>
        <span className='text-caption text-ink-muted'>{label}</span>
        <span className='text-h4 font-semibold text-ink'>{value}</span>
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type='button' aria-pressed={active} onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
