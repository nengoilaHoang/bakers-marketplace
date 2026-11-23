import { ApiError } from '@/lib/api';
import { getCollectionProducts } from '@/services/collections';
import { getProducts, Product } from '@/services/products';
import { useEffect, useState } from 'react';

type useFetchStorefrontProductsProps = {
  filters?: {
    tag?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
    inStockOnly?: boolean;
  };
  limit?: number;
  page?: number;
  collectionSlug?: string;
};

const useFetchStorefrontProducts = ({
  filters,
  limit = 10,
  page = 1,
  collectionSlug,
}: useFetchStorefrontProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchProducts = async () => {
      try {
        setIsFetching(true);
        const { data } = collectionSlug
          ? await getCollectionProducts(
              collectionSlug,
              filters,
              limit,
              page,
              controller.signal,
            )
          : await getProducts(filters, limit, page, controller.signal);

        setProducts(data);
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
    return () => clearTimeout(requestTimer);
  }, [collectionSlug, filters, limit, page]);

  return {
    products,
    isFetching,
    error,
  };
};

export default useFetchStorefrontProducts;
