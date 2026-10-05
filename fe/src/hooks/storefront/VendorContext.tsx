import { Storefront, StorefrontReleaseWithLayout } from '@/types/storefront';
import { createContext } from 'react';

export type VendorContextValueType = {
  storefronts: Storefront[];
  currentStorefront: Storefront | null;
  setCurrentStorefrontId: (storefrontId: string) => void;
  currentRelease: StorefrontReleaseWithLayout | null;
  setCurrentReleaseId: (releaseId: string) => void;
};

const VendorContext = createContext<VendorContextValueType | null>(null);
export default VendorContext;
