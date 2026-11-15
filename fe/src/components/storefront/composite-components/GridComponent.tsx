// components/storefront/composite-components/GridComponent.tsx
import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';
import useStorefrontLayoutContext from '@/hooks/storefront/useStorefrontLayoutContext';
import { cn } from '@/lib/cn';
import { RowHeightMode } from '@/types/layout-component/composite-component';
import {
  FlattenComponent,
  FlattenCompositeComponent,
} from '@/utils/flattenLayout';
import { CSSProperties, useMemo } from 'react';
import CanvasNodeWrapper from '../canvas/CanvasNodeWrapper';
import DropZone from '../DropZone';
import NodeRenderer, { NodeRendererMode } from '../NodeRenderer';

type GridComponentProps = {
  component: FlattenCompositeComponent;
  sourceParentId?: string;
  sourceSlot?: number;
  mode: NodeRendererMode;
};

function buildTemplateRows(rowCfg: RowHeightMode, rowCount?: number): string {
  const tracks = rowCount ?? 'auto-fill';
  if (rowCfg.mode === 'fixed') {
    return `repeat(${tracks}, minmax(${rowCfg.baseHeightPx}px, auto))`;
  }
  if (rowCfg.mode === 'auto') {
    return `repeat(${tracks}, minmax(${rowCfg.minHeightPx}px, auto))`;
  }
  return 'auto';
}

function getSlotPlacement(
  slots: Record<string, string> | undefined,
  childId: string,
  colCount: number,
): { rowStart: number | 'auto'; colStart: number | 'auto' } {
  const entry = Object.entries(slots ?? {}).find(([, id]) => id === childId);
  const slot = Number(entry?.[0]);
  if (!slot || Number.isNaN(slot)) {
    return { rowStart: 'auto', colStart: 'auto' };
  }

  const cols = Math.max(1, colCount);
  return {
    rowStart: Math.floor((slot - 1) / cols) + 1,
    colStart: ((slot - 1) % cols) + 1,
  };
}

type GridChildRendererProps = {
  parentComponent: FlattenCompositeComponent;
  childComponent: FlattenComponent;
  slot: number;
  childId: string;
  mode: NodeRendererMode;
};

