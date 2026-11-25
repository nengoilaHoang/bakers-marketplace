import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';
import { cn } from '@/lib/cn';
import {
  CollisionPriority,
  CollisionType,
  type CollisionDetector,
} from '@dnd-kit/abstract';
import { useDroppable } from '@dnd-kit/react';
import React, {
  CSSProperties,
  createContext,
  useContext,
  useMemo,
} from 'react';

type DropZoneContextValue = {
  depth: number;
};

const DropZoneContext = createContext<DropZoneContextValue>({
  depth: 0,
});

type DropZoneProps = {
  children?: React.ReactNode;
  sourceParentId: string;
  sourceSlot: number;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
};

// Custom collision detector that converts iframe-local rects to parent viewport space
// and ignores drops while the pointer is still over the sidebar or outside the iframe
const iframeAwareCollisionDetector: CollisionDetector = ({
  dragOperation,
  droppable,
}) => {
  if (!droppable.shape) return null;

  const iframe = document.getElementById(
    'canvas-iframe',
  ) as HTMLIFrameElement | null;
  const sidebar = document.querySelector('[aria-label="Component Library"]');
  if (!iframe) return null;

  const { position } = dragOperation;
  const pointerPosition = position.current;

  // 1. Ignore collisions while the pointer is still over the open Component Library
  if (sidebar) {
    const sidebarRect = sidebar.getBoundingClientRect();
    if (
      pointerPosition.x >= sidebarRect.left &&
      pointerPosition.x <= sidebarRect.right &&
      pointerPosition.y >= sidebarRect.top &&
      pointerPosition.y <= sidebarRect.bottom
    ) {
      return null;
    }
  }

  // 2. Ignore collisions if the pointer is outside the visible iframe bounds
  const iframeRect = iframe.getBoundingClientRect();
  if (
    pointerPosition.x < iframeRect.left ||
    pointerPosition.x > iframeRect.right ||
    pointerPosition.y < iframeRect.top ||
    pointerPosition.y > iframeRect.bottom
  ) {
    return null;
  }

  // 3. Hit-test the DropZone's bounding rectangle
  const rect = droppable.shape.boundingRectangle;
  const isInside =
    pointerPosition.x >= rect.left &&
    pointerPosition.x <= rect.right &&
    pointerPosition.y >= rect.top &&
    pointerPosition.y <= rect.bottom;

  if (!isInside) {
    return null;
  }

  const { depth = 0, isOccupied = false } = (droppable.data ?? {}) as {
    depth?: number;
    isOccupied?: boolean;
  };

  // Deeper drop zones always outrank outer containers; empty slots outrank occupied ones
  const priority =
    (isOccupied ? CollisionPriority.Low : CollisionPriority.High) + depth * 10;

  return {
    id: droppable.id,
    value: 1,
    type: CollisionType.Collision,
    priority,
  };
};

const DropZone = ({
  children,
  sourceParentId,
  sourceSlot,
  disabled = false,
  className,
  style,
}: DropZoneProps) => {
  const { depth } = useContext(DropZoneContext);
  const { isDragging, selectedComponentId } = useStorefrontCanvasContext();

  const isOccupied = Boolean(children);
  const isCurrentDragged = isDragging && selectedComponentId === sourceParentId;
  const isDisabled = disabled || isCurrentDragged;

  const collisionPriority =
    (isOccupied ? CollisionPriority.Low : CollisionPriority.High) + depth * 10;

  const { ref: dropRef, isDropTarget } = useDroppable({
    id: `${sourceParentId}-${sourceSlot}`,
    accept: ['LEAF', 'COMPOSITE', 'COMMERCE', 'REPEATER'],
    disabled: isDisabled,
    collisionDetector: iframeAwareCollisionDetector,
    collisionPriority,
    data: {
      parentId: sourceParentId,
      slot: sourceSlot,
      depth,
      isOccupied,
    },
  });

  const isActiveDrop = !isDisabled && isDropTarget;
  const showOverlay = !isOccupied || isActiveDrop;

  const combinedClassName = cn(
    className,
    // Base container
    'relative grid h-full w-full min-w-0',
    isOccupied ? 'min-h-0' : 'min-h-16',
    'transition-[background-color,border-color,box-shadow] duration-150',

    // Shared overlay pseudo-element
    showOverlay &&
      "after:content-[''] after:absolute after:inset-0 after:rounded-md after:transition-all after:duration-300 after:ease-in-out",

    // Empty slot border vs occupied overlay positioning
    !isOccupied &&
      'after:border-[1.5px] after:border-dashed after:border-zinc-950/25',
    isOccupied && isActiveDrop && 'after:z-10 after:pointer-events-none',

    // Drop target highlight
    isActiveDrop
      ? 'after:ring-2 after:ring-blue-500 after:bg-blue-200/50'
      : !isOccupied && 'after:bg-transparent',
  );

  const value = useMemo(() => ({ depth: depth + 1 }), [depth]);

  return (
    <DropZoneContext.Provider value={value}>
      <div
        aria-label={children ? 'Occupied' : 'Empty drop slot'}
        aria-controls={sourceParentId}
        data-slot={sourceSlot}
        className={combinedClassName}
        style={style}
        ref={dropRef}
      >
        {children}
      </div>
    </DropZoneContext.Provider>
  );
};

export default DropZone;
