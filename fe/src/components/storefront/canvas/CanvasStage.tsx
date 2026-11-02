// components/storefront/canvas/CanvasStage.tsx
import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';
import { BREAKPOINT_PRESETS } from '@/types/canvas';
import React, { useCallback, useRef, useState } from 'react';
import { CanvasIframe } from './CanvasIframe';
import CanvasSelectionOverlay from './CanvasSelectionOverlay';

type CanvasStageProps = {
  children: React.ReactNode;
};

const CanvasStage = ({ children }: CanvasStageProps) => {
  const artboardContainerRef = useRef<HTMLElement | null>(null);
  const [isIframeReady, setIsIframeReady] = useState(false);
  const {
    selectComponent,
    zoom,
    breakpoint,
    isPreview,
    isResizing,
    isDragging,
  } = useStorefrontCanvasContext();
  const widthStyle = BREAKPOINT_PRESETS[breakpoint].width;

  const handleArtboardMount = useCallback((root: HTMLElement) => {
    artboardContainerRef.current = root;
    setIsIframeReady(true);
  }, []);

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
        <CanvasIframe
          onArtboardMount={handleArtboardMount}
          onClickCapture={handleCaptureClick}
          className={`w-full min-h-200 border-0 rounded-md bg-white shadow-2xl ring-1 ring-zinc-300 transition-all duration-150 ${
            isPreview || isResizing ? 'pointer-events-none select-none' : ''
          }`}
          freezeHeight={isDragging}
        >
          {() => children}
        </CanvasIframe>
        {!isPreview && isIframeReady && (
          <CanvasSelectionOverlay artboardRef={artboardContainerRef} />
        )}
      </div>
    </div>
  );
};

export default CanvasStage;
