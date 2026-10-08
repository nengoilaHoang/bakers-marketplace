import Link from 'next/link';

import { cn } from '@/lib/cn';

import ImagePlaceholder from './ImagePlaceholder';
import PlusCircle from './PlusCircle';

export type CollectionCardData = {
  id: string;
  name: string;
  recipeCount: number;
  updatedAgo: string;
  // Số ảnh bìa: 1 ảnh lớn hoặc lưới 4 ảnh.
  covers: 1 | 4;
};

type CollectionCardProps = Readonly<{
  collection: CollectionCardData;
  href?: string;
  className?: string;
}>;

// Thẻ bộ sưu tập công thức đã lưu.
export default function CollectionCard({
  collection,
  href = '#',
  className,
}: CollectionCardProps) {
  return (
    <article className={cn('relative flex flex-col gap-1.5', className)}>
      {collection.covers === 1 ? (
        <ImagePlaceholder className='aspect-375/290 w-full rounded-media' />
      ) : (
        <div className='grid aspect-375/290 grid-cols-2 grid-rows-2 gap-1.5'>
          {[0, 1, 2, 3].map((index) => (
            <ImagePlaceholder
              key={index}
              iconSize='sm'
              className='size-full rounded-media'
            />
          ))}
        </div>
      )}
      <div className='px-1.5'>
        <h3 className='truncate text-h5 font-medium text-ink'>
          <Link
            href={href}
            className='outline-none after:absolute after:inset-0 focus-visible:underline'
          >
            {collection.name}
          </Link>
        </h3>
        <p className='flex items-center gap-3 font-light'>
          <span className='text-caption text-ink'>
            {collection.recipeCount} công thức
          </span>
          <span className='text-meta text-ink-muted'>{collection.updatedAgo}</span>
        </p>
      </div>
    </article>
  );
}

type NewCollectionCardProps = Readonly<{
  onClick?: () => void;
  className?: string;
}>;

// Ô tạo bộ sưu tập mới (viền nét đứt).
export function NewCollectionCard({ onClick, className }: NewCollectionCardProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'flex aspect-375/250 w-full flex-col items-center justify-center gap-3 rounded-control border-2 border-dashed border-ink bg-surface-soft text-ink-muted transition-colors outline-none hover:border-accent focus-visible:ring-2 focus-visible:ring-accent',
        className,
      )}
    >
      <span className='text-h3 font-medium'>Bộ sưu tập mới</span>
      <PlusCircle tone='outline' className='size-12' />
    </button>
  );
}
