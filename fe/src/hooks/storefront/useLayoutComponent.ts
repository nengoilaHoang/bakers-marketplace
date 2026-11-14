import { FlattenComponent } from '@/utils/flattenLayout';
import { getBaseLayoutClassesAndStyle } from '@/utils/layoutClasses';
import {
	Draggable,
	DragOperation,
	Droppable,
	Modifier,
} from '@dnd-kit/abstract';
import type { Coordinates } from '@dnd-kit/geometry';
import { useDraggable } from '@dnd-kit/react';
import React, { useCallback, useMemo } from 'react';
import useStorefrontCanvasContext from './useStorefrontCanvasContext';
import useStorefrontLayoutContext from './useStorefrontLayoutContext';

class GrabOffsetModifier extends Modifier {
  public apply(operation: DragOperation<Draggable, Droppable>): Coordinates {
    const { activatorEvent, source, transform } = operation;

    if (
      !(activatorEvent instanceof MouseEvent) ||
      !source ||
      !('element' in source) ||
      !(source.element instanceof HTMLElement)
    ) {
      return transform;
    }

    const rect = source.element.getBoundingClientRect();
    const clickOffsetX = activatorEvent.clientX - rect.left;
    const clickOffsetY = activatorEvent.clientY - rect.top;

    return {
      ...transform,
      x: transform.x + (clickOffsetX - 20),
      y: transform.y + (clickOffsetY - 20),
    };
  }
}

const useLayoutComponent = ({
  component,
  sourceParentId,
  sourceSlot,
  isPreview = false,
}: {
  component: FlattenComponent;
  sourceParentId?: string;
  sourceSlot?: number;
  isPreview?: boolean;
}) => {
  const { state, removeComponent, removeComponentInBreakpoint } =
    useStorefrontLayoutContext();
  const { selectComponent, selectedComponentId, isResizing, breakpoint } =
    useStorefrontCanvasContext();
  const isSelected = useMemo(
    () => selectedComponentId === component.id,
    [component.id, selectedComponentId],
  );
  const isRoot = component.id === state.rootId;

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
      isPreview,
    },
    modifiers: [GrabOffsetModifier],
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

      const isModifierKeyPressed = e.ctrlKey || e.metaKey;

      if (isModifierKeyPressed && e.key === 'Delete') {
        e.stopPropagation();
        if (
          !isRoot &&
          sourceParentId !== undefined &&
          sourceSlot !== undefined
        ) {
          removeComponentInBreakpoint(
            sourceParentId,
            breakpoint === 'fluid' ? 'desktop' : breakpoint,
            sourceSlot,
          );
          selectComponent(null);
        }
      } else if (!isModifierKeyPressed && e.key === 'Delete') {
        e.stopPropagation();
        if (!isRoot && sourceParentId !== undefined) {
          removeComponent(sourceParentId, component.id);
          selectComponent(null);
        }
      }

      if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) {
        if (e.target !== e.currentTarget) return;

        e.preventDefault();
        e.stopPropagation();

        const iframe = document.getElementById('canvas-iframe');
        if (!iframe) return;

        const iframeDoc =
          (iframe as HTMLIFrameElement).contentWindow?.document ??
          (iframe as HTMLIFrameElement).contentDocument;
        if (!iframeDoc) return;

        const componentsList = Array.from(
          iframeDoc.body.querySelectorAll<HTMLElement>(
            '[data-layout-node="true"]',
          ),
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
      breakpoint,
      component.id,
      isRoot,
      removeComponent,
      removeComponentInBreakpoint,
      selectComponent,
      sourceParentId,
      sourceSlot,
    ],
  );

  const { baseClasses, baseStyle } = useMemo(() => {
    let classes = isRoot
      ? 'relative w-full min-h-0 select-none outline-none focus:select-text focus-within:select-text'
      : 'relative max-h-full max-w-full min-h-0 min-w-0 overflow-hidden select-none outline-none focus:select-text focus-within:select-text';
    let style = {};
    const result = getBaseLayoutClassesAndStyle(component.config);

    if (result) {
      const [additionalClasses, additionalStyle] = result;
      classes += ` ${additionalClasses}`;
      style = { ...additionalStyle };
    }

    return { baseClasses: classes, baseStyle: style };
  }, [component.config, isRoot]);

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
