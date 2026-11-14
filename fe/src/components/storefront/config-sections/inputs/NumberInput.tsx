export type NumberInputProps = {
  id: string;
  name: string;
  min: number;
  max?: number;
  step: number;
  currentValue: number;
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
  onValueChange,
  onOpenChange,
}: NumberInputProps) => {
  return (
    <input
      id={id}
      name={name}
      type='number'
      min={min}
      max={max}
      step={step}
      value={currentValue}
      onClick={() => onOpenChange?.(true)}
      onChange={(e) => onValueChange(Number(e.target.value))}
      className='min-w-0 w-full rounded-md border border-zinc-200 bg-white py-1.5 pr-7 pl-2.5 text-xs font-mono text-zinc-800 transition hover:bg-zinc-50 focus:border-zinc-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
    />
  );
};

export default NumberInput;
