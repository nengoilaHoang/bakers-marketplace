import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import Icon from './Icon';

type CalloutProps = Readonly<{
  title: ReactNode;
  children: ReactNode;
  className?: string;
}>;

// Khối mẹo nổi bật trên nền primary (ví dụ "Mẹo nhỏ").
export default function Callout({ title, children, className }: CalloutProps) {
  return (
    <aside
      className={cn(
        'flex flex-col items-center gap-3 rounded-box bg-primary px-6 pt-6 pb-8 text-on-primary sm:px-8',
        className,
      )}
    >
      <Icon name='lightbulb' strokeWidth={1.5} className='size-14' />
      <p className='text-h3 font-medium'>{title}</p>
      <div className='text-h4 leading-[1.4] font-light'>{children}</div>
    </aside>
  );
}
