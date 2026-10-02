import { useEffect, useRef, useState } from 'react';

import NavLink from './NavLink';

const CREATE_ACTIONS = [
  { label: 'Bài viết', href: '/posts/new' },
  { label: 'Công thức', href: '/recipes/new' },
];

export default function CreateMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeWhenClickingOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', closeWhenClickingOutside);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeWhenClickingOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className='relative'>
      <button
        type='button'
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-haspopup='menu'
        className='inline-flex min-h-9 cursor-pointer items-center justify-center rounded-full bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950'
      >
        + Tạo
      </button>

      {isOpen && (
        <div
          role='menu'
          aria-label='Tạo mới'
          className='absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg'
        >
          {CREATE_ACTIONS.map((action) => (
            <NavLink
              key={action.href}
              href={action.href}
              role='menuitem'
              className='block cursor-pointer px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:bg-zinc-100 focus-visible:outline-none'
              onClick={() => setIsOpen(false)}
            >
              {action.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
