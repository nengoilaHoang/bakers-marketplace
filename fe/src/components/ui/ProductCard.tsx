import Link from 'next/link';

import { cn } from '@/lib/cn';

import { formatMoney } from '@/utils/format';

import Badge from './Badge';
import CoverImage from './CoverImage';

export type ProductCardData = {
  title: string;
  href: string;
  imageUrl: string | null;
  unitPrice: number;
  currency: string;
  unit: string;
  // null: sản phẩm chưa từng được nhập kho, coi như hết hàng.
  stock: number | null;
  description?: string | null;
  // Tên tiệm bán, hiện nhỏ viết hoa phía trên tên sản phẩm.
  brandName?: string;
};

type ProductCardProps = Readonly<{
  product: ProductCardData;
  className?: string;
}>;

// Thẻ sản phẩm cùng khung với RecipeCard: ảnh vuông, tên, giá / đơn vị, nhãn hết hàng.
export default function ProductCard({ product, className }: ProductCardProps) {
  const isSoldOut = !product.stock;

  return (
    <article
      className={cn(
        'group relative flex flex-col gap-2 bg-page p-2 shadow-card transition-transform focus-within:-translate-y-0.5 hover:-translate-y-0.5',
        className,
      )}
    >
      <div className='relative'>
        <CoverImage
          src={product.imageUrl}
          alt={`Ảnh ${product.title}`}
          sizes='(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw'
          className='aspect-square w-full rounded-media'
        />
        {isSoldOut && (
          <Badge tone='neutral' className='absolute top-3 left-2.5'>
            Hết hàng
          </Badge>
        )}
      </div>

      <div className='flex flex-1 flex-col px-0.5 pb-1'>
        {product.brandName && (
          <p className='truncate text-caption font-medium text-ink-muted uppercase'>
            {product.brandName}
          </p>
        )}
        <h3 className='truncate text-h4 font-medium text-ink'>
          <Link
            href={product.href}
            className='outline-none after:absolute after:inset-0 focus-visible:underline'
          >
            {product.title}
          </Link>
        </h3>
        {product.description && (
          <p className='mt-0.5 line-clamp-2 text-caption font-light text-ink-muted'>
            {product.description}
          </p>
        )}
        <p className='mt-auto pt-2 text-lead font-semibold text-ink'>
          {formatMoney(product.unitPrice, product.currency)}
          <span className='text-caption font-light text-ink-muted'> / {product.unit}</span>
        </p>
      </div>
    </article>
  );
}

// Khung giữ chỗ khi đang tải, cùng hình khối với thẻ thật.
export function ProductCardSkeleton() {
  return (
    <div aria-hidden className='flex flex-col gap-2 bg-page p-2 shadow-card'>
      <div className='aspect-square w-full animate-pulse rounded-media bg-media' />
      <div className='flex flex-col gap-2 px-0.5 pt-1 pb-2'>
        <div className='h-6 w-3/4 animate-pulse rounded-media bg-surface-soft' />
        <div className='h-5 w-1/3 animate-pulse rounded-media bg-surface-soft' />
      </div>
    </div>
  );
}
