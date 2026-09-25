import VendorLayout from '@/components/layout/VendorLayout';
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
  return <VendorLayout>{page}</VendorLayout>;
};

export default StorefrontPage;
