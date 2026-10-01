import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';
import useStorefrontContext from '@/hooks/storefront/useStorefrontContext';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

type OverlayRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

type ResizeState = {
  startX: number;
  startY: number;
  initialRect: OverlayRect;
  currentRect: OverlayRect;
  handle: ResizeHandle;
};

type CanvasSelectionOverlayProps = {
  artboardRef: React.RefObject<HTMLElement | null>;
};

const CanvasSelectionOverlay = ({
  artboardRef,
}: CanvasSelectionOverlayProps) => {
  const { state, updateConfig } = useStorefrontContext();
  const { selectComponent } = useStorefrontCanvasContext();
  const { zoom, selectedComponentId, isDragging, isResizing, setIsResizing } =
    useStorefrontCanvasContext();
  const { components } = state;
  const [overlayRect, setOverlayRect] = useState<OverlayRect | null>(null);
  const [artboardHeight, setArtboardHeight] = useState(0);
  const badgeRef = useRef<HTMLDivElement>(null);

  const [isWindowResizing, setIsWindowResizing] = useState(false);
  const windowResizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const resizeStateRef = useRef<ResizeState | null>(null);
  const [resizeRect, setResizeRect] = useState<OverlayRect | null>(null);

  useEffect(() => {
    const handleWindowResize = () => {
      setIsWindowResizing(true);
      if (windowResizeTimerRef.current) {
        clearTimeout(windowResizeTimerRef.current);
      }
      windowResizeTimerRef.current = setTimeout(() => {
        setIsWindowResizing(false);
      }, 100);
    };

    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      if (windowResizeTimerRef.current) {
        clearTimeout(windowResizeTimerRef.current);
      }
    };
  }, []);

  const updateBounds = useCallback(() => {
    if (!selectedComponentId) {
      setOverlayRect(null);
      return;
    }

    const artboard = artboardRef.current;
    const target = artboard?.querySelector(
      `#${CSS.escape(selectedComponentId)}`,
    );

    if (!artboard || !target) {
      setOverlayRect(null);
      return;
    }

    const artboardBounds = artboard.getBoundingClientRect();
    const elementBounds = target.getBoundingClientRect();
    const currentZoom = zoom || 1;

    setArtboardHeight((previousHeight) =>
      previousHeight === artboard.clientHeight
        ? previousHeight
        : artboard.clientHeight,
    );

    const next: OverlayRect = {
      top:
        (elementBounds.top - artboardBounds.top) / currentZoom +
        artboard.scrollTop,
      left:
        (elementBounds.left - artboardBounds.left) / currentZoom +
        artboard.scrollLeft,
      width: elementBounds.width / currentZoom,
      height: elementBounds.height / currentZoom,
    };

    // Only update when the position has significant change
    setOverlayRect((prev) =>
      prev &&
      Math.abs(prev.top - next.top) < 0.5 &&
      Math.abs(prev.left - next.left) < 0.5 &&
      Math.abs(prev.width - next.width) < 0.5 &&
      Math.abs(prev.height - next.height) < 0.5
        ? prev
        : next,
    );
  }, [selectedComponentId, zoom, artboardRef]);

  // Update overlay bounds when selected component changes or when the artboard is resized or scrolled
  useLayoutEffect(() => {
    if (!selectedComponentId) return;

    const frameId = requestAnimationFrame(updateBounds);
    const artboard = artboardRef.current;
    const target = artboard?.querySelector(
      `#${CSS.escape(selectedComponentId)}`,
    );

    const resizeObserver = new ResizeObserver(updateBounds);
    if (artboard) resizeObserver.observe(artboard);
    if (target) resizeObserver.observe(target);

    const mutationObserver = new MutationObserver(updateBounds);
    if (artboard) {
      mutationObserver.observe(artboard, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style'],
      });
    }

    artboard?.addEventListener('scroll', updateBounds, { passive: true });
    window.addEventListener('resize', updateBounds);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      if (artboard) artboard.removeEventListener('scroll', updateBounds);
      window.removeEventListener('resize', updateBounds);
    };
  }, [updateBounds, selectedComponentId, artboardRef]);

  // Override width of badge if it is almost the same width as the overlay
  useLayoutEffect(() => {
    const badge = badgeRef.current;
    if (!badge || !overlayRect) return;

    if (isResizing) return;

    // Reset first to read the natural/intrinsic width
    badge.style.width = '100%';
    badge.style.maxWidth = '220px';

    const badgeRect = badge.getBoundingClientRect();
    if (badgeRect.width / overlayRect.width >= 0.95) {
      badge.style.width = `${overlayRect.width}px`;
      badge.style.maxWidth = `${overlayRect.width}px`;
    }
  }, [overlayRect, isResizing]);

  // const getHandle = useCallback(
  //   (e: React.PointerEvent<HTMLDivElement>): ResizeHandle => {
  //     const border = e.currentTarget;
  //     const rect = border.getBoundingClientRect();
  //     const x = e.clientX - rect.left;
  //     const y = e.clientY - rect.top;

  //     const THICKNESS_THRESHOLD = 12;
  //     const threshold = THICKNESS_THRESHOLD * (zoom || 1);

  //     const nearLeft = x <= threshold;
  //     const nearRight = x >= rect.width - threshold;
  //     const nearTop = y <= threshold;
  //     const nearBottom = y >= rect.height - threshold;

  //     if (nearTop && nearLeft) return 'nw';
  //     if (nearTop && nearRight) return 'ne';
  //     if (nearBottom && nearLeft) return 'sw';
  //     if (nearBottom && nearRight) return 'se';
  //     if (nearLeft) return 'w';
  //     if (nearRight) return 'e';
  //     if (nearTop) return 'n';
  //     if (nearBottom) return 's';
  //     return null;
  //   },
  //   [zoom],
  // );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, handle: ResizeHandle) => {
      if (!handle || !overlayRect) return;

      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsResizing(true);
      resizeStateRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        initialRect: { ...overlayRect },
        currentRect: { ...overlayRect },
        handle,
      };
      setResizeRect({ ...overlayRect });
    },
    [overlayRect, setIsResizing],
  );

  useEffect(() => {
    if (!isResizing || !selectedComponentId) return;

    const MIN_SIZE = 20;
    const currentZoom = zoom || 1;

    const handleWindowPointerMove = (e: PointerEvent) => {
      const state = resizeStateRef.current;
      if (!state) return;

      const deltaX = (e.clientX - state.startX) / currentZoom;
      const deltaY = (e.clientY - state.startY) / currentZoom;
      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) return;

      const { initialRect, handle } = state;
      const {
        top: initialTop,
        left: initialLeft,
        width: initialWidth,
        height: initialHeight,
      } = initialRect;
      const { currentRect } = state;
      let { top, left, width, height } = currentRect;

      if (handle?.includes('e')) {
        width = Math.max(MIN_SIZE, initialWidth + deltaX);
      } else if (handle?.includes('w')) {
        const potentialWidth = initialWidth - deltaX;
        if (potentialWidth >= MIN_SIZE) {
          left = initialLeft + deltaX;
          width = potentialWidth;
        } else {
          left = initialLeft + (initialWidth - MIN_SIZE);
          width = MIN_SIZE;
        }
      }

      if (handle?.includes('s')) {
        height = Math.max(MIN_SIZE, initialHeight + deltaY);
      } else if (handle?.includes('n')) {
        const potentialHeight = initialHeight - deltaY;
        if (potentialHeight >= MIN_SIZE) {
          top = initialTop + deltaY;
          height = potentialHeight;
        } else {
          top = initialTop + (initialHeight - MIN_SIZE);
          height = MIN_SIZE;
        }
      }

      state.currentRect = { top, left, width, height };
      setResizeRect(state.currentRect);
    };

    const handleWindowPointerUp = () => {
      const finalRect = resizeStateRef.current?.currentRect;
      setIsResizing(false);
      if (finalRect) {
        setOverlayRect(finalRect);
        updateConfig(selectedComponentId, 'w', finalRect.width);
        updateConfig(selectedComponentId, 'h', finalRect.height);
      }
      setResizeRect(null);
      resizeStateRef.current = null;
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
    };
  }, [isResizing, selectedComponentId, setIsResizing, updateConfig, zoom]);

  if (!overlayRect || !selectedComponentId) return null;
  const activeComponent = components[selectedComponentId];
  const disableAnimation = isDragging || isResizing || isWindowResizing;

  const isRoot = selectedComponentId === state.rootId;
  const isNearTop = overlayRect.top < 24;
  const isNearBottom =
    artboardHeight > 0 &&
    overlayRect.top + overlayRect.height > artboardHeight - 24;

  let badgePositionClass = '-top-5 rounded-t-md';
  if (isRoot || (isNearTop && isNearBottom)) {
    badgePositionClass = 'top-0 rounded-br-md';
  } else if (isNearTop) {
    badgePositionClass = '-bottom-5 rounded-b-md';
  }

  return (
    <div
      className={`pointer-events-none bg-transparent absolute left-0 top-0 z-40 will-change-transform ${disableAnimation ? '' : 'transition-all duration-75'}`.trim()}
      style={{
        width: `${overlayRect.width}px`,
        height: `${overlayRect.height}px`,
        transform: `translate3d(${overlayRect.left}px, ${overlayRect.top}px, 0)`,
      }}
    >
      <div className='pointer-events-none size-full border-2 border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/20 box-decoration-clone'></div>

      {!isDragging &&
        !isResizing &&
        !isWindowResizing &&
        selectedComponentId !== state.rootId && (
          <>
            {/* N */}
            <div
              onPointerDown={(e) => handlePointerDown(e, 'n')}
              className='pointer-events-auto absolute -top-1.5 left-2 right-2 h-3 cursor-n-resize'
            />
            {/* S */}
            <div
              onPointerDown={(e) => handlePointerDown(e, 's')}
              className='pointer-events-auto absolute -bottom-1.5 left-2 right-2 h-3 cursor-s-resize'
            />
            {/* W */}
            <div
              onPointerDown={(e) => handlePointerDown(e, 'w')}
              className='pointer-events-auto absolute top-2 bottom-2 -left-1.5 w-3 cursor-w-resize'
            />
            {/* E */}
            <div
              onPointerDown={(e) => handlePointerDown(e, 'e')}
              className='pointer-events-auto absolute top-2 bottom-2 -right-1.5 w-3 cursor-e-resize'
            />
            {/* NW */}
            <div
              onPointerDown={(e) => handlePointerDown(e, 'nw')}
              className='pointer-events-auto absolute -top-1.5 -left-1.5 size-3.5 cursor-nw-resize bg-white border-2 border-blue-500 rounded-sm z-20'
            />
            {/* NE */}
            <div
              onPointerDown={(e) => handlePointerDown(e, 'ne')}
              className='pointer-events-auto absolute -top-1.5 -right-1.5 size-3.5 cursor-ne-resize bg-white border-2 border-blue-500 rounded-sm z-20'
            />
            {/* SW */}
            <div
              onPointerDown={(e) => handlePointerDown(e, 'sw')}
              className='pointer-events-auto absolute -bottom-1.5 -left-1.5 size-3.5 cursor-sw-resize bg-white border-2 border-blue-500 rounded-sm z-20'
            />
            {/* SE */}
            <div
              onPointerDown={(e) => handlePointerDown(e, 'se')}
              className='pointer-events-auto absolute -bottom-1.5 -right-1.5 size-3.5 cursor-se-resize bg-white border-2 border-blue-500 rounded-sm z-20'
            />
          </>
        )}

      {resizeRect && (
        <div
          className={`${
            isResizing ? 'animate-pulse z-10' : 'hidden z-0'
          } pointer-events-none absolute top-0 left-0 border-2 border-blue-500 bg-blue-500/50 ring-1 ring-blue-500/20 box-decoration-clone`}
          style={{
            width: `${resizeRect.width}px`,
            height: `${resizeRect.height}px`,
            transform: `translate3d(${resizeRect.left - overlayRect.left}px, ${resizeRect.top - overlayRect.top}px, 0)`,
          }}
        ></div>
      )}

      <div
        ref={badgeRef}
        style={{
          width: '100%',
          maxWidth: '220px',
        }}
        className={`pointer-events-auto absolute left-0 ${badgePositionClass} flex items-center justify-between gap-2 bg-blue-600 px-2 py-0.5 text-[11px] font-medium text-white shadow-md`}
      >
        <div className='flex min-w-0 items-center justify-center gap-2'>
          <span className='min-w-0 truncate text-ellipsis'>
            {activeComponent?.name || 'Component'}
          </span>
          <span className='shrink-0 text-blue-200 font-mono text-[9px]'>
            {Math.round(overlayRect.width)} &#215;{' '}
            {Math.round(overlayRect.height)}
          </span>
        </div>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            selectComponent(null);
          }}
          className='ml-1 text-white/80 hover:text-white'
        >
          &#215;
        </button>
      </div>
    </div>
  );
};

export default CanvasSelectionOverlay;
