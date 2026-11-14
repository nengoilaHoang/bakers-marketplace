import { ApiError } from '@/lib/api';
import {
	getStorefrontActiveRelease,
	getStorefrontRelease,
} from '@/services/storefront';
import { StorefrontRelease } from '@/types/storefront';
import { useEffect, useState } from 'react';

const useStorefront = (storeId: string, releaseId?: string) => {
  const [release, setRelease] = useState<StorefrontRelease | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadStorefront = async () => {
      let data: StorefrontRelease;
      if (!releaseId) {
        data = await getStorefrontActiveRelease(storeId, controller.signal);
      } else {
        data = await getStorefrontRelease(releaseId, controller.signal);
      }
      try {
        if (data) {
          setRelease(() => data);
        } else {
          setRelease(() => null);
        }
      } catch (err) {
        const isAbortError =
          err instanceof DOMException && err.name === 'AbortError';
        if (isAbortError || controller.signal.aborted) return;
        if (err instanceof ApiError) {
          console.error(
            'Error loading storefront:',
            err.message,
            'Status code:',
            err.status,
          );
        } else if (err instanceof Error) {
          console.error('Error loading storefront:', err.message);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      void loadStorefront();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [storeId, releaseId]);

  const isLoading = release === null;
  return { release, setRelease, isLoading };
};

export default useStorefront;
