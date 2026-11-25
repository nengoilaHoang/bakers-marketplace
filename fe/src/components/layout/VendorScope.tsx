// components/layout/VendorShellLayout.tsx
import VendorStorefrontContextProvider from '@/hooks/storefront/VendorStorefrontContextProvider';
import React from 'react';
import VendorGuard from './VendorGuard';

const VendorScope = ({ children }: { children: React.ReactNode }) => {
  return (
    <VendorGuard>
      <VendorStorefrontContextProvider>
        {children}
      </VendorStorefrontContextProvider>
    </VendorGuard>
  );
};

export default VendorScope;
