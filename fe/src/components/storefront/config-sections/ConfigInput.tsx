import { useDropdown } from '@/hooks/useDropdown';
import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';
import ColorPicker from './inputs/ColorPicker';
import FilePicker from './inputs/FilePicker';
import NumberInput from './inputs/NumberInput';
import RadioButton from './inputs/RadioButton';
import TypeableSelect from './inputs/TypeableSelect';

type BaseConfigInputProps = {
  id: string;
  name: string;
  onOpenStateChange?: (isOpen: boolean) => void;
};

type TextInputProps = {
  inputType: 'text';
  currentValue: string;
  onValueChange: (value: string) => void;
};

type CheckboxInputProps = {
  inputType: 'checkbox';
  currentValue: boolean;
  value?: boolean | string;
  onValueChange: (value: boolean) => void;
};

type SelectInputProps = {
  inputType: 'select';
  currentValue: string | number;
  selectOptions: Readonly<Record<string | number, string>>;
  onValueChange: (value: string | number) => void;
  footer?: ReactNode;
};

type ColorInputProps = {
  inputType: 'color';
  currentValue: string;
  presets?: ReadonlyArray<string>;
  onValueChange: (value: string) => void;
};

type RadioInputProps = {
  inputType: 'radio';
  value: string | number | boolean;
  currentValue: string | number | boolean;
  onValueChange: (value: string | number | boolean) => void;
};

type FileInputProps = {
  inputType: 'file';
  currentValue: string | null;
  onValueChange: (value: string | null) => void;
};

type NumberInputProps = {
  inputType: 'number';
  min: number;
  max?: number;
  step: number;
  currentValue: number;
  suffix?: string;
  onValueChange: (value: number) => void;
};

type ReadonlyInputProps = {
  inputType: 'readonly';
  currentValue: string | number;
};

/**
 * @param {string} value This value is meant to set the value of a radio button only when `inputType` is of type **`'radio'`**.
 * @param selectOptions This value is meant to set the options of a select input only when `inputType` is of type **`'select'`**.
 * @param presets This value is meant to set the preset values of a color input only when `inputType` is of type **`'color'`**.
 * @param min This value is meant to set the minimum value of a number input only when `inputType` is of type **`'number'`**.
 * @param max This value is meant to set the maximum value of a number input only when `inputType` is of type **`'number'`**.
 * @param step This value is meant to set the step value of a number input only when `inputType` is of type **`'number'`**.
 * @param suffix This value is meant to set the suffix of a number input only when `inputType` is of type **`'number'`**.
 */
export type ConfigInputProps = BaseConfigInputProps &
  (
    | TextInputProps
    | CheckboxInputProps
    | SelectInputProps
    | ColorInputProps
    | RadioInputProps
    | FileInputProps
    | NumberInputProps
    | ReadonlyInputProps
  );

const ConfigInput = (props: ConfigInputProps) => {
  const { id, name, inputType, currentValue, onOpenStateChange } = props;
  const value = 'value' in props ? props.value : undefined;
  const presets = 'presets' in props ? props.presets : undefined;
  const selectOptions =
    'selectOptions' in props ? props.selectOptions : undefined;
  const min = 'min' in props ? props.min : undefined;
  const max = 'max' in props ? props.max : undefined;
  const step = 'step' in props ? props.step : undefined;
  const suffix = 'suffix' in props ? props.suffix : undefined;
  const footer = 'footer' in props ? props.footer : undefined;
  const { ref, isOpen, toggle } = useDropdown();

  const handleOpenChange = (state: boolean) => {
    toggle();
    onOpenStateChange?.(state);
  };

  return (
    <div
      ref={ref}
      className={cn(
        'relative min-w-0 max-w-full',
        inputType === 'file' && 'w-full',
      )}
      style={{
        zIndex: isOpen ? 100 : 'auto',
      }}
    >
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
                onChange={(event) => props.onValueChange(event.target.checked)}
              />
            );
          }
          case 'select': {
            if (selectOptions === undefined) {
              throw new TypeError(
                'Select options must be provided for select input',
              );
            }
            if (
              typeof selectOptions !== 'object' ||
              selectOptions === null ||
              !Object.entries(selectOptions).every(
                ([key, val]) =>
                  (typeof key === 'string' || typeof key === 'number') &&
                  typeof val === 'string',
              )
            ) {
              throw new TypeError(
                'Select options must be a non-null object with string or number keys and string values',
              );
            }
            if (
              typeof currentValue !== 'string' &&
              typeof currentValue !== 'number'
            ) {
              throw new TypeError(
                `Invalid value type for select input: ${typeof currentValue}`,
              );
            }
            const handleValueChange = (value: string) => {
              if (typeof value !== 'string') return;
              const trimmed = value.trim();
              const num = Number(trimmed);
              if (trimmed !== '' && !Number.isNaN(num)) {
                props.onValueChange(num);
                return;
              }
              props.onValueChange(value);
            };
            return (
              <TypeableSelect
                id={id}
                name={name}
                options={selectOptions}
                currentValue={String(currentValue)}
                onValueChange={handleValueChange}
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
                footer={footer}
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
                presets={presets as ReadonlyArray<string> | undefined}
                currentValue={currentValue}
                onValueChange={(value) => props.onValueChange(value)}
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
              />
            );
          }
          case 'radio': {
            if (value === null || value === undefined) {
              throw new TypeError(
                'Value must not be null or undefined for radio input',
              );
            }

            if (currentValue === null || currentValue === undefined) {
              throw new TypeError(
                'Current value must not be null or undefined for radio input',
              );
            }

            if (typeof currentValue !== typeof value) {
              throw new TypeError(
                `Invalid value type for radio input: ${typeof currentValue}`,
              );
            }

            return (
              <RadioButton
                id={id}
                name={name}
                currentValue={currentValue}
                value={value}
                onValueChange={(val) => props.onValueChange(val)}
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
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
                onChange={(e) => props.onValueChange(e.target.value)}
                className='min-w-0 w-full rounded-md border border-zinc-200 bg-zinc-50/50 px-2.5 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 transition hover:bg-white focus:bg-white focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950'
              />
            );
          }
          case 'file': {
            const value = currentValue === null ? null : String(currentValue);
            return (
              <FilePicker
                id={id}
                name={name}
                currentValue={value}
                onValueChange={(value) => props.onValueChange(value)}
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
              ></FilePicker>
            );
          }
          case 'number': {
            if (min === undefined || step === undefined) {
              throw new TypeError(
                'Min and step must be provided for number input',
              );
            }
            return (
              <NumberInput
                id={id}
                name={name}
                min={min}
                max={max}
                step={step}
                currentValue={currentValue}
                suffix={suffix}
                onValueChange={(value) => props.onValueChange(value)}
                onOpenChange={handleOpenChange}
              />
            );
          }
          case 'readonly': {
            return (
              <input
                id={id}
                type='text'
                name={name}
                readOnly
                value={String(currentValue)}
                onClick={() => handleOpenChange(!isOpen)}
                aria-expanded={isOpen}
                className='min-w-0 w-full cursor-pointer select-none rounded-md border border-zinc-200 bg-zinc-50/50 px-2.5 py-1.5 text-xs text-zinc-800 transition hover:bg-white focus:bg-white focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950'
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
