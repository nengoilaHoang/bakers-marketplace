import { useState } from 'react';

import { cn } from '@/lib/cn';

type SwitchProps = Readonly<{
  label: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}>;

// Công tắc bật/tắt (ví dụ "Chế độ nấu ăn").
export default function Switch({
  label,
  defaultChecked = false,
  onChange,
  className,
}: SwitchProps) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      aria-label={label}
      onClick={() => {
        setChecked(!checked);
        onChange?.(!checked);
      }}
      className={cn(
        'relative inline-flex h-6.5 w-16 shrink-0 items-center rounded-full border-2 border-ink transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        checked ? 'bg-secondary' : 'bg-page',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute size-5 rounded-full bg-accent transition-transform',
          checked ? 'translate-x-9' : 'translate-x-1',
        )}
      />
    </button>
  );
}
