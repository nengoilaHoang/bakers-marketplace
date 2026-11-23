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

export type StorefrontPageContext =
  | { kind: 'home' }
  | { kind: 'collection'; collectionSlug: string }
  | { kind: 'products_query' }
  | { kind: 'product'; productSlug: string }
  | { kind: 'custom' };

export type StorefrontRenderContextValue = {
  brand: BrandPublicView;
  layout: PageLayout;
  rootId: string;
  components: Record<string, FlattenComponent>;
  basePath: string;
  pageContext?: StorefrontPageContext;
  query?: Record<string, string | string[] | undefined>;
  navPages?: StorefrontNavPage[];
};

const StorefrontRenderContext =
  createContext<StorefrontRenderContextValue | null>(null);

export default StorefrontRenderContext;
