import { cn } from '@/lib/cn';
import { DeviceBreakpoint } from '@/types/canvas';
import BreakpointBadge from './BreakpointBadge';

type ConfigLabelProps = {
  label: string;
  forId: string;
  breakpoint?: DeviceBreakpoint;
  className?: string;
};

const ConfigLabel = ({
  label,
  forId,
  breakpoint,
  className,
}: ConfigLabelProps) => {
  return (
    <div className='flex w-full min-w-0 items-center justify-between gap-1.5'>
      <label
        className={cn(
          'min-w-0 shrink-0 text-[11px] font-medium capitalize text-ink',
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
