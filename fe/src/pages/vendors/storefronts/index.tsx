import VendorLayout from '@/components/layout/VendorLayout';
import VendorShellLayout from '@/components/layout/VendorShellLayout';
import { NextPageWithLayout } from '@/pages/_app';

const StorefrontPage: NextPageWithLayout = () => {
  return (
    <div className='grid min-h-screen grid-cols-[1fr_400px]'>
      <div>{/* Main content */}</div>
      <div className='border-l border-zinc-200'>
        <section id='color-palette'>Color Palette</section>
        <section id='typography'>Typography</section>
      </div>
    </div>
  );
};

StorefrontPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <VendorShellLayout>
      <VendorLayout>{page}</VendorLayout>
    </VendorShellLayout>
  );
};

export default StorefrontPage;
