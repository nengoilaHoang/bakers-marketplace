import { cn } from '@/lib/cn';

import Icon from './Icon';

type AvatarSize = 'sm' | 'md' | 'lg';

type AvatarProps = Readonly<{
  size?: AvatarSize;
  // Hiện nút máy ảnh để đổi ảnh đại diện.
  editable?: boolean;
  label?: string;
  className?: string;
}>;

const SIZES: Record<AvatarSize, string> = {
  sm: 'size-10',
  md: 'size-22',
  lg: 'size-38',
};

// Ảnh đại diện tròn (placeholder hình người khi chưa có ảnh).
export default function Avatar({
  size = 'md',
  editable = false,
  label = 'Ảnh đại diện',
  className,
}: AvatarProps) {
  return (
    <div className={cn('relative shrink-0', SIZES[size], className)}>
      <div
        role='img'
        aria-label={label}
        className='grid size-full place-items-center overflow-hidden rounded-full bg-primary-soft text-page'
      >
        <Icon name='user' strokeWidth={1.5} className='size-[46%]' />
      </div>
      {editable && (
        <button
          type='button'
          aria-label='Đổi ảnh đại diện'
          className='absolute right-[2%] bottom-[3%] grid size-[28%] place-items-center rounded-full border border-ink bg-page text-ink outline-none hover:bg-highlight-soft focus-visible:ring-2 focus-visible:ring-accent'
        >
          <Icon name='camera' className='size-[60%]' />
        </button>
      )}
    </div>
  );
}
