import { CollectionDataSource } from '@/types/layout-component/repeater-component';
import type { Product } from '@/types/product';
import { useMemo } from 'react';
import { useOptionalStorefrontRenderContext } from './storefront/useStorefrontRenderContext';
import useFetchStorefrontProducts from './useFetchStorefrontProduct';

const MOCK_PRODUCTS: Product[] = Array.from({ length: 8 }, (_, i) => ({
  id: `mock-product-${i + 1}`,
  brandId: 'mock-brand-1',
  vendorId: null,
  title: `Sample Bakery Item ${i + 1}`,
  description: 'Freshly baked daily',
  slug: `#`,
  unitPrice: 45000 + i * 5000,
  unitCost: 25000 + i * 2500,
  currency: 'VND',
  unit: 'cái',
  expirationDate: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  media: [
    {
      id: `mock-image-${i + 1}`,
      displayName: `Sample Bakery Item ${i + 1}`,
      originalName: `sample-bakery-${i + 1}.jpg`,
      url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80',
      contentType: 'image/jpeg',
      extName: 'jpg',
      size: null,
      checksum: null,
      uploadedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      width: 600,
      height: 400,
    },
  ],
  notes: [],
  tags: [],
  stock: null,
  collections: [],
}));

type UseCollectionDataSourceProps = {
  dataSource: CollectionDataSource;
  limit?: number;
  page?: number;
  isEditor?: boolean;
};

const useCollectionDataSource = ({
  dataSource,
  limit = 0,
  page = 1,
  isEditor = false,
}: UseCollectionDataSourceProps) => {
  const renderCtx = useOptionalStorefrontRenderContext();
  const pageContext = renderCtx?.pageContext;

  const isMockMode = isEditor || dataSource.type === 'preset';

  // Build fetch params unconditionally so useFetchStorefrontProducts is always called in the same order
  const fetchParams = useMemo(() => {
    if (isMockMode) return null;

    switch (dataSource.type) {
      case 'route':
        if (
          dataSource.mode === 'route_query' &&
          pageContext?.kind === 'products_query'
        ) {
          return { filters: renderCtx?.query, limit, page };
        }
        return null;

      case 'collection':
        return {
          collectionSlug: dataSource.collectionSlug,
          limit,
          page,
        };

      case 'query': {
        const { type: _type, ...filters } = dataSource;
        return { filters, limit, page };
      }

      default:
        return {};
    }
  }, [
    isMockMode,
    dataSource,
    pageContext?.kind,
    renderCtx?.query,
    limit,
    page,
  ]);

  // If your fetch hook supports an `enabled` option, pass `enabled: Boolean(fetchParams)`.
  // Otherwise, pass `fetchParams` so it stays unconditional.
  const {
    products: fetchedProducts,
    isFetching,
    error,
  } = useFetchStorefrontProducts(
    fetchParams ?? { filters: undefined, limit: undefined, page: undefined },
  );

  const products = useMemo(() => {
    if (isMockMode) {
      return MOCK_PRODUCTS.slice(0, limit);
    }
    if (!fetchParams) {
      return [];
    }
    return fetchedProducts ?? [];
  }, [isMockMode, limit, fetchParams, fetchedProducts]);

  return {
    products,
    isLoading: isMockMode ? false : isFetching,
    error: isMockMode ? null : error,
  };
};

export default useCollectionDataSource;
