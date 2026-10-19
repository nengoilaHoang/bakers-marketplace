import { useRouter } from 'next/router';
import ReleaseSelect from '../storefront/ReleaseSelect';
import AccountMenu from '../ui/AccountMenu';
import Logo from '../ui/Logo';

const VendorSiteHeader = () => {
  const router = useRouter();
  const { pathname } = router;
  const isStorefront = pathname.startsWith('/vendors/storefronts');
  return (
    <header className='relative z-20 bg-page shadow-header'>
      <div className='flex h-15 items-center justify-between gap-4 border-b border-line px-3 lg:px-4'>
        <div>
          <Logo size='md' />
        </div>

        <div className='flex flex-row-reverse items-center gap-1.5'>
          <div className='flex items-center h-full border-l pl-3 border-line'>
            <AccountMenu />
          </div>

          <div className='flex items-center me-3.5'>
            {isStorefront && <ReleaseSelect />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default VendorSiteHeader;
