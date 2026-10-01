import { useDraggable } from '@dnd-kit/react';
import useStorefrontContext from './useStorefrontContext';
import React, { useMemo } from 'react';
import { getBaseLayoutClassesAndStyles as getBaseLayoutClassesAndStyle } from '@/utils/layoutClasses';
import useStorefrontCanvasContext from './useStorefrontCanvasContext';
import { FlattenComponent } from '@/utils/flattenLayout';

const useLayoutComponent = ({
  component,
  sourceParentId,
  sourceSlot,
}: {
  component: FlattenComponent;
  sourceParentId?: string;
  sourceSlot?: number;
}) => {
  const { removeComponent } = useStorefrontContext();
  const { selectComponent, selectedComponentId, isResizing } =
    useStorefrontCanvasContext();
  const isSelected = useMemo(
    () => selectedComponentId === component.id,
    [component.id, selectedComponentId],
  );
  const isRoot = useMemo(
    () => sourceParentId === undefined && sourceSlot === undefined,
    [sourceParentId, sourceSlot],
  );
  const { ref, handleRef, isDragging, isDropping } = useDraggable({
    id: component.id,
    type: component.type,
    disabled: isRoot || isResizing,
    data: {
      componentId: component.id,
      sourceParentId,
      sourceSlot,
    },
  });

  const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    selectComponent(component.id);
    e.currentTarget.focus({ preventScroll: true });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      selectComponent(null);
      e.currentTarget.blur();
      return;
    }

    if (e.key === 'Delete') {
      e.stopPropagation();
      if (!isRoot && sourceParentId !== undefined && sourceSlot !== undefined) {
        removeComponent(sourceParentId, sourceSlot, component.id);
        selectComponent(null);
      }
    }
  };

  const { baseClasses, baseStyle } = useMemo(() => {
    let classes =
      'relative max-h-full max-w-full min-h-0 min-w-0 overflow-hidden select-none outline-none focus:select-text focus-within:select-text';
    let style = {};
    const result = getBaseLayoutClassesAndStyle(component.config);

    if (result) {
      const [additionalClasses, additionalStyle] = result;
      classes += ` ${additionalClasses}`;
      style = { ...additionalStyle };
    }

    return { baseClasses: classes, baseStyle: style };
  }, [component.config]);

  return {
    id: component.id,
    baseClasses,
    baseStyle,
    ref,
    handleRef,
    isSelected,
    isDragging,
    isDropping,
    handleMouseDown,
    handleKeyDown,
  };
};

export default useLayoutComponent;
