import { useState } from 'react';
import TypeableSelect from './TypeableSelect';
import ColorPicker from './ColorPicker';
import RadioButton from './RadioButton';

type ConfigInputProps<T extends string | number | boolean> = {
  id: string;
  name: string;
  label?: string;
  inputType: 'text' | 'checkbox' | 'select' | 'color' | 'radio';
  currentValue: T;
  value?: T;
  selectOptions?: Readonly<Record<string, T>>;
  onValueChange: (value: T) => void;
	onOpenStateChange?: (isOpen: boolean) => void;
  arrangement?: 'horizontal' | 'vertical';
};

const ConfigInput = <T extends string | number | boolean>({
  id,
  name,
  label,
  inputType,
  value,
  currentValue,
  selectOptions,
  onValueChange,
	onOpenStateChange,
  arrangement = 'vertical',
}: ConfigInputProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		onOpenStateChange?.(open);
	};

  return (
    <div
      className={`relative min-w-0 flex ${
        arrangement === 'horizontal'
          ? 'flex-row-reverse justify-between items-center gap-2 space-x-2'
          : 'flex-col items-start space-y-2'
      }`}
      style={{
        zIndex: isOpen ? 100 : 'auto',
      }}
    >
      {label && (
        <label
          className='min-w-0 text-[11px] font-medium text-zinc-500 capitalize'
          htmlFor={id}
        >
          {label}
        </label>
      )}
      {(() => {
        switch (inputType) {
          case 'checkbox': {
            if (typeof currentValue === 'string') {
              throw new TypeError(
                `Invalid value type for checkbox input: ${typeof currentValue}`,
              );
            }
            return (
              <input
                id={id}
                name={name}
                type='checkbox'
                value={String(value)}
                checked={currentValue === value}
                onChange={(event) => onValueChange(event.target.checked as T)}
              />
            );
          }
          case 'select': {
            if (selectOptions === undefined) {
              throw new TypeError(
                'Select options must be provided for select input',
              );
            }

            return (
              <TypeableSelect
                id={id}
                name={name}
                options={selectOptions}
                currentValue={currentValue}
                onValueChange={onValueChange}
								isOpen={isOpen}
                onOpenChange={handleOpenChange}
              />
            );
          }
          case 'color': {
            if (typeof currentValue !== 'string') {
              throw new TypeError(
                `Invalid value type for color input: ${typeof currentValue}`,
              );
            }
            return (
              <ColorPicker
                id={id}
                name={name}
                currentValue={currentValue}
                onValueChange={(value) => onValueChange(value as T)}
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
              />
            );
          }
          case 'radio': {
            if (value === undefined) {
              throw new TypeError('Value must be provided for radio input');
            }

            return (
              <RadioButton
                id={id}
                name={name}
                currentValue={currentValue}
                value={value}
                onValueChange={onValueChange}
              />
            );
          }
          case 'text': {
            return (
              <input
                id={id}
                type='text'
                name={name}
                value={String(currentValue)}
                onChange={(e) => onValueChange(e.target.value as T)}
                className='min-w-0 w-full rounded-md border border-zinc-200 bg-zinc-50/50 px-2.5 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 transition hover:bg-white focus:bg-white focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950'
              />
            );
          }
          default:
            return null;
        }
      })()}
    </div>
  );
};

export default ConfigInput;
