import StorefrontEditLayout from '@/components/layout/StorefrontEditLayout';
import VendorScope from '@/components/layout/VendorScope';
import StorefrontEditor from '@/components/storefront/StorefrontEditor';
import { LayoutState } from '@/hooks/storefront/useLayoutReducer';
import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';
import useVendorContext from '@/hooks/storefront/useVendorContext';
import { readString } from '@/hooks/useUrlFilters';
import { NextPageWithLayout } from '@/pages/_app';
import { PageLayout } from '@/types/page-layout';
import { StorefrontRelease } from '@/types/storefront';
import flattenLayout from '@/utils/flattenLayout';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function buildLayoutState(layout: PageLayout, revision: number): LayoutState {
  const flatComponents = flattenLayout(layout.root);

  return {
    id: layout.id,
    type: layout.type,
    rootId: layout.root.id,
    components: Object.fromEntries(flatComponents.map((c) => [c.id, c])),
    newComponents: new Set(),
    dirtyComponents: new Set(),
    removedComponents: new Set(),
    revision,
  };
}

function StorefrontReleaseEditorSession({
  release,
}: Readonly<{
  release: StorefrontRelease;
}>) {
  const { currentPageId, selectComponent } = useStorefrontCanvasContext();
  const { revalidateLayouts } = useVendorContext();

  const [layoutStates, setLayoutStates] = useState<LayoutState[]>(() =>
    release.layouts.map((item) => buildLayoutState(item, 0)),
  );

  // Recalculate layoutStates whenever release.layouts is replaced by revalidateLayouts()
  const prevLayoutsRef = useRef(release.layouts);
  useEffect(() => {
    if (prevLayoutsRef.current === release.layouts) return;
    prevLayoutsRef.current = release.layouts;

    setLayoutStates((prev) =>
      release.layouts.map((item) => {
        const existing = prev.find((state) => state.id === item.id);
        const nextRevision = (existing?.revision ?? -1) + 1;
        return buildLayoutState(item, nextRevision);
      }),
    );
  }, [release.layouts]);

  const layout = useMemo<LayoutState | undefined>(() => {
    if (layoutStates.length === 0) return undefined;
    return (
      layoutStates.find((item) => item.id === currentPageId) ??
      layoutStates.find((item) => item.type === 'HOME') ??
      layoutStates[0]
    );
  }, [currentPageId, layoutStates]);

  const updateLayout = useCallback((nextLayout: LayoutState) => {
    setLayoutStates((prev) =>
      prev.some((item) => item.id === nextLayout.id && item === nextLayout)
        ? prev
        : prev.map((item) =>
            item.id === nextLayout.id
              ? { ...nextLayout, revision: item.revision }
              : item,
          ),
    );
  }, []);

  const handleSaved = useCallback(async () => {
    selectComponent(null);
    await revalidateLayouts();
  }, [revalidateLayouts, selectComponent]);

  return (
    <div className='size-full flex flex-col flex-1 min-h-0'>
      <div className='relative bg-zinc-50 size-full flex-1 min-h-0 flex flex-col'>
        <StorefrontEditor
          layoutState={layout}
          themeSettings={release.themeSettings}
          updateLayout={updateLayout}
          onSaved={handleSaved}
        />
      </div>
    </div>
  );
}

const StorefrontReleaseEditPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { storefront, currentRelease, setCurrentReleaseId } =
    useVendorContext();
  const { setCurrentPageId } = useStorefrontCanvasContext();
  const { isReady, pathname, query, replace } = router;
  const releaseId = readString(query.id);
  const pageName = readString(query.page);

  useEffect(() => {
    if (releaseId) {
      setCurrentReleaseId(releaseId);
    }
  }, [releaseId, setCurrentReleaseId]);

  useEffect(() => {
    if (!currentRelease || currentRelease.layouts.length === 0) return;

    if (!pageName) {
      const defaultLayout =
        currentRelease.layouts.find((l) => l.type === 'HOME') ??
        currentRelease.layouts[0];
      void replace(
        {
          pathname,
          query: { ...query, page: defaultLayout.name.toLowerCase() },
        },
        undefined,
        { shallow: true },
      );
    } else {
      const pageId = currentRelease.layouts.find(
        (item) => item.name.toLowerCase() === pageName.toLowerCase(),
      )?.id;
      if (pageId) {
        setCurrentPageId(pageId);
      }
    }
  }, [currentRelease, pageName, pathname, query, replace, setCurrentPageId]);

  if (
    !isReady ||
    !releaseId ||
    !storefront ||
    currentRelease?.id !== releaseId
  ) {
    return (
      <div className='flex size-full flex-1 items-center justify-center text-body-sm text-zinc-400'>
        Đang khởi tạo trình chỉnh sửa...
      </div>
    );
  }

  return (
    <StorefrontReleaseEditorSession
      key={currentRelease.id}
      release={currentRelease}
    />
  );
};

StorefrontReleaseEditPage.getLayout = function getLayout(
  page: React.ReactElement,
) {
  return (
    <VendorScope>
      <StorefrontEditLayout>{page}</StorefrontEditLayout>
    </VendorScope>
  );
};

export default StorefrontReleaseEditPage;
