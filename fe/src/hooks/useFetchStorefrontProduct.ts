import { ApiError } from '@/lib/api';
import {
	getProducts,
	PaginatedProducts,
	ProductFilters,
	ProductSort,
} from '@/services/products';
import { useEffect, useState } from 'react';

type useFetchStorefrontProductsProps = {
  filters?: ProductFilters;
  sort?: ProductSort;
  limit?: number;
  page?: number;
  cursor?: string;
};

type FetchedProductsState = PaginatedProducts & {
  fetchedPage: number | null;
};

const EMPTY_PAGINATED_PRODUCTS: FetchedProductsState = {
  items: [],
  nextCursor: null,
  hasNextPage: false,
  fetchedPage: null,
};

const CACHE_TTL_MS = 60_000;
const MAX_CACHE_ENTRIES = 50;

const productQueryCache = new Map<
  string,
  { data: FetchedProductsState; expiresAt: number }
>();

function buildCacheKey(props: useFetchStorefrontProductsProps): string {
  const { filters, sort = 'newest', limit = 10, page = 1, cursor = '' } = props;
  const sortedFilters = filters
    ? Object.keys(filters)
        .sort()
        .reduce<Record<string, unknown>>((acc, key) => {
          const val = filters[key as keyof ProductFilters];
          if (val !== undefined && val !== '') {
            acc[key] = Array.isArray(val) ? [...val].sort() : val;
          }
          return acc;
        }, {})
    : {};

  return JSON.stringify({
    filters: sortedFilters,
    sort,
    limit,
    page,
    cursor,
  });
}

const useFetchStorefrontProducts = (
  props: useFetchStorefrontProductsProps | null = {},
) => {
  const {
    filters,
    sort = 'newest',
    limit = 10,
    page = 1,
    cursor,
  } = props ?? {};
  const [data, setData] = useState<FetchedProductsState>(
    EMPTY_PAGINATED_PRODUCTS,
  );
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!props) return;

    const cacheKey = buildCacheKey({ filters, sort, limit, page, cursor });
    const cached = productQueryCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      queueMicrotask(() => setData(cached.data));
      return;
    }

    const controller = new AbortController();
    const fetchProducts = async () => {
      try {
        setIsFetching(true);
        const res = await getProducts(
          filters,
          sort,
          limit,
          page,
          cursor,
          controller.signal,
        );
        const nextData: FetchedProductsState = {
          ...res.data,
          fetchedPage: page,
        };
        if (productQueryCache.size >= MAX_CACHE_ENTRIES) {
          const oldestKey = productQueryCache.keys().next().value;
          if (oldestKey !== undefined) {
            productQueryCache.delete(oldestKey);
          }
        }
        productQueryCache.set(cacheKey, {
          data: nextData,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });
        setData(nextData);
      } catch (error) {
        if (
          controller.signal.aborted ||
          (error instanceof DOMException && error.name === 'AbortError') ||
          (error instanceof Error && error.name === 'AbortError')
        ) {
          return;
        }
        if (error instanceof ApiError || error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setIsFetching(false);
      }
    };

    const requestTimer = window.setTimeout(() => void fetchProducts(), 0);
    return () => {
      window.clearTimeout(requestTimer);
      controller.abort();
    };
  }, [cursor, filters, limit, page, props, sort]);

  return {
    products: data.items,
    nextCursor: data.nextCursor,
    hasNextPage: data.hasNextPage,
    fetchedPage: data.fetchedPage,
    isFetching,
    error,
  };
};

export default useFetchStorefrontProducts;
