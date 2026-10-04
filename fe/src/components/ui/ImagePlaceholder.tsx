import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import Icon from './Icon';

type ImagePlaceholderProps = Readonly<{
  // Mô tả ảnh sẽ đặt vào đây (dùng cho alt khi thay ảnh thật).
  label?: string;
  iconSize?: 'sm' | 'md' | 'lg' | 'none';
  // media: nền trung tính. primary / primary-soft: đặt trên hoặc cạnh khối màu primary.
  tone?: 'media' | 'primary' | 'primary-soft';
  className?: string;
  children?: ReactNode;
}>;

const ICON_SIZES = {
  sm: 'size-8',
  md: 'size-14',
  lg: 'size-20',
} as const;

const TONES = {
  media: 'bg-media',
  primary: 'bg-primary',
  'primary-soft': 'bg-primary-soft',
} as const;

// Khung giữ chỗ cho ảnh khi chưa có ảnh thật. Đặt kích thước/tỉ lệ/vị trí qua className
// (thêm `relative` nếu cần đặt phần tử con tuyệt đối bên trong).
export default function ImagePlaceholder({
  label,
  iconSize = 'md',
  tone = 'media',
  className,
  children,
}: ImagePlaceholderProps) {
  return (
    <div
      role={label ? 'img' : undefined}
      aria-label={label}
      className={cn(
        'grid place-items-center overflow-hidden text-page',
        TONES[tone],
        className,
      )}
    >
      {iconSize !== 'none' && (
        <Icon
          name='image'
          strokeWidth={1.25}
          className={cn('max-w-[45%]', ICON_SIZES[iconSize])}
        />
      )}
      {children}
    </div>
  );
}
