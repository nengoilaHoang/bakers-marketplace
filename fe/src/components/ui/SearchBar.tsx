import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

import Icon from './Icon';

type SearchBarProps = Omit<ComponentProps<'input'>, 'size'> & {
  // compact: ô tìm kiếm nhỏ trên header. hero: ô lớn viền accent (có nút lọc khi truyền onFilterClick).
  variant?: 'compact' | 'hero';
  onFilterClick?: () => void;
  // Nhận từ khoá đã cắt khoảng trắng khi người dùng gửi form.
  onSearch?: (query: string) => void;
  formClassName?: string;
};

export default function SearchBar({
  variant = 'compact',
  onFilterClick,
  onSearch,
  formClassName,
  className,
  placeholder = 'Tìm công thức',
  ...props
}: SearchBarProps) {
  const isHero = variant === 'hero';
  return (
    <form
      role='search'
      action='/recipes/search'
      onSubmit={(event) => {
        event.preventDefault();
        onSearch?.(String(new FormData(event.currentTarget).get('q') ?? '').trim());
      }}
      className={cn(
        'flex items-center gap-2 rounded-full border',
        isHero
          ? 'h-10 border-accent bg-page pl-4 pr-2'
          : 'h-8 border-border-soft bg-surface-soft pl-3.5 pr-3',
        'focus-within:ring-2 focus-within:ring-accent/50',
        formClassName,
      )}
    >
      <label className='sr-only' htmlFor={props.id ?? `search-${variant}`}>
        {placeholder}
      </label>
      <input
        id={props.id ?? `search-${variant}`}
        type='search'
        name='q'
        placeholder={placeholder}
        className={cn(
          'min-w-0 flex-1 bg-transparent font-light text-ink outline-none placeholder:text-placeholder',
          isHero ? 'text-body-sm' : 'text-caption',
          className,
        )}
        {...props}
      />
      {isHero && onFilterClick && (
        <button
          type='button'
          onClick={onFilterClick}
          aria-label='Bộ lọc'
          className='grid size-6.5 place-items-center rounded-[3px] bg-highlight text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent'
        >
          <Icon name='filter' strokeWidth={2} className='size-4.5' />
        </button>
      )}
      <button
        type='submit'
        aria-label='Tìm kiếm'
        className='grid place-items-center text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent'
      >
        <Icon name='search' className='size-4' />
      </button>
    </form>
  );
}
