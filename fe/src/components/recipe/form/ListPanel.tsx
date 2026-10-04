import type { ReactNode } from 'react';

// Khung nền surface chứa danh sách thêm/xoá dòng (nhãn, nguyên liệu, bước làm…).
export default function ListPanel({ children }: { children: ReactNode }) {
  return (
    <div className='flex flex-col gap-4 rounded-media bg-surface px-4 py-6 sm:px-8'>
      {children}
    </div>
  );
}

// Dòng thông báo khi danh sách chưa có mục nào.
export function EmptyRows({ children }: { children: ReactNode }) {
  return (
    <p role='status' className='text-body-sm font-light text-ink-muted'>
      {children}
    </p>
  );
}

type AddRowButtonProps = Readonly<{
  label: string;
  onClick: () => void;
  disabled?: boolean;
}>;

// Nút chữ "+ Thêm …" cuối danh sách.
export function AddRowButton({ label, onClick, disabled }: AddRowButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className='self-start rounded-control px-3 py-1 text-lead font-semibold text-ink/80 outline-none hover:bg-ink/5 focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50'
    >
      + {label}
    </button>
  );
}
