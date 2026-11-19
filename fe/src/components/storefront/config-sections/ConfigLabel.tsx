import { cn } from '@/lib/cn';
import { DeviceBreakpoint } from '@/types/canvas';
import BreakpointBadge from './BreakpointBadge';

type ConfigLabelSize = 'sm' | 'md';

const LABEL_SIZE_CLASSES: Record<ConfigLabelSize, string> = {
  sm: 'text-[11px] font-medium text-ink',
  md: 'text-xs font-medium text-zinc-700',
};

type ConfigLabelProps = {
  label: string;
  forId?: string;
  breakpoint?: DeviceBreakpoint;
  size?: ConfigLabelSize;
  className?: string;
};

const ConfigLabel = ({
  label,
  forId,
  breakpoint,
  size = 'sm',
  className,
}: ConfigLabelProps) => {
  return (
    <div className='flex w-full min-w-0 items-center justify-between gap-1.5'>
      <label
        className={cn(
          'min-w-0 shrink-0 capitalize',
          LABEL_SIZE_CLASSES[size],
          className,
        )}
        htmlFor={forId}
      >
        {label}
      </label>
      {breakpoint && <BreakpointBadge breakpoint={breakpoint} />}
    </div>
  );
};

export default ConfigLabel;
