import Link from 'next/link';

import { cn } from '@/lib/cn';

import Icon from './Icon';
import ImagePlaceholder from './ImagePlaceholder';

export type ArticleCardData = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  views: number;
};

type ArticleCardProps = Readonly<{
  article: ArticleCardData;
  href?: string;
  className?: string;
}>;

// Thẻ bài viết ngang: ảnh bên trái, nội dung bên phải.
export default function ArticleCard({
  article,
  href = '#',
  className,
}: ArticleCardProps) {
  return (
    <article
      className={cn(
        'relative grid border border-ink bg-page sm:grid-cols-[4fr_5fr]',
        className,
      )}
    >
      <ImagePlaceholder
        label={`Ảnh bài viết ${article.title}`}
        className='aspect-474/350 border-b border-ink sm:aspect-auto sm:border-r sm:border-b-0'
      />
      <div className='flex flex-col gap-3 px-6 py-6 sm:px-10'>
        <p className='text-meta font-medium text-ink-muted'>{article.author}</p>
        <h3 className='line-clamp-2 text-h4 font-medium text-ink'>
          <Link
            href={href}
            className='outline-none after:absolute after:inset-0 focus-visible:underline'
          >
            {article.title}
          </Link>
        </h3>
        <p className='line-clamp-3 text-caption font-light text-ink-muted'>
          {article.excerpt}
        </p>
        <div className='mt-auto flex items-center justify-between border-t border-line pt-2 text-micro font-light text-ink'>
          <span>{article.views} lượt xem</span>
          <Icon name='heart' className='size-3.5' />
        </div>
      </div>
    </article>
  );
}
