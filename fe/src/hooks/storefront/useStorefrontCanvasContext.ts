import { useContext } from 'react';
import StorefrontCanvasContext, {
	StorefrontCanvasContextValue,
} from './StorefrontCanvasContext';

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
