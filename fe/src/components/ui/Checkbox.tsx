import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/cn';

import Icon from './Icon';

type CheckboxProps = Omit<ComponentProps<'input'>, 'type'> & {
  label?: ReactNode;
  // Thay cỡ/màu chữ của nhãn (mặc định text-body-sm text-ink).
  labelClassName?: string;
};

export default function Checkbox({
  label,
  className,
  labelClassName = 'text-body-sm text-ink',
  ...props
}: CheckboxProps) {
  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center gap-3',
        labelClassName,
      )}
    >
      <span className='relative inline-grid size-5 shrink-0 place-items-center'>
        <input
          type='checkbox'
          className={cn(
            'peer size-5 cursor-pointer appearance-none rounded-xs border border-ink bg-page outline-none transition-colors',
            'checked:border-primary checked:bg-primary focus-visible:ring-2 focus-visible:ring-accent',
            className,
          )}
          {...props}
        />
        <Icon
          name='check'
          strokeWidth={3}
          className='pointer-events-none absolute size-3.5 text-on-primary opacity-0 peer-checked:opacity-100'
        />
      </span>
      {label}
    </label>
  );
}
