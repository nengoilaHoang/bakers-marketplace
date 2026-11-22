import Image from 'next/image';

import { cn } from '@/lib/cn';

import ImagePlaceholder from './ImagePlaceholder';

type CoverImageProps = Readonly<{
  // Ảnh từ API (có thể null): không có thì hiện khung giữ chỗ.
  src: string | null | undefined;
  alt: string;
  // Gợi ý độ rộng hiển thị cho next/image, ví dụ '(min-width: 1024px) 25vw, 50vw'.
  sizes: string;
  iconSize?: 'sm' | 'md' | 'lg' | 'none';
  // Khung ngoài: tỉ lệ, kích thước, bo góc (ví dụ 'aspect-square w-full rounded-media').
  className?: string;
}>;

// Ảnh phủ kín khung (sản phẩm, món trong đơn); thiếu ảnh thì dùng ImagePlaceholder cùng khung.
export default function CoverImage({ src, alt, sizes, iconSize = 'md', className }: CoverImageProps) {
  if (!src) {
    return <ImagePlaceholder label={alt} iconSize={iconSize} className={className} />;
  }

  return (
    <div className={cn('relative overflow-hidden bg-media', className)}>
      {/* unoptimized: ảnh nằm ở host bất kỳ (ảnh vendor tải lên), trình duyệt tải thẳng thay vì qua máy chủ Next */}
      <Image src={src} alt={alt} fill sizes={sizes} unoptimized className='object-cover' />
    </div>
  );
}
