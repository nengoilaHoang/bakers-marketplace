import type { Brand } from '@/types/brand';
import type { PageLayout } from '@/types/page-layout';
import type { FlattenComponent } from '@/utils/flattenLayout';
import { createContext } from 'react';

export type StorefrontRenderContextValue = {
  brand: Brand;
  layouts: PageLayout[];
  rootId: string;
  components: Record<string, FlattenComponent>;
  basePath: string;
};

const StorefrontRenderContext =
  createContext<StorefrontRenderContextValue | null>(null);

export default StorefrontRenderContext;
