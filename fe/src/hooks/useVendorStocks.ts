import { useCallback, useEffect, useState } from 'react';

import { getMyProducts } from '@/services/products';
import type { Product } from '@/types/product';

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'Không thể tải tồn kho. Vui lòng thử lại.';
}

// Sản phẩm (kèm tồn kho + mốc cảnh báo) của vendor đang đăng nhập.
export function useVendorStocks() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await getMyProducts({ signal: controller.signal });

        if (!controller.signal.aborted) {
          setProducts(response.data);
          setError(null);
        }
      } catch (requestError) {
        if (!controller.signal.aborted) setError(getErrorMessage(requestError));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    // Để StrictMode chạy xong vòng effect của môi trường dev trước khi gọi API.
    const requestTimer = window.setTimeout(() => void loadProducts(), 0);

    return () => {
      window.clearTimeout(requestTimer);
      controller.abort();
    };
  }, [attempt]);

  // Tải lại ngầm (không hiện trạng thái đang tải), dùng sau khi điều chỉnh tồn kho.
  const reload = useCallback(() => setAttempt((current) => current + 1), []);

  return { products, isLoading, error, reload };
}
