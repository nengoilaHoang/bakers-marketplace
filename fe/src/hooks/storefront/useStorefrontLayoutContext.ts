// hooks/storefront/useStorefrontLayoutContext.ts
import { useContext } from 'react';
import StorefrontLayoutContext, {
	StorefrontLayoutContextValue,
} from './StorefrontLayoutContext';

export function useOptionalStorefrontLayoutContext(): StorefrontLayoutContextValue | null {
  return useContext(StorefrontLayoutContext);
}

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
