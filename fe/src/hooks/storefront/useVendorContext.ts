import { useContext } from 'react';
import VendorContext, { VendorContextValue } from './VendorContext';

const useVendorContext = (): VendorContextValue => {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error(
      'useVendorContext must be used within a VendorContextProvider',
    );
  }
  return context;
};

export default useVendorContext;
