import { Storefront, StorefrontRelease } from '@/types/storefront';
import { createContext } from 'react';

export type VendorContextValue = {
  storefront: Storefront | null;
  currentRelease: StorefrontRelease | null;
  setCurrentReleaseId: (releaseId: string) => void;
};

const VendorContext = createContext<VendorContextValue | null>(null);
export default VendorContext;
