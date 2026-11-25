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
import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  const isPagination = config.layout === 'pagination';

  const [page, setPage] = useState(1);
  const [cursorsByPage, setCursorsByPage] = useState<Map<number, string>>(
    () => new Map([[1, '']]),
  );
  const [productsByPage, setProductsByPage] = useState<Map<number, Product[]>>(
    new Map(),
  );

  const cursor = cursorsByPage.get(page) ?? '';

  const {
    products: items,
    hasNextPage,
    nextCursor,
    fetchedPage,
    isLoading,
  } = useCollectionDataSource({
    dataSource: config.dataSource,
    limit: 'pageSize' in config ? config.pageSize : 20,
    page,
    cursor,
    isEditor,
  });

  // Store fetched items and next cursor only when the fetch for the current page completes
  useEffect(() => {
    if (!items.length || isLoading || fetchedPage !== page) return;
    queueMicrotask(() => {
      setProductsByPage((current) => {
        const updated = new Map(current);
        updated.set(page, items);
        return updated;
      });
      if (nextCursor) {
        setCursorsByPage((current) => {
          if (current.get(page + 1) === nextCursor) return current;
          const updated = new Map(current);
          updated.set(page + 1, nextCursor);
          return updated;
        });
      }
    });
  }, [fetchedPage, isLoading, items, nextCursor, page]);

  const displayedProducts = useMemo(() => {
    if (isPagination) {
      return productsByPage.get(page) ?? [];
    }
    return Array.from(productsByPage.values()).flat();
  }, [isPagination, page, productsByPage]);

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

  const emptyTemplateContent = isEditor ? (
    <DropZone
      sourceParentId={component.id}
      sourceSlot={0}
      className='min-h-48 w-full'
    >
      <div className='flex items-center justify-center p-6 text-xs text-zinc-500'>
        Drop a Product Card here to use as the repeated item template
      </div>
    </DropZone>
  ) : null;

  let gridContent = emptyTemplateContent;
  if (templateComponent) {
    gridContent = isPagination ? (
      <PaginationCollectionGridComponent
        templateComponent={templateComponent}
        sourceParentId={component.id}
        mode={mode}
        page={page}
        setPage={setPage}
        items={displayedProducts}
        hasNextPage={hasNextPage}
        isLoading={isLoading}
        gridStyle={gridStyle}
      />
    ) : (
      <InfiniteScrollCollectionGridComponent
        templateComponent={templateComponent}
        sourceParentId={component.id}
        mode={mode}
        page={page}
        setPage={setPage}
        items={displayedProducts}
        hasNextPage={hasNextPage}
        isLoading={isLoading}
        gridStyle={gridStyle}
      />
    );
  }

  return (
    <CanvasNodeWrapper
      mode={mode}
      component={component}
      sourceParentId={sourceParentId}
      sourceSlot={sourceSlot}
      className='w-full'
    >
      {gridContent}
    </CanvasNodeWrapper>
  );
};

type ProductGridItemsProps = {
  templateComponent: FlattenComponent;
  sourceParentId?: string;
  mode: NodeRendererMode;
  items: Product[];
  gridStyle: CSSProperties;
};

const ProductGridItems = ({
  templateComponent,
  sourceParentId,
  mode,
  items,
  gridStyle,
}: ProductGridItemsProps) => {
  const isEditor = mode === NodeRendererMode.Editor;

  return (
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
                isEditor && !isMasterSlot && 'pointer-events-none opacity-80',
              )}
            >
              <NodeRenderer
                component={instanceComponent}
                sourceParentId={sourceParentId}
                sourceSlot={0}
                mode={mode}
              />
            </div>
          </RepeaterItemContextProvider>
        );
      })}
    </div>
  );
};

type CollectionGridModeProps = {
  templateComponent: FlattenComponent;
  sourceParentId?: string;
  mode: NodeRendererMode;
  page: number;
  setPage: (page: number) => void;
  items: Product[];
  hasNextPage: boolean;
  isLoading: boolean;
  gridStyle: CSSProperties;
};

const PaginationCollectionGridComponent = ({
  templateComponent,
  sourceParentId,
  mode,
  page,
  setPage,
  items,
  hasNextPage,
  isLoading,
  gridStyle,
}: CollectionGridModeProps) => {
  const isEditor = mode === NodeRendererMode.Editor;

  const handleClickCapture = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isEditor) return;

      const isMod = e.ctrlKey || e.metaKey || e.altKey;
      if (!isMod) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [isEditor],
  );

  return (
    <>
      <ProductGridItems
        templateComponent={templateComponent}
        sourceParentId={sourceParentId}
        mode={mode}
        items={items}
        gridStyle={gridStyle}
      />

      {(page > 1 || hasNextPage) && (
        <div
          onClickCapture={handleClickCapture}
          className='mt-4 flex items-center justify-center gap-1.5'
        >
          {page > 1 && (
            <button
              type='button'
              disabled={isLoading}
              onClick={() => setPage(Math.max(1, page - 1))}
              className='rounded-md border border-zinc-200 px-3 py-1.5 text-xs hover:bg-zinc-50 disabled:opacity-40'
            >
              Previous
            </button>
          )}

          {Array.from(
            { length: hasNextPage ? page + 1 : page },
            (_, i) => i + 1,
          ).map((pageNum) => {
            if (
              pageNum === 1 ||
              page - 1 === pageNum ||
              page === pageNum ||
              pageNum === page + 1
            ) {
              return (
                <span key={pageNum} className='contents'>
                  <button
                    type='button'
                    disabled={isLoading}
                    onClick={() => setPage(pageNum)}
                    className={cn(
                      'min-w-8 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-40',
                      pageNum === page
                        ? 'bg-zinc-900 text-white'
                        : 'border border-zinc-200 text-zinc-700 hover:bg-zinc-50',
                    )}
                  >
                    {pageNum}
                  </button>
                  {pageNum === 1 && pageNum + 3 <= page && (
                    <span
                      aria-hidden='true'
                      className='px-1 text-xs text-zinc-400 select-none'
                    >
                      ...
                    </span>
                  )}
                </span>
              );
            }
            return null;
          })}

          {hasNextPage && (
            <button
              type='button'
              disabled={isLoading}
              onClick={() => setPage(page + 1)}
              className='rounded-md border border-zinc-200 px-3 py-1.5 text-xs hover:bg-zinc-50 disabled:opacity-40'
            >
              Next
            </button>
          )}
        </div>
      )}
    </>
  );
};

const InfiniteScrollCollectionGridComponent = ({
  templateComponent,
  sourceParentId,
  mode,
  page,
  setPage,
  items,
  hasNextPage,
  isLoading,
  gridStyle,
}: CollectionGridModeProps) => {
  const isEditor = mode === NodeRendererMode.Editor;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadNextPage = useCallback(() => {
    if (isLoading || !hasNextPage) return;
    setPage(page + 1);
  }, [hasNextPage, isLoading, page, setPage]);

  useEffect(() => {
    if (isEditor || isLoading || !hasNextPage) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadNextPage();
        }
      },
      {
        rootMargin: '0px 0px 200px 0px',
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isEditor, isLoading, loadNextPage]);

  return (
    <>
      <ProductGridItems
        templateComponent={templateComponent}
        sourceParentId={sourceParentId}
        mode={mode}
        items={items}
        gridStyle={gridStyle}
      />

      {!isEditor && hasNextPage && (
        <div ref={sentinelRef} className='h-1 w-full' aria-hidden='true' />
      )}
    </>
  );
};

export default CollectionGridComponent;
