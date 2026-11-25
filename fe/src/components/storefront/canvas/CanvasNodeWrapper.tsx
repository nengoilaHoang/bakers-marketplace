// components/storefront/canvas/CanvasNodeWrapper.tsx
import useLayoutComponent from '@/hooks/storefront/useLayoutComponent';
import { cn } from '@/lib/cn';
import { FlattenComponent } from '@/utils/flattenLayout';
import { getBaseLayoutClassesAndStyle } from '@/utils/layoutClasses';
import React, { useMemo } from 'react';
import { NodeRendererMode } from '../NodeRenderer';

export interface CanvasNodeWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  mode: NodeRendererMode;
  component: FlattenComponent;
  sourceParentId?: string;
  sourceSlot?: number;
  children: React.ReactNode;
}

const ActiveNodeWrapper = ({
  component,
  className,
  style,
  children,
  ...restProps
}: Omit<CanvasNodeWrapperProps, 'mode' | 'sourceParentId' | 'sourceSlot'>) => {
  const { baseClasses, baseStyle } = useMemo(() => {
    const result = getBaseLayoutClassesAndStyle(component.config);
    if (!result) {
      return { baseClasses: 'relative min-h-0 min-w-0', baseStyle: {} };
    }
    const [additionalClasses, additionalStyle] = result;
    return {
      baseClasses: `relative min-h-0 min-w-0 ${additionalClasses}`.trim(),
      baseStyle: additionalStyle,
    };
  }, [component.config]);

  return (
    <div
      id={component.id}
      className={cn(baseClasses, className)}
      style={{ ...baseStyle, ...style }}
      {...restProps}
    >
      {children}
    </div>
  );
};

const EditorNodeWrapper = ({
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

  const props = useMemo(
    () => ({
      'data-layout-node': true,
      'aria-busy': isDragging,
      ...(isPreview ? { 'data-preview': true } : {}),
      ...(isEditor
        ? {
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
          }
        : {}),
    }),
    [
      component.componentType,
      component.name,
      handleFocus,
      handleKeyDown,
      handleMouseDown,
      isDragging,
      isEditor,
      isPreview,
      isSelected,
      onClick,
      onDoubleClick,
      sourceParentId,
      sourceSlot,
      tabIndex,
    ],
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

const CanvasNodeWrapper = (props: CanvasNodeWrapperProps) => {
  if (props.mode === NodeRendererMode.Active) {
    const { mode, sourceParentId, sourceSlot, ...rest } = props;
    return <ActiveNodeWrapper {...rest} />;
  }
  return <EditorNodeWrapper {...props} />;
};

export default CanvasNodeWrapper;
