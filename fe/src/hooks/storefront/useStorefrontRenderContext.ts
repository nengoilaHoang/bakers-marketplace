import { useContext } from 'react';
import type { StorefrontRenderContextValue } from './StorefrontRenderContext';
import StorefrontRenderContext from './StorefrontRenderContext';

export function useStorefrontRenderContext(): StorefrontRenderContextValue {
  const context = useContext(StorefrontRenderContext);
  if (!context) {
    throw new Error(
      'useStorefrontRenderContext must be used within a StorefrontRenderProvider',
    );
  }
  return context;
}

export function useOptionalStorefrontRenderContext(): StorefrontRenderContextValue | null {
  return useContext(StorefrontRenderContext);
}

export default useStorefrontRenderContext;
