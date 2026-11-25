import { ApiError } from '@/lib/api';
import { getStorefrontRelease } from '@/services/storefront';
import { StorefrontRelease } from '@/types/storefront';
import { useEffect, useState } from 'react';

const useStorefrontRelease = (releaseId: string) => {
  const [release, setRelease] = useState<StorefrontRelease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !release) return;

    const controller = new AbortController();
    const load = async () => {
      const data: StorefrontRelease = await getStorefrontRelease(
        releaseId,
        controller.signal,
      );

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
        if (err instanceof ApiError || err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      setLoading(true);
      void load();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [loading, release, releaseId]);

  return { release, loading, error };
};

export default useStorefrontRelease;
