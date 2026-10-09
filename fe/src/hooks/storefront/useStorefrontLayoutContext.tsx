import { useContext } from 'react';
import StorefrontLayoutContext from './StorefrontLayoutContext';

const useStorefrontLayoutContext = () => {
  const context = useContext(StorefrontLayoutContext);
  if (!context) {
    throw new Error(
      'useStorefrontContext must be used within a StorefrontProvider',
    );
  }

  return context;
};

export default useStorefrontLayoutContext;
