import { DeviceBreakpoint } from '@/types/canvas';
import {
  CONTENT_POSITION_GRID,
  HeroBannerContentPosition,
} from '@/types/layout-component/commerce-component';
import ConfigLabel from './ConfigLabel';

type PositionConfigProps = {
  label: string;
  forId: string;
  onClick: (position: HeroBannerContentPosition) => void;
  position: HeroBannerContentPosition;
  breakpoint?: DeviceBreakpoint;
};

const PositionConfig = ({
  label,
  forId,
  onClick,
  position,
  breakpoint,
}: PositionConfigProps) => {
  return (
    <div className='flex flex-col gap-1.5'>
      <ConfigLabel label={label} forId={forId} breakpoint={breakpoint} />
      <div className='grid grid-cols-3 items-center justify-items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 p-1.5'>
        {CONTENT_POSITION_GRID.flat().map((pos) => (
          <button
            key={pos}
            type='button'
            aria-label={`Align CTA ${pos}`}
            onClick={() => onClick(pos)}
            className={`h-7 w-7 rounded border transition-colors ${
              position === pos
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <span className='sr-only'>{pos}</span>
            <span className='font-mono text-[9px]'>
              {pos
                .split('-')
                .map((p) => p[0].toUpperCase())
                .join('')}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PositionConfig;
