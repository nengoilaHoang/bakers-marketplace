import StorefrontEditLayout from '@/components/layout/StorefrontEditLayout';
import VendorShellLayout from '@/components/layout/VendorShellLayout';
import StorefrontEditor from '@/components/storefront/StorefrontEditor';
import useVendorContext from '@/hooks/storefront/useVendorContext';
import { NextPageWithLayout } from '@/pages/_app';
import { useRouter } from 'next/router';

import React from 'react';

const StorefrontReleaseEditPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { currentRelease } = useVendorContext();

  if (!router.isReady || !currentRelease) return null;

  return (
    <div className='size-full flex flex-col flex-1 min-h-0'>
      <div className='relative bg-zinc-50 size-full flex-1 min-h-0 flex flex-col'>
        <StorefrontEditor release={currentRelease} />
      </div>
    </div>
  );
};

StorefrontReleaseEditPage.getLayout = function getLayout(
  page: React.ReactElement,
) {
  return (
    <VendorShellLayout>
      <StorefrontEditLayout>{page}</StorefrontEditLayout>
    </VendorShellLayout>
  );
};

export default StorefrontReleaseEditPage;
