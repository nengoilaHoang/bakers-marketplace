// components/storefront/canvas/CanvasNodeWrapper.tsx
import useLayoutComponent from '@/hooks/storefront/useLayoutComponent';
import { cn } from '@/lib/cn';
import { FlattenComponent } from '@/utils/flattenLayout';
import React, { useMemo } from 'react';
import { NodeRendererMode } from '../NodeRenderer';

export interface CanvasNodeWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  mode: NodeRendererMode;
  component: FlattenComponent;
  sourceParentId?: string;
  sourceSlot?: number;
  children: React.ReactNode;
}

export const CanvasNodeWrapper = ({
  mode,
  component,
  sourceParentId,
  sourceSlot,
  className,
  style,
  children,
  onClick,
  onDoubleClick,
  ...restProps
}: CanvasNodeWrapperProps) => {
  const isEditor = mode === NodeRendererMode.Editor;
  const isPreview = mode === NodeRendererMode.Preview;

  const {
    id,
    tabIndex,
    baseClasses,
    baseStyle,
    ref,
    isDragging,
    isSelected,
    handleKeyDown,
    handleMouseDown,
    handleFocus,
  } = useLayoutComponent({
    component,
    sourceParentId,
    sourceSlot,
    isPreview,
  });

  const editorOrPreviewProps = useMemo(
    () => ({
      'data-layout-node': true,
      'aria-busy': isDragging,
      'aria-pressed': isDragging,
    }),
    [isDragging],
  );

  const previewProps = useMemo(
    () => ({
      'data-preview': true,
    }),
    [],
  );

  const editorProps = useMemo(
    () => ({
      'data-source-parent-id': sourceParentId,
      'data-source-slot': sourceSlot,
      'aria-controls': sourceParentId,
      'aria-label': `${component.name} (${component.componentType})`,
      'aria-pressed': isSelected || isDragging,
      tabIndex,
      onKeyDown: handleKeyDown,
      onMouseDown: handleMouseDown,
      onFocus: handleFocus,
      onClick,
      onDoubleClick,
    }),
    [
      component.componentType,
      component.name,
      handleFocus,
      handleKeyDown,
      handleMouseDown,
      isDragging,
      isSelected,
      onClick,
      onDoubleClick,
      sourceParentId,
      sourceSlot,
      tabIndex,
    ],
  );

  const props = useMemo(
    () => ({
      ...(isEditor || isPreview ? editorOrPreviewProps : {}),
      ...(isPreview ? previewProps : {}),
      ...(isEditor ? editorProps : {}),
    }),
    [isEditor, isPreview, editorOrPreviewProps, previewProps, editorProps],
  );

  return (
    <div
      ref={ref}
      id={id}
      className={cn(
        baseClasses,
        isEditor && isDragging && 'relative z-50',
        className,
      )}
      style={{ ...baseStyle, ...style }}
      {...restProps}
      {...props}
    >
      {children}
    </div>
  );
};
