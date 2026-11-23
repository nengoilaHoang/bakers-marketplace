import { RepeaterItemContextProvider } from '@/hooks/storefront/RepeaterItemContextProvider';
import { useOptionalStorefrontLayoutContext } from '@/hooks/storefront/useStorefrontLayoutContext';
import { useOptionalStorefrontRenderContext } from '@/hooks/storefront/useStorefrontRenderContext';
import useCollectionDataSource from '@/hooks/useCollectionDataSource';
import { cn } from '@/lib/cn';
import { Product } from '@/types/product';
import {
  FlattenCollectionGridRepeaterComponent,
  FlattenComponent,
} from '@/utils/flattenLayout';
import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import CanvasNodeWrapper from '../canvas/CanvasNodeWrapper';
import DropZone from '../DropZone';
import NodeRenderer, { NodeRendererMode } from '../NodeRenderer';

type CollectionGridComponentProps = {
  component: FlattenCollectionGridRepeaterComponent;
  sourceParentId?: string;
  sourceSlot?: number;
  mode: NodeRendererMode;
};

const CollectionGridComponent = ({
  component,
  sourceParentId,
  sourceSlot,
  mode,
}: CollectionGridComponentProps) => {
  const layoutCtx = useOptionalStorefrontLayoutContext();
  const renderCtx = useOptionalStorefrontRenderContext();

  const components = layoutCtx?.state.components ?? renderCtx?.components ?? {};

  const { config, itemTemplate } = component;
  const templateComponent = itemTemplate ? components[itemTemplate] : null;
  const isEditor = mode === NodeRendererMode.Editor;

  const [page, setPage] = useState(1);
  const productsRef = useRef<Product[]>([]);

  const {
    products: items,
    totalPages,
    isLoading,
  } = useCollectionDataSource({
    dataSource: config.dataSource ?? {
      type: 'context',
      mode: 'current_collection',
    },
    limit: 'pageSize' in config ? config.pageSize : 20,
    page,
    isEditor,
  });

  useEffect(() => {
    if (!items) return;
    if (config.layout === 'infinite_scroll') {
      productsRef.current = [...items, ...productsRef.current];
    } else {
      productsRef.current = items;
    }
  }, [config.layout, items]);

  const desktopCols = config.cols.desktop;
  const tabletCols = config.cols?.tablet ?? desktopCols;
  const mobileCols = config.cols?.mobile ?? tabletCols;

  const desktopGap = config.gap.desktop;
  const tabletGap = config.gap.tablet ?? desktopGap;
  const mobileGap = config.gap.mobile ?? tabletGap;

  const gridStyle = useMemo(
    () =>
      ({
        '--rep-cols-mobile': `repeat(${mobileCols}, minmax(0, 1fr))`,
        '--rep-cols-tablet': `repeat(${tabletCols}, minmax(0, 1fr))`,
        '--rep-cols-desktop': `repeat(${desktopCols}, minmax(0, 1fr))`,
        '--rep-gap-mobile': `${mobileGap}px`,
        '--rep-gap-tablet': `${tabletGap}px`,
        '--rep-gap-desktop': `${desktopGap}px`,
      }) as CSSProperties,
    [desktopCols, desktopGap, mobileCols, mobileGap, tabletCols, tabletGap],
  );

  return (
    <CanvasNodeWrapper
      mode={mode}
      component={component}
      sourceParentId={sourceParentId}
      sourceSlot={sourceSlot}
      className='w-full'
    >
      {!templateComponent ? (
        isEditor ? (
          <DropZone
            sourceParentId={component.id}
            sourceSlot={0}
            className='min-h-48 w-full'
          >
            <div className='flex items-center justify-center p-6 text-xs text-zinc-500'>
              Drop a Product Card here to use as the repeated item template
            </div>
          </DropZone>
        ) : null
      ) : (
        <div>
          <div
            style={gridStyle}
            className={cn(
              'grid w-full',
              'grid-cols-(--rep-cols-mobile) md:grid-cols-(--rep-cols-tablet) lg:grid-cols-(--rep-cols-desktop)',
              'gap-(--rep-gap-mobile) md:gap-(--rep-gap-tablet) lg:gap-(--rep-gap-desktop)',
            )}
          >
            {items.map((item, index) => {
              const isMasterSlot = isEditor && index === 0;

              // Clone instances get a unique synthetic ID so CanvasSelectionOverlay
              // only ever targets the Master Template at index 0.
              const instanceComponent: FlattenComponent = isMasterSlot
                ? templateComponent
                : {
                    ...templateComponent,
                    id: `${templateComponent.id}--item-${item.id}-${index}`,
                  };
              return (
                <RepeaterItemContextProvider
                  key={`${item.id}-${index}`}
                  value={{ item, index }}
                >
                  <div
                    className={cn(
                      'min-w-0',
                      isEditor &&
                        !isMasterSlot &&
                        'pointer-events-none opacity-80',
                    )}
                  >
                    <NodeRenderer
                      component={instanceComponent}
                      sourceParentId={component.id}
                      sourceSlot={0}
                      mode={mode}
                    />
                  </div>
                </RepeaterItemContextProvider>
              );
            })}
          </div>
          {/* Pagination controls (only when layout === 'pagination' and > 1 page) */}
          {config.layout === 'pagination' && totalPages > 1 && (
            <div className='flex items-center justify-center gap-2'>
              <button
                type='button'
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className='rounded-md border border-zinc-200 px-3 py-1.5 text-xs disabled:opacity-40'
              >
                Previous
              </button>
              <span className='text-xs text-zinc-600'>
                Page {page} of {totalPages}
              </span>
              <button
                type='button'
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className='rounded-md border border-zinc-200 px-3 py-1.5 text-xs disabled:opacity-40'
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </CanvasNodeWrapper>
  );
};

export default CollectionGridComponent;
