// components/storefront/composite-components/GridComponent.tsx
import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';
import useStorefrontLayoutContext from '@/hooks/storefront/useStorefrontLayoutContext';
import { DeviceBreakpoint } from '@/types/canvas';
import { FlattenCompositeComponent } from '@/utils/flattenLayout';
import { CSSProperties, useMemo } from 'react';
import { CanvasNodeWrapper } from '../canvas/CanvasNodeWrapper';
import DropZone from '../DropZone';
import NodeRenderer, { NodeRendererMode } from '../NodeRenderer';

type CompositeComponentProps = {
  component: FlattenCompositeComponent;
  sourceParentId?: string;
  sourceSlot?: number;
  mode: NodeRendererMode;
};

const GridComponent = ({
  component,
  sourceParentId,
  sourceSlot,
  mode,
}: CompositeComponentProps) => {
  const { state } = useStorefrontLayoutContext();
  const { components } = state;
  const config = component.config;
  const { rows, cols, gap, rowHeight } = config;
  const { breakpoint: currentBp } = useStorefrontCanvasContext();

  const bp: DeviceBreakpoint = currentBp === 'fluid' ? 'desktop' : currentBp;
  const isRoot = component.id === state.rootId;
  const isBento = config.layout === 'BENTO';
  const activeCols = cols[bp] ?? cols.desktop ?? 1;
  const currentSlotMap = useMemo(
    () => component.slots?.[bp] ?? {},
    [bp, component.slots],
  );

  // Compute CSS Grid specs for each breakpoint
  const gridStyle = useMemo<CSSProperties>(() => {
    const colsValue = cols[bp] ?? cols.desktop;
    const gapValue = gap[bp] ?? gap.desktop;
    const rowCfg = rowHeight[bp] ?? rowHeight.desktop;

    let gridTemplateRows = 'auto';
    if (rowCfg.mode === 'fixed') {
      gridTemplateRows = `repeat(${rows?.[bp] ?? rows?.desktop ?? 'auto-fill'}, minmax(${rowCfg.baseHeightPx}px, auto))`;
    } else if (rowCfg.mode === 'auto') {
      gridTemplateRows = `repeat(${rows?.[bp] ?? rows?.desktop ?? 'auto-fill'}, minmax(${rowCfg.minHeightPx}px, auto))`;
    }

    return {
      display: 'grid',
      alignContent: 'start',
      gap: `${gapValue}px`,
      gridTemplateColumns: `repeat(${colsValue}, minmax(0, 1fr))`,
      gridTemplateRows,
      gridAutoRows:
        rowCfg.mode === 'fixed'
          ? `minmax(${rowCfg.baseHeightPx}px, auto)`
          : 'auto',
      gridAutoFlow: config.densePacking ? 'row dense' : 'row',
    };
  }, [cols, gap, rowHeight, config.densePacking, rows, bp]);

  // Compute all slots covered by multi-column / multi-row spans and required row count
  // The maxSpannedRow is to ensure that if an item in the last configured row has rowSpan > 1,
  // the grid still generates the uncovered dropzones alongside it on the newly expanded row.
  const { coveredSlots, maxSpannedRow } = useMemo(() => {
    const covered = new Set<number>();
    let maxRow = 1;

    if (!isBento) {
      return { coveredSlots: covered, maxSpannedRow: maxRow };
    }

    for (const [slotKey, childId] of Object.entries(currentSlotMap)) {
      const slot = Number(slotKey);
      const child = childId ? components[childId] : null;
      if (Number.isNaN(slot) || !child) continue;

      const zeroBased = slot - 1;
      const startCol = (zeroBased % activeCols) + 1;
      const startRow = Math.floor(zeroBased / activeCols) + 1;

      const rawColSpan =
        typeof child.config.colSpan === 'number'
          ? child.config.colSpan
          : child.config.colSpan?.[bp];
      const rawRowSpan =
        typeof child.config.rowSpan === 'number'
          ? child.config.rowSpan
          : child.config.rowSpan?.[bp];

      const colSpan = Math.min(
        activeCols - startCol + 1,
        Math.max(1, Number(rawColSpan) || 1),
      );
      const rowSpan = Math.max(1, Number(rawRowSpan) || 1);

      maxRow = Math.max(maxRow, startRow + rowSpan - 1);

      for (let r = startRow; r < startRow + rowSpan; r++) {
        for (let c = startCol; c < startCol + colSpan; c++) {
          if (r === startRow && c === startCol) continue; // Keep origin slot
          covered.add((r - 1) * activeCols + c);
        }
      }
    }

    return { coveredSlots: covered, maxSpannedRow: maxRow };
  }, [isBento, currentSlotMap, components, activeCols, bp]);

  // Calculate total slots for this breakpoint
  const totalSlots = useMemo(() => {
    const slotKeys = Object.keys(currentSlotMap)
      .map(Number)
      .filter((num) => !Number.isNaN(num));
    const maxSlot = slotKeys.length > 0 ? Math.max(...slotKeys) : 0;
    const configuredRows = rows?.[bp] ?? rows?.desktop ?? 1;

    const neededRows = Math.max(
      configuredRows,
      Math.ceil(maxSlot / activeCols),
      maxSpannedRow,
    );
    return Math.max(activeCols * neededRows, slotKeys.length);
  }, [activeCols, bp, currentSlotMap, rows, maxSpannedRow]);

  const editorProps = {
    'aria-label': 'Grid Component',
  };

  return (
    <CanvasNodeWrapper
      mode={mode}
      component={component}
      sourceParentId={sourceParentId}
      sourceSlot={sourceSlot}
      style={gridStyle}
      className={isRoot ? 'w-full h-auto' : 'w-full h-full'}
      {...editorProps}
    >
      {Array.from({ length: totalSlots }).map((_, index) => {
        const slot = index + 1; // Slot counting starts at 1, not 0

        // Skip rendering DropZones overlapped by a preceding item's span
        if (isBento && coveredSlots.has(slot)) {
          return null;
        }

        const childId = currentSlotMap[slot];
        const childComponent = childId ? components[childId] : null;
        const childStartCol = (index % activeCols) + 1;
        const childStartRow = Math.floor(index / activeCols) + 1;

        const childColSpan =
          isBento && childComponent
            ? Math.max(1, childComponent.config.colSpan?.[bp] || 1)
            : 1;
        const childRowSpan =
          isBento && childComponent
            ? Math.max(1, childComponent.config.rowSpan?.[bp] || 1)
            : 1;

        return (
          <DropZone
            key={`${component.id}-slot-${slot}`}
            sourceParentId={component.id}
            sourceSlot={slot}
            disabled={mode !== NodeRendererMode.Editor}
            style={
              isBento && childComponent
                ? {
                    gridColumn: `${childStartCol} / span ${childColSpan}`,
                    gridRow: `${childStartRow} / span ${childRowSpan}`,
                  }
                : undefined
            }
          >
            {childComponent && (
              <NodeRenderer
                component={childComponent}
                sourceParentId={component.id}
                sourceSlot={slot}
                mode={mode}
              />
            )}
          </DropZone>
        );
      })}
    </CanvasNodeWrapper>
  );
};

export default GridComponent;
