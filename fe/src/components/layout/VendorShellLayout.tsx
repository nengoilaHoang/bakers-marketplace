// components/layout/VendorShellLayout.tsx
import VendorContextProvider from '@/hooks/storefront/VendorContextProvider';
import React from 'react';
import VendorGuard from './VendorGuard';

const VendorShellLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <VendorGuard>
      <VendorContextProvider>{children}</VendorContextProvider>
    </VendorGuard>
  );
};

export default VendorShellLayout;
