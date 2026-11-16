import StorefrontEditLayout from '@/components/layout/StorefrontEditLayout';
import VendorScope from '@/components/layout/VendorScope';
import StorefrontEditor from '@/components/storefront/StorefrontEditor';
import { LayoutState } from '@/hooks/storefront/useLayoutReducer';
import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';
import useVendorContext from '@/hooks/storefront/useVendorContext';
import { readString } from '@/hooks/useUrlFilters';
import { NextPageWithLayout } from '@/pages/_app';
import { StorefrontRelease } from '@/types/storefront';
import flattenLayout from '@/utils/flattenLayout';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';

function StorefrontReleaseEditorSession({
  release,
}: Readonly<{
  release: StorefrontRelease;
}>) {
  const { currentPageId } = useStorefrontCanvasContext();

  const [layoutStates, setLayoutStates] = useState<LayoutState[]>(() =>
    release.layouts.map((item) => {
      const flattened = flattenLayout(item.root);
      return {
        id: item.id,
        type: item.type,
        name: item.name.toLowerCase(),
        rootId: item.root.id,
        components: Object.fromEntries(flattened.map((c) => [c.id, c])),
        removedComponents: new Set<string>(),
        newComponents: new Set<string>(),
        dirtyComponents: new Set<string>(),
      };
    }),
  );

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
        : prev.map((item) => (item.id === nextLayout.id ? nextLayout : item)),
    );
  }, []);

  return (
    <div className='size-full flex flex-col flex-1 min-h-0'>
      <div className='relative bg-zinc-50 size-full flex-1 min-h-0 flex flex-col'>
        <StorefrontEditor
          key={release.id}
          layoutState={layout}
          themeSettings={release.themeSettings}
          updateLayout={updateLayout}
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
