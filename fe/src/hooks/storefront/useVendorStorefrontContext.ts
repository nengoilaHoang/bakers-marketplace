import { useContext } from 'react';
import VendorStorefrontContext, {
	VendorStorefrontContextValue,
} from './VendorStorefrontContext';

const useVendorStorefrontContext = (): VendorStorefrontContextValue => {
  const context = useContext(VendorStorefrontContext);
  if (!context) {
    throw new Error(
      'useVendorStorefrontContext must be used within a VendorStorefrontContextProvider',
    );
  }
  return context;
};

export default useVendorStorefrontContext;
