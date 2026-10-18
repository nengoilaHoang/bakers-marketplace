// components/layout/VendorShellLayout.tsx
import VendorContextProvider from '@/hooks/storefront/VendorContextProvider';
import React from 'react';
import VendorGuard from './VendorGuard';

const VendorScope = ({ children }: { children: React.ReactNode }) => {
  return (
    <VendorGuard>
      <VendorContextProvider>{children}</VendorContextProvider>
    </VendorGuard>
  );
};

export default VendorScope;
