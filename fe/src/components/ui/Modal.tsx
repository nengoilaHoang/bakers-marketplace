import { useEffect, useId, useRef, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

import Icon from './Icon';
import IconButton from './IconButton';

type ModalProps = Readonly<{
  open: boolean;
  onClose: () => void;
  // Tiêu đề hiện ở đầu hộp (font tiêu đề serif); dùng làm tên hộp thoại cho trình đọc màn hình.
  title: ReactNode;
  children: ReactNode;
  // narrow: hồ sơ, xác nhận ngắn. content: form dài hơn.
  size?: 'narrow' | 'content';
}>;

// Hộp thoại nổi giữa màn hình, dùng <dialog> gốc của trình duyệt: khoá cuộn nền,
// giữ focus bên trong, đóng bằng Esc, nút X hoặc bấm ra ngoài.
export default function Modal({ open, onClose, title, children, size = 'narrow' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Bấm vào nền mờ (chính thẻ dialog, ngoài khung nội dung) thì đóng.
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        'm-auto w-full rounded-modal bg-page p-0 text-ink shadow-raised backdrop:bg-ink/40',
        size === 'narrow' ? 'max-w-md' : 'max-w-xl',
      )}
    >
      <div className='flex flex-col gap-5 p-6 sm:p-8'>
        <div className='flex items-start justify-between gap-4'>
          <h2 id={titleId} className='font-heading text-h4 font-semibold text-ink'>
            {title}
          </h2>
          <IconButton label='Đóng' variant='ghost' size='sm' onClick={onClose}>
            <Icon name='close' className='size-4' />
          </IconButton>
        </div>
        {children}
      </div>
    </dialog>
  );
}
