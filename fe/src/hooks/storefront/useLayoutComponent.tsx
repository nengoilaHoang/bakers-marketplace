import { FlattenComponent } from '@/utils/flattenLayout';
import { getBaseLayoutClassesAndStyle } from '@/utils/layoutClasses';
import { useDraggable } from '@dnd-kit/react';
import React, { useCallback, useMemo } from 'react';
import useStorefrontCanvasContext from './useStorefrontCanvasContext';
import useStorefrontLayoutContext from './useStorefrontLayoutContext';

const useLayoutComponent = ({
  component,
  sourceParentId,
  sourceSlot,
}: {
  component: FlattenComponent;
  sourceParentId?: string;
  sourceSlot?: number;
}) => {
  const { removeComponent } = useStorefrontLayoutContext();
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

  const isDefaultFocusTarget = selectedComponentId === null && isRoot;
  const tabIndex = isSelected || isDefaultFocusTarget ? 0 : -1;

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

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      selectComponent(component.id);
      e.currentTarget.focus({ preventScroll: true });
    },
    [component.id, selectComponent],
  );

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      if (
        e.target === e.currentTarget &&
        selectedComponentId !== component.id
      ) {
        selectComponent(component.id);
      }
    },
    [component.id, selectComponent, selectedComponentId],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        selectComponent(null);
        e.currentTarget.blur();
        return;
      }

      if (e.key === 'Delete') {
        e.stopPropagation();
        if (
          !isRoot &&
          sourceParentId !== undefined &&
          sourceSlot !== undefined
        ) {
          removeComponent(sourceParentId, sourceSlot, component.id);
          selectComponent(null);
        }
      }

      if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) {
        if (e.target !== e.currentTarget) return;

        e.preventDefault();
        e.stopPropagation();

        const board = document.getElementById('cms-board');
        if (!board) return;

        const componentsList = Array.from(
          board.querySelectorAll<HTMLElement>('[data-layout-node="true"]'),
        );
        const currentIndex = componentsList.indexOf(e.currentTarget);
        if (currentIndex === -1) return;

        const isNext = e.key === 'ArrowDown' || e.key === 'ArrowRight';
        const targetIndex = isNext
          ? (currentIndex + 1) % componentsList.length
          : (currentIndex - 1 + componentsList.length) % componentsList.length;

        const targetEl = componentsList[targetIndex];
        if (targetEl) targetEl.focus({ preventScroll: false });
      }
    },
    [
      component.id,
      isRoot,
      removeComponent,
      selectComponent,
      sourceParentId,
      sourceSlot,
    ],
  );

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
    tabIndex,
    baseClasses,
    baseStyle,
    ref,
    handleRef,
    isSelected,
    isDragging,
    isDropping,
    handleMouseDown,
    handleKeyDown,
    handleFocus,
  };
};

export default useLayoutComponent;
