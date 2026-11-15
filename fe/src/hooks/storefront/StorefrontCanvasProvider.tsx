import { BREAKPOINT_PRESETS, DeviceBreakpointWithFluid } from '@/types/canvas';
import { useCallback, useEffect, useMemo, useState } from 'react';
import StorefrontCanvasContext, {
  StorefrontCanvasContextValue,
} from './StorefrontCanvasContext';

type StorefrontCanvasProviderProps = {
  children: React.ReactNode;
  initialZoom: number;
  initialBreakpoint: DeviceBreakpointWithFluid;
  initialIsPreview: boolean;
};

const StorefrontCanvasProvider = ({
  children,
  initialZoom,
  initialBreakpoint,
  initialIsPreview,
}: StorefrontCanvasProviderProps) => {
  const [zoom, setZoom] = useState(initialZoom);
  const [breakpoint, setBreakpoint] = useState(initialBreakpoint);
  const [isPreview, setIsPreview] = useState(initialIsPreview);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    null,
  );

  const selectPage = useCallback((pageId: string | null) => {
    setSelectedComponentId(null);
    setCurrentPageId(pageId);
  }, []);

  useEffect(() => {
    const updateBreakpoint = (entries: ResizeObserverEntry[]) => {
      if (breakpoint === 'fluid') return;

      const currentWidth = entries[0]?.contentRect.width ?? window.innerWidth;
      const currentBpWidth = Number(BREAKPOINT_PRESETS[breakpoint].width);

      if (currentWidth <= Number(currentBpWidth) + 80) {
        const nextBp = (
          Object.keys(BREAKPOINT_PRESETS) as DeviceBreakpointWithFluid[]
        )
          .filter((bp): bp is 'mobile' | 'tablet' | 'desktop' => bp !== 'fluid')
          .sort(
            (a, b) =>
              Number(BREAKPOINT_PRESETS[b].width) -
              Number(BREAKPOINT_PRESETS[a].width),
          )
          .find(
            (bp) => currentWidth > Number(BREAKPOINT_PRESETS[bp].width + 80),
          );
        setBreakpoint(nextBp ?? 'fluid');
      }
    };

    const observer = new ResizeObserver(updateBreakpoint);
    observer.observe(document.body);

    return () => observer.disconnect();
  }, [breakpoint]);

  const contextValue: StorefrontCanvasContextValue = useMemo(
    () => ({
      zoom,
      setZoom,
      breakpoint,
      setBreakpoint,
      isPreview,
      setIsPreview,
      isDragging,
      setIsDragging,
      isResizing,
      setIsResizing,
      currentPageId,
      setCurrentPageId: selectPage,
      selectedComponentId,
      selectComponent: setSelectedComponentId,
    }),
    [
      zoom,
      breakpoint,
      isPreview,
      isDragging,
      isResizing,
      currentPageId,
      selectPage,
      selectedComponentId,
    ],
  );

  return (
    <StorefrontCanvasContext.Provider value={contextValue}>
      {children}
    </StorefrontCanvasContext.Provider>
  );
};

export default StorefrontCanvasProvider;