const GridChildRenderer = ({
  parentComponent,
  childComponent,
  slot,
  childId,
  mode,
}: GridChildRendererProps) => {
  const isBento = parentComponent.config.layout === 'BENTO';

  const desktopCols = parentComponent.config.cols?.desktop ?? 1;
  const tabletCols = parentComponent.config.cols?.tablet ?? desktopCols;
  const mobileCols = parentComponent.config.cols?.mobile ?? tabletCols;

  const desktopPos = getSlotPlacement(
    parentComponent.slots?.desktop,
    childId,
    desktopCols,
  );
  const tabletPos = parentComponent.slots?.tablet
    ? getSlotPlacement(parentComponent.slots.tablet, childId, tabletCols)
    : desktopPos;
  const mobilePos = parentComponent.slots?.mobile
    ? getSlotPlacement(parentComponent.slots.mobile, childId, mobileCols)
    : tabletPos;

  const colSpanDesktop = Math.max(
    1,
    Number(childComponent.config.colSpan?.desktop) || 1,
  );
  const colSpanTablet = Math.max(
    1,
    Number(childComponent.config.colSpan?.tablet) || colSpanDesktop,
  );
  const colSpanMobile = Math.max(
    1,
    Number(childComponent.config.colSpan?.mobile) || colSpanTablet,
  );

  const rowSpanDesktop = Math.max(
    1,
    Number(childComponent.config.rowSpan?.desktop) || 1,
  );
  const rowSpanTablet = Math.max(
    1,
    Number(childComponent.config.rowSpan?.tablet) || rowSpanDesktop,
  );
  const rowSpanMobile = Math.max(
    1,
    Number(childComponent.config.rowSpan?.mobile) || rowSpanTablet,
  );

  const itemStyle: CSSProperties = useMemo(
    () =>
      isBento
        ? ({
            '--col-span-mobile': `span ${colSpanMobile} / span ${colSpanMobile}`,
            '--col-span-tablet': `span ${colSpanTablet} / span ${colSpanTablet}`,
            '--col-span-desktop': `span ${colSpanDesktop} / span ${colSpanDesktop}`,
            '--row-span-mobile': `span ${rowSpanMobile} / span ${rowSpanMobile}`,
            '--row-span-tablet': `span ${rowSpanTablet} / span ${rowSpanTablet}`,
            '--row-span-desktop': `span ${rowSpanDesktop} / span ${rowSpanDesktop}`,
          } as CSSProperties)
        : ({
            '--col-start-mobile': mobilePos.colStart,
            '--col-start-tablet': tabletPos.colStart,
            '--col-start-desktop': desktopPos.colStart,
            '--row-start-mobile': mobilePos.rowStart,
            '--row-start-tablet': tabletPos.rowStart,
            '--row-start-desktop': desktopPos.rowStart,
          } as CSSProperties),
    [
      colSpanDesktop,
      colSpanMobile,
      colSpanTablet,
      desktopPos.colStart,
      desktopPos.rowStart,
      isBento,
      mobilePos.colStart,
      mobilePos.rowStart,
      rowSpanDesktop,
      rowSpanMobile,
      rowSpanTablet,
      tabletPos.colStart,
      tabletPos.rowStart,
    ],
  );

  const containerClassName = cn(
    'min-w-0',
    isBento
      ? 'col-span-(--col-span-mobile) md:col-span-(--col-span-tablet) lg:col-span-(--col-span-desktop) [row-span-(--row-span-mobile) md:row-span-(--row-span-tablet) lg:row-span-(--row-span-desktop)]'
      : 'col-start-(--col-start-mobile) md:col-start-(--col-start-tablet) lg:col-start-(--col-start-desktop) row-start-(--row-start-mobile) md:row-start-(--row-start-tablet) lg:row-start-(--row-start-desktop)',
  );

  return mode === NodeRendererMode.Active ? (
    <div
      key={`${parentComponent.id}-item-${slot}-${childId}`}
      style={{ ...itemStyle }}
      className={containerClassName}
    >
      <NodeRenderer
        component={childComponent}
        sourceParentId={parentComponent.id}
        sourceSlot={slot}
        mode={mode}
      />
    </div>
  ) : (
    <DropZone
      sourceParentId={parentComponent.id}
      sourceSlot={slot}
      disabled={mode !== NodeRendererMode.Editor}
      style={{ ...itemStyle }}
      className={containerClassName}
    >
      {childComponent && (
        <NodeRenderer
          component={childComponent}
          sourceParentId={parentComponent.id}
          sourceSlot={slot}
          mode={mode}
        />
      )}
    </DropZone>
  );
};

