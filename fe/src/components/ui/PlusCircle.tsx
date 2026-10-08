import { cn } from '@/lib/cn';

import Icon from './Icon';

type PlusCircleProps = Readonly<{
  // Đặt trong <details className='group'>: tự đổi thành dấu trừ khi mở.
  collapsible?: boolean;
  // accent: vòng tròn tô màu accent. outline: vòng tròn nét (CirclePlus).
  tone?: 'accent' | 'outline';
  className?: string;
}>;

// Dấu cộng trong vòng tròn (FAQ, tải ảnh, tạo bộ sưu tập).
export default function PlusCircle({
  collapsible = false,
  tone = 'accent',
  className,
}: PlusCircleProps) {
  if (tone === 'outline') {
    return <Icon name='plus-circle' strokeWidth={1.5} className={className ?? 'size-4'} />;
  }
  return (
    <span
      aria-hidden
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full bg-accent text-on-accent',
        className ?? 'size-4',
      )}
    >
      <Icon
        name='plus'
        strokeWidth={2.5}
        className={cn('size-[70%]', collapsible && 'group-open:hidden')}
      />
      {collapsible && (
        <Icon name='minus' strokeWidth={2.5} className='hidden size-[70%] group-open:block' />
      )}
    </span>
  );
}
