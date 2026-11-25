import { cn } from '@/lib/cn';
import { useEffect, useState } from 'react';

export type NumberInputProps = {
  id: string;
  name: string;
  min: number;
  max?: number;
  step: number;
  currentValue: number;
  suffix?: string;
  onValueChange: (value: number) => void;
  onOpenChange?: (isOpen: boolean) => void;
};

const NumberInput = ({
  id,
  name,
  min,
  max,
  step,
  currentValue,
  suffix,
  onValueChange,
  onOpenChange,
}: NumberInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [rawValue, setRawValue] = useState(String(currentValue));

  // Sync rawValue when currentValue changes externally or via native spinner arrows
  useEffect(() => {
    queueMicrotask(() => setRawValue(String(currentValue)));
  }, [currentValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRawValue(val);

    if (val !== '' && !Number.isNaN(Number(val))) {
      onValueChange(Number(val));
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setRawValue(String(currentValue));
  };

  return (
    <div className='relative min-w-0 w-full'>
      <input
        id={id}
        name={name}
        type='number'
        min={min}
        max={max}
        step={step}
        value={rawValue}
        onClick={() => onOpenChange?.(true)}
        onFocus={() => setIsFocused(true)}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn(
          'peer not-even:min-w-0 w-full',
          'rounded-md border border-zinc-200 bg-white',
          'py-1.5 px-2.5',
          'slashed-zero tabular-nums font-mono text-xs',
          isFocused
            ? 'text-zinc-800'
            : 'text-transparent selection:text-zinc-800',
          'transition hover:bg-zinc-50',
          'focus:border-zinc-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950',
        )}
      />

      {!isFocused && (
        <span
          aria-hidden='true'
          className='pointer-events-none absolute inset-y-0 left-2.5 flex items-center slashed-zero tabular-nums font-mono text-xs text-zinc-800'
        >
          {currentValue.toLocaleString('de-DE')}
        </span>
      )}

      {suffix && (
        <span className='peer-focus:hidden peer-hover:hidden pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[11px] text-zinc-400'>
          {suffix}
        </span>
      )}
    </div>
  );
};

export default NumberInput;
