import useLayoutComponent from '@/hooks/storefront/useLayoutComponent';
import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';
import useStorefrontLayoutContext from '@/hooks/storefront/useStorefrontLayoutContext';
import { DeviceBreakpoint } from '@/types/canvas';
import { FlattenCompositeComponent } from '@/utils/flattenLayout';
import { CSSProperties, useMemo } from 'react';
import ComponentRenderer from '../ComponentRenderer';
import DropZone from '../DropZone';

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
  });
  const { state } = useStorefrontLayoutContext();
  const { components } = state;

  const config = component.config;
  const { rows, cols, gap, layout } = config;

  const { breakpoint: currentBp } = useStorefrontCanvasContext();

  const gridStyles = useMemo<{ [K in DeviceBreakpoint]: CSSProperties }>(() => {
    return (['desktop', 'tablet', 'mobile'] as const).reduce(
      (acc, bp) => {
        const colsValue = cols[bp];
        const rowsValue = rows[bp];
        const gapValue = gap[bp];

        const style: CSSProperties = {
          display: 'grid',
          gap: gapValue + 'px',
          gridTemplateColumns: `repeat(${colsValue}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rowsValue}, minmax(0, 1fr))`,
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

  // Generate cell style for each breakpoint
  const gridItems = useMemo(() => {
    return (['desktop', 'tablet', 'mobile'] as const).reduce(
      (acc, bp) => {
        const currentCols = cols[bp];
        const currentRows = rows[bp];

        const totalSlots = currentCols * currentRows;
        const coveredSlots = new Set<number>();
        const activeSlots = component.children[bp];

        const cells = [];
        for (let slot = 1; slot <= totalSlots; slot++) {
          if (coveredSlots.has(slot)) continue;

          const rowStart = Math.floor((slot - 1) / currentCols) + 1;
          const colStart = ((slot - 1) % currentCols) + 1;

          const childId = activeSlots[slot];
          const child = childId ? components[childId] : undefined;

          const isBento = layout === 'BENTO';
          const colSpan =
            isBento && child?.config.colSpan
              ? Math.max(
                  1,
                  Math.min(child.config.colSpan, currentCols - colStart + 1),
                )
              : 1;
          const rowSpan =
            isBento && child?.config.rowSpan
              ? Math.max(
                  1,
                  Math.min(child.config.rowSpan, currentRows - rowStart + 1),
                )
              : 1;

          if (colSpan > 1 || rowSpan > 1) {
            for (let r = 0; r < rowSpan; r++) {
              for (let c = 0; c < colSpan; c++) {
                const targetSlot =
                  (rowStart - 1 + r) * currentCols + (colStart + c);
                if (targetSlot !== slot) {
                  coveredSlots.add(targetSlot);
                }
              }
            }
          }

          const style = {
            gridColumn: `${colStart} / span ${colSpan}`,
            gridRow: `${rowStart} / span ${rowSpan}`,
          };
          cells.push({
            slot,
            childId,
            style,
          });
        }

        acc[bp] = cells;
        return acc;
      },
      {} as {
        [K in DeviceBreakpoint]: {
          slot: number;
          childId: string | undefined;
          style: CSSProperties;
        }[];
      },
    );
  }, [cols, component.children, components, layout, rows]);

  return (
    <div
      className={`grid ${baseClasses}`}
      style={{ ...gridStyles[currentBp === 'fluid' ? 'desktop' : currentBp] }}
      id={id}
      ref={ref}
      tabIndex={tabIndex}
      data-layout-node='true'
      data-source-parent-id={sourceParentId}
      data-source-slot={sourceSlot}
      aria-pressed={isSelected || isDragging}
      aria-controls={sourceParentId}
      aria-busy={isDragging}
      aria-label={`Hover over this component to see the available actions. Press Escape to deselect this component. Press Delete to remove this component.`}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onFocus={handleFocus}
    >
      {gridItems[currentBp === 'fluid' ? 'desktop' : currentBp].map(
        ({ slot, childId, style }) => {
          const child = childId ? components[childId] : undefined;
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
