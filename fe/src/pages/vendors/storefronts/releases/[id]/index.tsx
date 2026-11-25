import StorefrontEditLayout from '@/components/layout/StorefrontEditLayout';
import VendorScope from '@/components/layout/VendorScope';
import useVendorStorefrontContext from '@/hooks/storefront/useVendorStorefrontContext';
import { NextPageWithLayout } from '@/pages/_app';
import { useRouter } from 'next/router';

import React from 'react';

const StorefrontReleasePage: NextPageWithLayout = () => {
  const router = useRouter();
  const { currentRelease } = useVendorStorefrontContext();

  if (!router.isReady || !currentRelease) return null;

  return (
    <div className='size-full flex flex-col flex-1 min-h-0'>
      <div className='relative bg-zinc-50 size-full flex-1 min-h-0 flex flex-col'></div>
    </div>
  );
};

StorefrontReleasePage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <VendorScope>
      <StorefrontEditLayout>{page}</StorefrontEditLayout>
    </VendorScope>
  );
};

export default StorefrontReleasePage;