const GridComponent = ({
  component,
  sourceParentId,
  sourceSlot,
  mode,
}: GridComponentProps) => {
  const { state } = useStorefrontLayoutContext();
  const { breakpoint } = useStorefrontCanvasContext();

  const isRoot = component.id === state.rootId;
  const currentBp = breakpoint === 'fluid' ? 'desktop' : breakpoint;
  const { components } = state;
  const { config } = component;
  const { rows, cols, gap, rowHeight } = config;

  const desktopCols = cols.desktop ?? 1;
  const tabletCols = cols.tablet ?? desktopCols;
  const mobileCols = cols.mobile ?? tabletCols;

  const desktopGap = gap.desktop ?? 0;
  const tabletGap = gap.tablet ?? desktopGap;
  const mobileGap = gap.mobile ?? tabletGap;

  const desktopRowCfg = rowHeight.desktop;
  const tabletRowCfg = rowHeight.tablet ?? desktopRowCfg;
  const mobileRowCfg = rowHeight.mobile ?? tabletRowCfg;

  const activeStyle = useMemo(
    () =>
      ({
        '--grid-cols-mobile': `repeat(${mobileCols}, minmax(0, 1fr))`,
        '--grid-cols-tablet': `repeat(${tabletCols}, minmax(0, 1fr))`,
        '--grid-cols-desktop': `repeat(${desktopCols}, minmax(0, 1fr))`,
        '--grid-rows-mobile': buildTemplateRows(
          mobileRowCfg,
          rows?.mobile ?? rows?.tablet ?? rows?.desktop,
        ),
        '--grid-rows-tablet': buildTemplateRows(
          tabletRowCfg,
          rows?.tablet ?? rows?.desktop,
        ),
        '--grid-rows-desktop': buildTemplateRows(desktopRowCfg, rows?.desktop),
        '--grid-auto-rows-mobile':
          mobileRowCfg.mode === 'fixed'
            ? `minmax(${mobileRowCfg.baseHeightPx}px, auto)`
            : 'auto',
        '--grid-auto-rows-tablet':
          tabletRowCfg.mode === 'fixed'
            ? `minmax(${tabletRowCfg.baseHeightPx}px, auto)`
            : 'auto',
        '--grid-auto-rows-desktop':
          desktopRowCfg.mode === 'fixed'
            ? `minmax(${desktopRowCfg.baseHeightPx}px, auto)`
            : 'auto',
        '--grid-gap-mobile': `${mobileGap}px`,
        '--grid-gap-tablet': `${tabletGap}px`,
        '--grid-gap-desktop': `${desktopGap}px`,
        gridAutoFlow: config.densePacking ? 'row dense' : 'row',
      }) as CSSProperties,
    [
      config.densePacking,
      desktopCols,
      desktopGap,
      desktopRowCfg,
      mobileCols,
      mobileGap,
      mobileRowCfg,
      rows?.desktop,
      rows?.mobile,
      rows?.tablet,
      tabletCols,
      tabletGap,
      tabletRowCfg,
    ],
  );

  const slotEntries = useMemo(
    () =>
      Object.entries(component.slots?.[currentBp] ?? {})
        .map(([slotKey, childId]) => ({ slot: Number(slotKey), childId }))
        .filter(
          ({ slot, childId }) =>
            !Number.isNaN(slot) && Boolean(components[childId]),
        )
        .sort((a, b) => a.slot - b.slot),
    [component.slots, components, currentBp],
  );

  return (
    <CanvasNodeWrapper
      mode={mode}
      component={component}
      sourceParentId={sourceParentId}
      sourceSlot={sourceSlot}
      style={activeStyle}
      className={cn(
        'grid content-start',
        'grid-cols-(--grid-cols-mobile) md:grid-cols-(--grid-cols-tablet) lg:grid-cols-(--grid-cols-desktop)',
        'grid-rows-(--grid-rows-mobile) md:grid-rows-(--grid-rows-tablet) lg:grid-rows-(--grid-rows-desktop)',
        'grid-auto-rows-(--grid-auto-rows-mobile) md:grid-auto-rows-(--grid-auto-rows-tablet) lg:grid-auto-rows-(--grid-auto-rows-desktop)',
        'gap-(--grid-gap-mobile) md:gap-(--grid-gap-tablet) lg:gap-(--grid-gap-desktop)',
        isRoot ? 'w-full h-auto' : 'w-full h-full',
      )}
    >
      {slotEntries.map(({ slot, childId }) => {
        const childComponent = components[childId];
        if (!childComponent) return null;

        return (
          <GridChildRenderer
            key={`${component.id}-item-${slot}-${childId}`}
            parentComponent={component}
            childComponent={childComponent}
            slot={slot}
            childId={childId}
            mode={mode}
          />
        );
      })}
    </CanvasNodeWrapper>
  );
};

export default GridComponent;
