import StorefrontEditLayout from '@/components/layout/StorefrontEditLayout';
import VendorScope from '@/components/layout/VendorScope';
import StorefrontEditor from '@/components/storefront/StorefrontEditor';
import { LayoutState } from '@/hooks/storefront/useLayoutReducer';
import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';
import useVendorStorefrontContext from '@/hooks/storefront/useVendorStorefrontContext';
import { readString } from '@/hooks/useUrlFilters';
import { NextPageWithLayout } from '@/pages/_app';
import { PageLayout } from '@/types/page-layout';
import { StorefrontRelease } from '@/types/storefront';
import flattenLayout from '@/utils/flattenLayout';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
  const { revalidateLayouts } = useVendorStorefrontContext();

  const [revision, setRevision] = useState(0);

  // Recalculate layoutStates whenever release.layouts is replaced by revalidateLayouts()
  const layoutStates = useMemo(
    () => release.layouts.map((item) => buildLayoutState(item, revision)),
    [release.layouts, revision],
  );

  const layout = useMemo<LayoutState | undefined>(() => {
    if (layoutStates.length === 0) return undefined;
    return (
      layoutStates.find((item) => item.id === currentPageId) ??
      layoutStates.find((item) => item.type === 'HOME') ??
      layoutStates[0]
    );
  }, [currentPageId, layoutStates]);

  const handleSaved = useCallback(async () => {
    selectComponent(null);
    await revalidateLayouts();
    setRevision((r) => r + 1);
  }, [revalidateLayouts, selectComponent]);

  return (
    <div className='size-full flex flex-col flex-1 min-h-0'>
      <div className='relative bg-zinc-50 size-full flex-1 min-h-0 flex flex-col'>
        <StorefrontEditor
          layoutState={layout}
          themeSettings={release.themeSettings}
          onSaved={handleSaved}
        />
      </div>
    </div>
  );
}

const StorefrontReleaseEditPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { storefront, currentRelease, setCurrentReleaseId } =
    useVendorStorefrontContext();
  const { setCurrentPageId } = useStorefrontCanvasContext();
  const { isReady, pathname, query, replace } = router;
  const releaseId = readString(query.id);
  const pageSlug = readString(query.page);

  useEffect(() => {
    if (releaseId) {
      setCurrentReleaseId(releaseId);
    }
  }, [releaseId, setCurrentReleaseId]);

  useEffect(() => {
    if (!currentRelease || currentRelease.layouts.length === 0) return;

    if (!pageSlug) {
      const defaultLayout =
        currentRelease.layouts.find((l) => l.type === 'HOME') ??
        currentRelease.layouts[0];
      void replace(
        {
          pathname,
          query: { ...query, page: defaultLayout.slug },
        },
        undefined,
        { shallow: true },
      );
    } else {
      const pageId = currentRelease.layouts.find(
        (item) => item.slug === pageSlug,
      )?.id;
      if (pageId) {
        setCurrentPageId(pageId);
      }
    }
  }, [currentRelease, pageSlug, pathname, query, replace, setCurrentPageId]);

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
