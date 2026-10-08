import type { CSSProperties } from 'react';
import { useState } from 'react';

import { cn } from '@/lib/cn';

import Icon from './Icon';

type RatingSize = 'sm' | 'md' | 'lg';

const STAR_SIZE: Record<RatingSize, string> = {
  sm: 'size-3.5',
  md: 'size-5',
  lg: 'size-6',
};

const TEXT_SIZE: Record<RatingSize, string> = {
  sm: 'text-caption',
  md: 'text-body',
  lg: 'text-lead',
};

function StarRow({ size, className }: { size: RatingSize; className: string }) {
  return (
    <span className={cn('flex gap-0.5', className)}>
      {[0, 1, 2, 3, 4].map((index) => (
        <Icon key={index} name='star' fill='currentColor' className={STAR_SIZE[size]} />
      ))}
    </span>
  );
}

// Dải 5 sao: phần đã chấm tô đậm, phần còn lại tô nhạt. Hai lớp cắt (clip-path)
// theo tỉ lệ điểm nên hiển thị được điểm lẻ (4.5).
function StarBar({ value, size }: { value: number; size: RatingSize }) {
  const percent = Math.max(0, Math.min(5, value)) * 20;
  const filled: CSSProperties = { clipPath: `inset(0 ${100 - percent}% 0 0)` };
  const empty: CSSProperties = { clipPath: `inset(0 0 0 ${percent}%)` };
  return (
    <span className='relative inline-flex'>
      <span style={empty}>
        <StarRow size={size} className='text-ink-subtle/60' />
      </span>
      <span className='absolute inset-0' style={filled}>
        <StarRow size={size} className='text-ink-muted' />
      </span>
    </span>
  );
}

type RatingStarsProps = Readonly<{
  value: number;
  count?: number;
  size?: RatingSize;
  // start: "4 ★★★★☆ (18)" như thẻ công thức. end: "★★★★☆ 4.0 (57)" như trang chi tiết.
  valuePosition?: 'start' | 'end' | 'none';
  className?: string;
}>;

export default function RatingStars({
  value,
  count,
  size = 'sm',
  valuePosition = 'start',
  className,
}: RatingStarsProps) {
  const label = `Đánh giá ${value} trên 5${count != null ? `, ${count} lượt` : ''}`;
  const valueText = valuePosition === 'end' ? value.toFixed(1) : String(value);

  return (
    <span
      role='img'
      aria-label={label}
      className={cn('inline-flex items-center gap-1.5 text-ink', className)}
    >
      {valuePosition === 'start' && (
        <span className={cn('font-light', TEXT_SIZE[size])}>{valueText}</span>
      )}
      <StarBar value={value} size={size} />
      {valuePosition === 'end' && (
        <span className={cn('font-medium', TEXT_SIZE[size])}>{valueText}</span>
      )}
      {count != null && (
        <span
          className={cn(
            'font-light text-ink-muted',
            size === 'sm' ? 'text-micro' : 'text-caption',
          )}
        >
          ({count})
        </span>
      )}
    </span>
  );
}

type RatingInputProps = Readonly<{
  name: string;
  defaultValue?: number;
  label: string;
}>;

// Chọn số sao (form bình luận).
export function RatingInput({ name, defaultValue = 0, label }: RatingInputProps) {
  const [value, setValue] = useState(defaultValue);
  return (
    <fieldset className='inline-flex items-center gap-2.5'>
      <legend className='sr-only'>{label}</legend>
      {[1, 2, 3, 4, 5].map((star) => (
        <label key={star} className='flex cursor-pointer'>
          <input
            type='radio'
            name={name}
            value={star}
            checked={value === star}
            onChange={() => setValue(star)}
            className='peer sr-only'
          />
          <span className='sr-only'>{star} sao</span>
          <Icon
            name='star'
            fill={star <= value ? 'currentColor' : 'none'}
            className={cn(
              'size-6 rounded-xs transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent',
              star <= value ? 'text-accent-strong' : 'text-ink',
            )}
          />
        </label>
      ))}
    </fieldset>
  );
}
