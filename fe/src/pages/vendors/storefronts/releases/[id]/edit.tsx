import StorefrontEditLayout from '@/components/layout/StorefrontEditLayout';
import VendorScope from '@/components/layout/VendorScope';
import StorefrontEditor from '@/components/storefront/StorefrontEditor';
import useVendorContext from '@/hooks/storefront/useVendorContext';
import { readString } from '@/hooks/useUrlFilters';
import { NextPageWithLayout } from '@/pages/_app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const StorefrontReleaseEditPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { storefront, currentRelease, setCurrentReleaseId } =
    useVendorContext();
  const { isReady, pathname, query, replace } = router;
  const releaseId = readString(query.id);
  const pageName = readString(query.page);

  useEffect(() => {
    if (releaseId) {
      setCurrentReleaseId(releaseId);
    }
  }, [releaseId, setCurrentReleaseId]);

  useEffect(() => {
    if (!currentRelease) return;
    if (!pageName) {
      // The default page is home
      const nextPage = (
        currentRelease.layouts.find((l) => l.type === 'HOME') ??
        currentRelease.layouts[0]
      ).name.toLowerCase();
      console.log(nextPage);
      void replace(
        {
          pathname,
          query: { ...router.query, page: nextPage },
        },
        undefined,
        { shallow: true },
      );
    }
  }, [currentRelease, pageName, pathname, replace, router]);

  if (!isReady || !releaseId || currentRelease?.id !== releaseId) return null;

  if (!router.isReady || !storefront) {
    return (
      <div className='flex size-full flex-1 items-center justify-center text-body-sm text-zinc-400'>
        Đang khởi tạo trình chỉnh sửa...
      </div>
    );
  }

  return (
    <div className='size-full flex flex-col flex-1 min-h-0'>
      <div className='relative bg-zinc-50 size-full flex-1 min-h-0 flex flex-col'>
        <StorefrontEditor
          key={releaseId}
          release={currentRelease}
          pageName={pageName}
        />
      </div>
    </div>
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
