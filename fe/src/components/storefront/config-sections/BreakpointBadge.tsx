import { DeviceBreakpoint } from '@/types/canvas';

const BreakpointBadge = ({ breakpoint }: { breakpoint: DeviceBreakpoint }) => {
  return (
    <span className='rounded border border-zinc-200/80 bg-white px-1.5 py-0.5 font-mono text-[10px] uppercase text-zinc-500'>
      {breakpoint}
    </span>
  );
};

export default BreakpointBadge;
