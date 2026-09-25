import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';
import useStorefrontContext from '@/hooks/storefront/useStorefrontContext';
import {
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

type CanvasSelectionOverlayProps = {
  artboardRef: React.RefObject<HTMLElement | null>;
};

const CanvasSelectionOverlay = ({
  artboardRef,
}: CanvasSelectionOverlayProps) => {
  const { state } = useStorefrontContext();
  const { selectComponent } = useStorefrontCanvasContext();
  const { zoom, selectedComponentId, isDragging, isResizing } =
    useStorefrontCanvasContext();
  const { components } = state;
  const [rect, setRect] = useState<OverlayRect | null>(null);
  const [artboardHeight, setArtboardHeight] = useState(0);

  const [isWindowResizing, setIsWindowResizing] = useState(false);
  const windowResizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

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
      setRect(null);
      return;
    }

    const artboard = artboardRef.current;
    const target = artboard?.querySelector(
      `#${CSS.escape(selectedComponentId)}`,
    );

    if (!artboard || !target) {
      setRect(null);
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
    setRect((prev) =>
      prev &&
      Math.abs(prev.top - next.top) < 0.5 &&
      Math.abs(prev.left - next.left) < 0.5 &&
      Math.abs(prev.width - next.width) < 0.5 &&
      Math.abs(prev.height - next.height) < 0.5
        ? prev
        : next,
    );
  }, [selectedComponentId, zoom, artboardRef]);

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

  if (!rect || !selectedComponentId) return null;
  const activeComponent = components[selectedComponentId];
  const disableAnimation = isDragging || isResizing || isWindowResizing;

  const isRoot = selectedComponentId === state.rootId;
  const isNearTop = rect.top < 24;
  const isNearBottom =
    artboardHeight > 0 && rect.top + rect.height > artboardHeight - 24;

  let badgePositionClass = '-top-5 rounded-t-md';
  if (isRoot || (isNearTop && isNearBottom)) {
    badgePositionClass = 'top-0 rounded-br-md';
  } else if (isNearTop) {
    badgePositionClass = '-bottom-5 rounded-b-md';
  }
  return (
    <div
      className={`pointer-events-none absolute left-0 top-0 z-40 will-change-transform ${disableAnimation ? '' : 'transition-all duration-75'}`.trim()}
      style={{
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        transform: `translate3d(${rect.left}px, ${rect.top}px, 0)`,
      }}
    >
      <div className='size-full border-2 border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/20 box-decoration-clone'></div>

      <div
        className={`pointer-events-auto absolute left-0 ${badgePositionClass} w-full max-w-[220px] flex items-center justify-between gap-2 bg-blue-600 px-2 py-0.5 text-[11px] font-medium text-white shadow-md`}
      >
        <div className='flex min-w-0 items-center justify-center gap-2'>
          <span className='min-w-0 truncate text-ellipsis'>
            {activeComponent?.name || 'Component'}
          </span>
          <span className='shrink-0 text-blue-200 font-mono text-[9px]'>
            {Math.round(rect.width)} &#215; {Math.round(rect.height)}
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
