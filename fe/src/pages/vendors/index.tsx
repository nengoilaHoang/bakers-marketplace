import VendorLayout from '@/components/layout/VendorLayout';
import { NextPageWithLayout } from '../_app';

const VendorPage: NextPageWithLayout = () => {
  return <></>;
};

VendorPage.getLayout = function getLayout(page: React.ReactElement) {
  return <VendorLayout>{page}</VendorLayout>;
};

export default VendorPage;
