import Link from 'next/link';

import { cn } from '@/lib/cn';

import Icon from './Icon';
import ImagePlaceholder from './ImagePlaceholder';

type CategoryCircleProps = Readonly<{
  label: string;
  href: string;
  // Ô cuối "Xem tất cả" có mũi tên.
  withArrow?: boolean;
  className?: string;
}>;

// Ô danh mục hình tròn: ảnh + lớp tối + chữ trắng ở giữa.
export default function CategoryCircle({
  label,
  href,
  withArrow = false,
  className,
}: CategoryCircleProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative block aspect-square overflow-hidden rounded-full outline-none focus-visible:ring-4 focus-visible:ring-accent',
        className,
      )}
    >
      <ImagePlaceholder iconSize='none' tone='primary-soft' className='absolute inset-0' />
      <span className='absolute inset-0 bg-ink/35 transition-colors group-hover:bg-ink/20' />
      <span className='absolute inset-0 grid place-items-center p-3 text-center'>
        <span className='inline-flex items-center gap-2 text-h4 font-semibold text-on-primary'>
          {label}
          {withArrow && <Icon name='arrow-right' strokeWidth={2.25} className='size-6' />}
        </span>
      </span>
    </Link>
  );
}
