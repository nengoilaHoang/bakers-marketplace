import useLayoutComponent from '@/hooks/storefront/useLayoutComponent';
import useStorefrontContext from '@/hooks/storefront/useStorefrontContext';
import ComponentRenderer from '../ComponentRenderer';
import DropZone from '../DropZone';
import { CSSProperties, useMemo } from 'react';
import { FlattenCompositeComponent } from '@/utils/flattenLayout';
import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';
import { DeviceBreakpoint } from '@/types/canvas';

type CompositeComponentProps = {
  component: FlattenCompositeComponent;
  sourceParentId?: string;
  sourceSlot?: number;
};

const GridComponent = ({
  component,
  sourceParentId,
  sourceSlot,
}: CompositeComponentProps) => {
  const {
    id,
    baseClasses,
    baseStyle,
    ref,
    isDragging,
    isSelected,
    handleKeyDown,
    handleMouseDown,
  } = useLayoutComponent({
    component,
    sourceParentId,
    sourceSlot,
  });
  const { state } = useStorefrontContext();
  const { components } = state;

  const config = component.config;
  const { rows, cols, gap, layout } = config;

  const className = useMemo(() => {
    switch (layout) {
      case 'UNIFORM': {
        return `grid ${baseClasses}`;
      }
      default:
        return;
    }
  }, [baseClasses, layout]);

  const { breakpoint } = useStorefrontCanvasContext();

  const gridStyles = useMemo<{ [K in DeviceBreakpoint]: CSSProperties }>(() => {
    return (['desktop', 'tablet', 'mobile'] as const).reduce(
      (acc, bp) => {
        const colsValue = cols[bp];
        const rowsValue = rows[bp];
        const gapValue = gap[bp];

        const style: CSSProperties = {
          gap: gapValue + 'px',
          gridTemplateColumns: 'repeat(' + colsValue + ', 1fr)',
          gridTemplateRows: 'repeat(' + rowsValue + ', 1fr)',
          ...baseStyle,
        };

        acc[bp] = style;
        return acc;
      },
      {} as {
        [K in DeviceBreakpoint]: CSSProperties;
      },
    );
  }, [gap, rows, cols, baseStyle]);

  // const gridStyle = useMemo(
  //   () => ({
  //     "--grid-cols-desktop": `repeat(${cols.desktop}, 1fr)`,
  //     "--grid-cols-tablet": `repeat(${cols.tablet}, 1fr)`,
  //     "--grid-cols-mobile": `repeat(${cols.mobile}, 1fr)`,
  //     "--grid-rows-desktop": `repeat(${rows.desktop}, 1fr)`,
  //     "--grid-rows-tablet": `repeat(${rows.tablet}, 1fr)`,
  //     "--grid-rows-mobile": `repeat(${rows.mobile}, 1fr)`,
  //     "--grid-gap-desktop": `${gap.desktop}px`,
  //     "--grid-gap-tablet": `${gap.tablet}px`,
  //     "--grid-gap-mobile": `${gap.mobile}px`,
  //   }),
  //   [cols, rows, gap],
  // );

  const cellsStyles = useMemo(() => {
    return (['desktop', 'tablet', 'mobile'] as const).reduce(
      (acc, bp) => {
        const totalCells = cols[bp] * rows[bp];
        const cells = [];
        for (let i = 0; i < totalCells; i++) {
          const rowStart = Math.floor(i / cols[bp]) + 1;
          const colStart = (i % cols[bp]) + 1;
          cells.push({
            gridRowStart: rowStart,
            gridColumnStart: colStart,
          });
        }

        acc[bp] = cells;
        return acc;
      },
      {} as {
        [K in DeviceBreakpoint]: CSSProperties[];
      },
    );
  }, [cols, rows]);

  return (
    <div
      className={className}
      style={{ ...gridStyles[breakpoint === 'fluid' ? 'desktop' : breakpoint] }}
      id={id}
      ref={ref}
      tabIndex={0}
      data-source-parent-id={sourceParentId}
      data-source-slot={sourceSlot}
      aria-pressed={isSelected || isDragging}
      aria-controls={sourceParentId}
      aria-busy={isDragging}
      aria-label={`Hover over this component to see the available actions. Press Escape to deselect this component. Press Delete to remove this component.`}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
    >
      {cellsStyles[breakpoint === 'fluid' ? 'desktop' : breakpoint].map(
        (style, idx) => {
          const slot = idx + 1;
          const childId =
            component.children[breakpoint === 'fluid' ? 'desktop' : breakpoint][
              slot
            ];
          const child = components[childId];
          return (
            <DropZone
              key={`slot-${slot}`}
              sourceParentId={id}
              sourceSlot={Number(slot)}
              extraStyle={style}
            >
              {child ? (
                <ComponentRenderer
                  key={childId}
                  component={child}
                  sourceParentId={id}
                  sourceSlot={Number(slot)}
                />
              ) : undefined}
            </DropZone>
          );
        },
      )}
    </div>
  );
};

export default GridComponent;
