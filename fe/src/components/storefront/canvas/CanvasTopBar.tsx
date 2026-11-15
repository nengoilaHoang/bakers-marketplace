import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';
import useVendorContext from '@/hooks/storefront/useVendorContext';
import { BREAKPOINT_PRESETS, DeviceBreakpointWithFluid } from '@/types/canvas';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import TypeableSelect from '../config-sections/inputs/TypeableSelect';

type PageSelectProps = {
  pages: Record<string, string>;
  value: string;
  onChange: (pageId: string) => void;
};

const PageSelect = ({ pages, value, onChange }: PageSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TypeableSelect
      id='page-select'
      name='pageSelect'
      isOpen={isOpen}
      onValueChange={(nextValue) => {
        onChange(nextValue);
        setIsOpen(false);
      }}
      currentValue={value}
      options={pages}
      onOpenChange={setIsOpen}
      isTypeable={false}
      showKeyValue={false}
    />
  );
};

const CanvasTopBar = () => {
  const {
    breakpoint: currentBreakpoint,
    setBreakpoint: onBreakpointChange,
    zoom,
    setZoom: onZoomChange,
    isPreview,
    setIsPreview: onTogglePreview,
    currentPageId,
  } = useStorefrontCanvasContext();
  const { pathname, query, replace } = useRouter();
  const { currentRelease } = useVendorContext();
  const [vpWidth, setVpWidth] = useState<number>(0);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      setVpWidth(entries[0].contentRect.width ?? window.innerWidth);
    });
    observer.observe(document.body);

    return () => observer.disconnect();
  }, []);

  const handlePageChange = useCallback(
    (pageId: string) => {
      if (!currentRelease) return;
      const nextPage = currentRelease.layouts
        .find((l) => l.id === pageId)
        ?.name.toLowerCase();
      if (!nextPage) return;
      void replace(
        {
          pathname,
          query: {
            ...query,
            page: nextPage,
          },
        },
        undefined,
        {
          shallow: true,
        },
      );
    },
    [currentRelease, pathname, query, replace],
  );

  const pages: Record<string, string> = (currentRelease?.layouts ?? []).reduce(
    (acc, page) => ({
      ...acc,
      [page.id]: page.name,
    }),
    {} as Record<string, string>,
  );

  const activePageId =
    (currentPageId && pages[currentPageId] ? currentPageId : null) ??
    currentRelease?.layouts.find((l) => l.type === 'HOME')?.id ??
    currentRelease?.layouts[0]?.id ??
    '';

  if (!currentRelease) return null;

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
        {/* Page Select */}
        <PageSelect
          pages={pages}
          value={activePageId}
          onChange={handlePageChange}
        />
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
