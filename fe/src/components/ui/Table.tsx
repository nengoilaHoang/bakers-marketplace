import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/cn';

type TableProps = Readonly<{
  // Mô tả bảng cho trình đọc màn hình (ẩn khỏi giao diện).
  caption?: string;
  children: ReactNode;
  className?: string;
}>;

// Bảng dữ liệu cho trang quản trị: khung bo góc, cuộn ngang trên màn hình hẹp.
export default function Table({ caption, children, className }: TableProps) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-box border border-line bg-surface',
        className,
      )}
    >
      <table className='w-full border-collapse text-left text-body-sm text-ink [&_tbody_tr:last-child>td]:border-b-0'>
        {caption && <caption className='sr-only'>{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

type CellAlign = 'left' | 'right' | 'center';

const ALIGN: Record<CellAlign, string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

type ThProps = Omit<ComponentProps<'th'>, 'align'> & { align?: CellAlign };

export function Th({ align = 'left', className, ...props }: ThProps) {
  return (
    <th
      scope='col'
      className={cn(
        'border-b border-line bg-surface-soft px-4 py-3 text-meta font-semibold whitespace-nowrap text-ink-muted uppercase',
        ALIGN[align],
        className,
      )}
      {...props}
    />
  );
}

type TdProps = Omit<ComponentProps<'td'>, 'align'> & { align?: CellAlign };

export function Td({ align = 'left', className, ...props }: TdProps) {
  return (
    <td
      className={cn(
        'border-b border-line px-4 py-3 align-middle',
        ALIGN[align],
        className,
      )}
      {...props}
    />
  );
}
