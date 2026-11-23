import { Product } from '@/types/product';
import { createContext, useContext } from 'react';

type RepeaterItemContextValue = {
  item: Product;
  index: number;
};

const RepeaterItemContext = createContext<RepeaterItemContextValue | null>(
  null,
);

export const RepeaterItemContextProvider = RepeaterItemContext.Provider;

export function useRepeaterItem() {
  const context = useContext(RepeaterItemContext);
  if (!context) {
    throw new Error(
      'useRepeaterItem must be used within a RepeaterItemProvider',
    );
  }
  return context;
}

export function useOptionalRepeaterItem() {
  return useContext(RepeaterItemContext);
}
