import { cn } from '@/lib/cn';

import Icon from './Icon';

type QuantityStepperProps = Readonly<{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  // Tên sản phẩm, để trình đọc màn hình biết đang chỉnh số lượng của món nào.
  label: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
}>;

const SIZES = {
  sm: { box: 'h-9', button: 'w-9', input: 'w-10 text-body-sm' },
  md: { box: 'h-12', button: 'w-12', input: 'w-14 text-body' },
} as const;

// Ô số lượng dạng viên thuốc: nút trừ, số, nút cộng; luôn giữ giá trị trong [min, max].
export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  label,
  size = 'md',
  disabled = false,
  className,
}: QuantityStepperProps) {
  const sizes = SIZES[size];
  const clamp = (next: number) => Math.max(min, Math.min(max, Number.isFinite(next) ? next : min));
  const buttonClasses = cn(
    'grid h-full place-items-center text-ink outline-none transition-colors hover:bg-ink/5 focus-visible:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40',
    sizes.button,
  );

  return (
    <div
      role='group'
      aria-label={`Số lượng ${label}`}
      className={cn(
        'inline-flex items-center overflow-hidden rounded-full border border-border bg-field focus-within:ring-2 focus-within:ring-accent/40',
        sizes.box,
        className,
      )}
    >
      <button
        type='button'
        aria-label='Giảm số lượng'
        className={buttonClasses}
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
      >
        <Icon name='minus' className='size-4' />
      </button>
      <input
        type='number'
        inputMode='numeric'
        aria-label={`Số lượng ${label}`}
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(clamp(Number.parseInt(event.target.value, 10)))}
        className={cn(
          'h-full appearance-none bg-transparent text-center font-medium text-ink outline-none [&::-webkit-inner-spin-button]:appearance-none',
          sizes.input,
        )}
      />
      <button
        type='button'
        aria-label='Tăng số lượng'
        className={buttonClasses}
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + 1))}
      >
        <Icon name='plus' className='size-4' />
      </button>
    </div>
  );
}
