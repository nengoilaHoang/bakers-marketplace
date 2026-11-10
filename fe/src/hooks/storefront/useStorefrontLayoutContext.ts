import { useContext } from 'react';
import StorefrontLayoutContext, {
	StorefrontLayoutContextValue,
} from './StorefrontLayoutContext';

const useStorefrontLayoutContext = (): StorefrontLayoutContextValue => {
  const context = useContext(StorefrontLayoutContext);
  if (!context) {
    throw new Error(
      'useStorefrontContext must be used within a StorefrontProvider',
    );
  }

  return context;
};

export default useStorefrontLayoutContext;
