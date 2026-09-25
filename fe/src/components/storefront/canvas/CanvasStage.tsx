import { BREAKPOINT_PRESETS, DeviceBreakpointWithFluid } from '@/types/canvas';
import React, { useRef } from 'react';
import CanvasSelectionOverlay from './CanvasSelectionOverlay';
import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';

type CanvasStageProps = {
  children: React.ReactNode;
  currentBreakpoint: DeviceBreakpointWithFluid;
  zoom: number;
  isPreview: boolean;
};

const CanvasStage = ({
  children,
  currentBreakpoint,
  zoom,
  isPreview,
}: CanvasStageProps) => {
  const artboardRef = useRef<HTMLDivElement | null>(null);
  const { selectComponent } = useStorefrontCanvasContext();

  const widthStyle = BREAKPOINT_PRESETS[currentBreakpoint].width;

  const handleCaptureClick = (e: React.MouseEvent) => {
    if (isPreview) return;

    const target = e.target as HTMLElement;
    const interactive = target.closest(
      'a, form, button:not([data-cms-action])',
    );
    if (interactive?.tagName === 'A') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleStageBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectComponent(null);
    }
  };

  return (
    <div
      onClick={handleStageBackgroundClick}
      className='flex-1 overflow-auto bg-zinc-200/70 p-10 flex items-start justify-center relative select-none'
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: '16px 16px',
      }}
    >
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          width:
            typeof widthStyle === 'number' ? `${widthStyle}px` : widthStyle,
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className='relative max-w-full shrink-0'
      >
        <div
          id='cms-board'
          ref={artboardRef}
          onClickCapture={handleCaptureClick}
          className={`relative w-full rounded-md bg-white shadow-2xl ring-1 ring-zinc-300 transition-all duration-150 overflow-hidden ${isPreview ? 'pointer-events-none select-none' : ''}`}
        >
          {children}
          {!isPreview && (
            <CanvasSelectionOverlay
              artboardRef={artboardRef}
            ></CanvasSelectionOverlay>
          )}
        </div>
      </div>
    </div>
  );
};

export default CanvasStage;
