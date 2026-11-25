import { useContext } from 'react';
import StorefrontCanvasContext, {
	StorefrontCanvasContextValue,
} from './StorefrontCanvasContext';

export function useOptionalStorefrontCanvasContext(): StorefrontCanvasContextValue | null {
  return useContext(StorefrontCanvasContext);
}

const useStorefrontCanvasContext = (): StorefrontCanvasContextValue => {
  const context = useContext(StorefrontCanvasContext);
  if (!context) {
    throw new Error(
      'useStorefrontCanvas must be used within a StorefrontCanvasProvider',
    );
  }
  return context;
};

export default useStorefrontCanvasContext;
