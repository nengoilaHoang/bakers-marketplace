import StorefrontEditLayout from '@/components/layout/StorefrontEditLayout';
import StorefrontEditor from '@/components/storefront/StorefrontEditor';
import { NextPageWithLayout } from '@/pages/_app';
import { useRouter } from 'next/router';
import React from 'react';

const StorefrontReleasePage: NextPageWithLayout = () => {
  const router = useRouter();

  if (!router.isReady) {
    return (
      <div className='flex h-64 items-center justify-center text-sm text-zinc-500'>
        Loading editor...
      </div>
    );
  }

  const storeId = '44444444-4444-4444-8444-444444444444';
  const releaseId = '55555555-5555-4555-8555-555555555555';

  return (
    <div className='size-full flex flex-col flex-1 min-h-0'>
      <div className='relative bg-zinc-50 size-full flex-1 min-h-0 flex flex-col'>
        <StorefrontEditor storeId={storeId} releaseId={undefined} />
      </div>
    </div>
  );
};

StorefrontReleasePage.getLayout = function getLayout(page: React.ReactElement) {
  return <StorefrontEditLayout>{page}</StorefrontEditLayout>;
};

export default StorefrontReleasePage;
