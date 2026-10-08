import Link from 'next/link';

import { useDropdown } from '@/hooks/useDropdown';
import { cn } from '@/lib/cn';

import { buttonClasses } from './Button';

const CREATE_ACTIONS = [
  { label: 'Viết bài mới', href: '/posts/new' },
  { label: 'Thêm công thức', href: '/recipes/new' },
];

// Nút "+ Tạo" trên header: chọn tạo bài viết hoặc công thức.
export default function CreateMenu() {
  const { ref, isOpen, toggle, close } = useDropdown();

  return (
    <div ref={ref} className='relative'>
      <button
        type='button'
        onClick={toggle}
        aria-expanded={isOpen}
        aria-haspopup='menu'
        aria-label='Tạo mới'
        className={cn(buttonClasses({ size: 'sm' }), 'uppercase')}
      >
        +<span className='max-sm:sr-only'>Tạo</span>
      </button>

      {isOpen && (
        <div
          role='menu'
          aria-label='Tạo mới'
          className='absolute top-full right-0 z-30 mt-2 w-48 overflow-hidden rounded-box bg-page py-1 shadow-soft'
        >
          {CREATE_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              role='menuitem'
              onClick={close}
              className='block px-4 py-2 text-body-sm text-ink outline-none hover:bg-highlight-soft focus-visible:bg-highlight-soft'
            >
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
