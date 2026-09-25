import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';
import { BREAKPOINT_PRESETS, DeviceBreakpointWithFluid } from '@/types/canvas';
import { useEffect, useState } from 'react';

const CanvasTopBar = () => {
  const {
    breakpoint: currentBreakpoint,
    setBreakpoint: onBreakpointChange,
    zoom,
    setZoom: onZoomChange,
    isPreview,
    setIsPreview: onTogglePreview,
  } = useStorefrontCanvasContext();

  const [vpWidth, setVpWidth] = useState<number>(0);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      setVpWidth(entries[0].contentRect.width ?? window.innerWidth);
    });
    observer.observe(document.body);

    return () => observer.disconnect();
  }, []);

  return (
    <div className='flex h-12 w-full shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 z-20 shadow-sx'>
      <div className='flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-100 p-1'>
        {(Object.keys(BREAKPOINT_PRESETS) as DeviceBreakpointWithFluid[]).map(
          (bp) => (
            <button
              key={bp}
              disabled={vpWidth < Number(BREAKPOINT_PRESETS[bp].width) + 80}
              type='button'
              onClick={() => onBreakpointChange(bp)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${currentBreakpoint === bp ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 not-disabled:hover:text-zinc-900'} `}
            >
              {bp.charAt(0).toUpperCase() + bp.slice(1)}
            </button>
          ),
        )}
      </div>

      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-1 text-xs text-zinc-600'>
          <button
            type='button'
            onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
            className='rounded border border-zinc-200 px-2 py-0.5 hover:bg-zinc-50'
          >
            -
          </button>
          <span className='font-mono w-10 text-center'>
            {Math.round(zoom * 100)}%
          </span>
          <button
            type='button'
            onClick={() => onZoomChange(Math.min(1.5, zoom + 0.1))}
            className='rounded border border-zinc-200 px-2 py-0.5 hover:bg-zinc-50'
          >
            +
          </button>
        </div>

        <button
          type='button'
          onClick={() => onTogglePreview(!isPreview)}
          className={`rounded-md px-3 py-1 text-xs font-medium border transition-colors ${
            isPreview
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'border-zinc-300 text-zinc-700 hover:bg-zinc-50'
          }`}
        >
          {isPreview ? 'Exit Preview' : 'Preview'}
        </button>
      </div>
    </div>
  );
};

export default CanvasTopBar;
