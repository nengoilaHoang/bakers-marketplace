import StorefrontEditLayout from '@/components/layout/StorefrontEditLayout';
import VendorScope from '@/components/layout/VendorScope';
import StorefrontEditor from '@/components/storefront/StorefrontEditor';
import useVendorContext from '@/hooks/storefront/useVendorContext';
import { NextPageWithLayout } from '@/pages/_app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const ReleaseEditorContainer = ({ releaseId }: { releaseId: string }) => {
  const { currentRelease, setCurrentReleaseId } = useVendorContext();

  useEffect(() => {
    if (releaseId) {
      setCurrentReleaseId(releaseId);
    }
  }, [releaseId, setCurrentReleaseId]);

  // Show a loading indicator instead of returning null
  if (currentRelease?.id !== releaseId) return null;

  return <StorefrontEditor release={currentRelease} />;
};

const StorefrontReleaseEditPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { storefront } = useVendorContext();
  const releaseId =
    typeof router.query.id === 'string' ? router.query.id : null;

  if (!releaseId) return null;

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
        <ReleaseEditorContainer releaseId={releaseId} />
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
