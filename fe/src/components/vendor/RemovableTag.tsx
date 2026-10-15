import type { ReactNode } from 'react';

import Icon from '@/components/ui/Icon';

type RemovableTagProps = Readonly<{
  children: ReactNode;
  // Nhãn cho trình đọc màn hình, ví dụ "Xoá tag bánh kem".
  removeLabel: string;
  onRemove: () => void;
  disabled?: boolean;
}>;

// Viên thuốc có nút xoá (tag, bộ sưu tập đã gán…).
export default function RemovableTag({
  children,
  removeLabel,
  onRemove,
  disabled = false,
}: RemovableTagProps) {
  return (
    <span className='inline-flex items-center gap-1 rounded-full border border-line bg-surface-soft py-1 pr-1 pl-3 text-body-sm text-ink'>
      {children}
      <button
        type='button'
        aria-label={removeLabel}
        title={removeLabel}
        disabled={disabled}
        onClick={onRemove}
        className='grid size-6 place-items-center rounded-full text-ink-muted outline-none hover:bg-ink/10 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50'
      >
        <Icon name='close' className='size-3.5' />
      </button>
    </span>
  );
}
