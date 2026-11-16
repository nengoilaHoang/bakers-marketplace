// hooks/storefront/StorefrontRenderContext.ts
import type { BrandPublicView } from '@/types/brand';
import type { PageLayout, PageLayoutType } from '@/types/page-layout';
import type { FlattenComponent } from '@/utils/flattenLayout';
import { createContext } from 'react';

export type StorefrontNavPage = {
  id: string;
  name: string;
  slug: string;
  type: PageLayoutType;
};

export type StorefrontRenderContextValue = {
  brand: BrandPublicView;
  layout: PageLayout;
  rootId: string;
  components: Record<string, FlattenComponent>;
  basePath: string;
  routeParams?: Record<string, string>;
  navPages?: StorefrontNavPage[];
};

const StorefrontRenderContext =
  createContext<StorefrontRenderContextValue | null>(null);

export default StorefrontRenderContext;
