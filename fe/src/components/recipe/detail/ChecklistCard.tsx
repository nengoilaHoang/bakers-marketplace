import type { ReactNode } from 'react';

import Checkbox from '@/components/ui/Checkbox';

type ChecklistCardProps = Readonly<{
  title: string;
  items: string[];
  // Hiện thay cho danh sách khi chưa có mục nào.
  emptyText?: string;
  // Nội dung bên phải tiêu đề (ví dụ chuyển đơn vị).
  aside?: ReactNode;
  // Nội dung cuối thẻ (ví dụ nút thêm vào giỏ).
  footer?: ReactNode;
}>;

// Thẻ danh sách có ô tick: nguyên liệu, dụng cụ.
export default function ChecklistCard({ title, items, emptyText, aside, footer }: ChecklistCardProps) {
  return (
    <section className='flex flex-col gap-6 rounded-box border border-ink px-4 pt-3 pb-4 sm:pr-10'>
      <div className='flex items-center justify-between gap-4'>
        <h3 className='text-h3 font-medium text-ink'>{title}</h3>
        {aside}
      </div>
      {items.length === 0 && emptyText ? (
        <p className='text-body-sm font-light text-ink-muted sm:pl-4'>{emptyText}</p>
      ) : (
        <ul className='flex flex-col gap-2 sm:pl-4'>
          {items.map((item, index) => (
            <li key={`${index}-${item}`}>
              <Checkbox label={item} labelClassName='text-lead text-ink-muted' />
            </li>
          ))}
        </ul>
      )}
      {footer}
    </section>
  );
}
