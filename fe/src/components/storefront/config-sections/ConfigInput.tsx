import { useDropdown } from '@/hooks/useDropdown';
import ColorPicker from './inputs/ColorPicker';
import FilePicker from './inputs/FilePicker';
import RadioButton from './inputs/RadioButton';
import TypeableSelect from './inputs/TypeableSelect';

/**
 * @param {string} value This value is meant to set the value of a radio button only when `inputType` is of type **`'radio'`**.
 */
type ConfigInputProps<T extends string | number | boolean | null | undefined> =
  {
    id: string;
    name: string;
    inputType: 'text' | 'checkbox' | 'select' | 'color' | 'radio' | 'file';
    presets?: ReadonlyArray<T>;
    currentValue: T;
    value?: T;
    selectOptions?: Readonly<Record<string, T>>;
    onValueChange: (value: T) => void;
    onOpenStateChange?: (isOpen: boolean) => void;
  };

const ConfigInput = <T extends string | number | boolean | null | undefined>({
  id,
  name,
  inputType,
  presets,
  value,
  currentValue,
  selectOptions,
  onValueChange,
  onOpenStateChange,
}: ConfigInputProps<T>) => {
  const { ref, isOpen, toggle } = useDropdown();

  const handleOpenChange = (state: boolean) => {
    toggle();
    onOpenStateChange?.(state);
  };

  return (
    <div
      ref={ref}
      className='relative min-w-0 w-full'
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

            // Check if selectOptions is a valid object and each value is of type number, string, or boolean
            if (
              typeof selectOptions !== 'object' ||
              selectOptions === null ||
              !Object.values(selectOptions).every(
                (value) =>
                  typeof value === 'string' ||
                  typeof value === 'number' ||
                  typeof value === 'boolean',
              )
            ) {
              throw new TypeError(
                'Select options must be an object with values of type number, string, or boolean',
              );
            }

            if (currentValue === undefined || currentValue === null) {
              throw new TypeError(
                'Current value must not be null or undefined for select input',
              );
            }

            return (
              <TypeableSelect
                id={id}
                name={name}
                options={
                  selectOptions as Readonly<
                    Record<string, string | number | boolean>
                  >
                }
                currentValue={currentValue}
                onValueChange={(value) => onValueChange(value as T)}
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
                presets={presets as ReadonlyArray<string> | undefined}
                currentValue={currentValue}
                onValueChange={(value) => onValueChange(value as T)}
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
                onValueChange={onValueChange}
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
                onChange={(e) => onValueChange(e.target.value as T)}
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
                onValueChange={(value) => onValueChange(value as T)}
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
              ></FilePicker>
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
