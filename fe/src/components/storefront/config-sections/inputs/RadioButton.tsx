import { useCallback, useRef } from 'react';

type RadioButtonProps = {
  id: string;
  name: string;
  currentValue: string | number | boolean;
  value: string | number | boolean;
  onValueChange: (value: string | number | boolean) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const RadioButton = ({
  id,
  name,
  currentValue,
  value,
  onValueChange,
  isOpen,
  onOpenChange,
}: RadioButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleMouseDown = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    input.click();
    onOpenChange(true);
  }, [onOpenChange]);

  const isChecked = currentValue === value;
  return (
    <div className='relative min-w-0'>
      <input
        id={id}
        type='radio'
        name={name}
        ref={inputRef}
        checked={isChecked}
        value={String(value)}
        className='peer sr-only'
        onChange={(e) => onValueChange(e.target.value)}
      />

      <button
        onMouseDown={handleMouseDown}
        className={`size-5 rounded-full appearance-none border-2 flex items-center justify-center transition-all ${isChecked ? 'border-zinc-600' : 'border-zinc-300'}`}
      >
        <div
          className={`size-2.5 rounded-full bg-zinc-600 transition-transform duration-200 origin-center ${
            isChecked ? 'scale-100' : 'scale-0'
          }`}
        ></div>
      </button>
    </div>
  );
};

export default RadioButton;
