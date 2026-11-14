import { Storefront, StorefrontRelease } from '@/types/storefront';
import { createContext } from 'react';

export type VendorContextValue = {
  storefront: Storefront | null;
  setStorefront: (storefront: Storefront | null) => void;
  currentRelease: StorefrontRelease | null;
  setCurrentReleaseId: (releaseId: string | null) => void;
};

const VendorContext = createContext<VendorContextValue | null>(null);
export default VendorContext;
