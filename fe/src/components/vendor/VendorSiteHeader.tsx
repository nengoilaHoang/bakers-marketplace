import { useRouter } from 'next/router';
import ReleaseSelect from '../storefront/ReleaseSelect';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

const VendorSiteHeader = () => {
  const router = useRouter();
  const { pathname } = router;
  const isStorefront = pathname.startsWith('/vendors/storefronts');
  return <DashboardHeader actions={isStorefront && <ReleaseSelect />} />;
};

export default VendorSiteHeader;
