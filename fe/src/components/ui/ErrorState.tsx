import { cn } from '@/lib/cn';

import Button from './Button';
import Icon from './Icon';

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry: () => void;
  compact?: boolean;
};

// Khối báo lỗi tải dữ liệu, có nút "Thử lại".
export function ErrorState({
  title = 'Không thể tải dữ liệu',
  message,
  onRetry,
  compact = false,
}: ErrorStateProps) {
  return (
    <div
      role='alert'
      className={cn(
        'flex flex-col items-center rounded-box border border-danger-border bg-danger-soft text-center',
        compact ? 'px-5 py-6' : 'px-6 py-12',
      )}
    >
      <Icon name='circle-alert' className='size-8 text-danger' />
      <h2 className='mt-3 text-lead font-semibold text-ink'>{title}</h2>
      <p className='mt-1 max-w-md text-body-sm text-ink-muted'>{message}</p>
      <Button variant='outline' onClick={onRetry} className='mt-5'>
        <Icon name='refresh' className='size-4' />
        Thử lại
      </Button>
    </div>
  );
}
