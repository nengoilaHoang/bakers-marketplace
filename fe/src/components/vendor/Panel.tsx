import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/cn';

type PanelProps = Readonly<{
  title?: ReactNode;
  description?: ReactNode;
  // Nút/link đặt bên phải tiêu đề.
  actions?: ReactNode;
  // Có onSubmit thì khối được render thành <form>.
  onSubmit?: ComponentProps<'form'>['onSubmit'];
  children: ReactNode;
  className?: string;
}>;

// Khối nội dung có viền trong khu vendor: thông tin, form, danh sách nhỏ.
export default function Panel({
  title,
  description,
  actions,
  onSubmit,
  children,
  className,
}: PanelProps) {
  const panelClassName = cn('rounded-box border border-line bg-surface p-5 sm:p-6', className);
  const content = (
    <>
      {(title || actions) && (
        <div className='mb-5 flex flex-wrap items-start justify-between gap-3'>
          <div className='min-w-0'>
            {title && <h2 className='text-h5 font-semibold text-ink'>{title}</h2>}
            {description && (
              <p className='mt-1 text-body-sm text-ink-muted'>{description}</p>
            )}
          </div>
          {actions && <div className='flex flex-wrap items-center gap-2'>{actions}</div>}
        </div>
      )}
      {children}
    </>
  );

  return onSubmit ? (
    <form onSubmit={onSubmit} className={panelClassName}>
      {content}
    </form>
  ) : (
    <section className={panelClassName}>{content}</section>
  );
}

// Khung giữ chỗ khi đang tải, cùng hình khối với Panel.
export function PanelSkeleton({ className }: { className?: string }) {
  return (
    <div
      role='status'
      aria-label='Đang tải'
      className={cn('h-48 animate-pulse rounded-box bg-surface-soft', className)}
    />
  );
}
