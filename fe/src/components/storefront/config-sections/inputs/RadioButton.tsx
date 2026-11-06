import React, { useCallback, useRef } from 'react';

type RadioButtonProps<T extends string | number | boolean> = {
  id: string;
  name: string;
  currentValue: T;
  value: T;
  onValueChange: (value: T) => void;
};

const RadioButton = <T extends string | number | boolean>({
  id,
  name,
  currentValue,
  value,
  onValueChange,
}: RadioButtonProps<T>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleMouseDown = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    input.click();
  }, []);

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
        onChange={(e) => onValueChange(e.target.value as T)}
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
