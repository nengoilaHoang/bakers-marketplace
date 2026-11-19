import { DeviceBreakpoint } from '@/types/canvas';

const BreakpointContainer = ({
  children,
  label,
  breakpoint,
}: {
  children: React.ReactNode;
  label: string;
  breakpoint: DeviceBreakpoint;
}) => {
  return (
    <div className='flex flex-col gap-2.5 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-semibold uppercase tracking-wide text-zinc-800'>
          {label}
        </span>
        <span className='rounded bg-white px-1.5 py-0.5 font-mono text-[10px] uppercase text-zinc-500 border border-zinc-200/80'>
          {breakpoint}
        </span>
      </div>

      {children}
    </div>
  );
};

export default BreakpointContainer;
