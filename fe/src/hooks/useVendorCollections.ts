import { ApiError } from '@/lib/api';
import { getCollections } from '@/services/collections';
import type { Collection } from '@/types/collection';
import { useCallback, useEffect, useState } from 'react';

const useVendorCollections = (onlyActive = false) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadCollections = async () => {
      try {
        setIsLoading(true);
        const { data } = await getCollections(onlyActive, controller.signal);
        if (!controller.signal.aborted) {
          setCollections(data);
          setError(null);
        }
      } catch (err) {
        const isAbortError =
          err instanceof DOMException && err.name === 'AbortError';
        if (isAbortError || controller.signal.aborted) return;

        if (err instanceof ApiError || err instanceof Error) {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    const requestTimer = window.setTimeout(() => void loadCollections(), 0);

    return () => {
      window.clearTimeout(requestTimer);
      controller.abort();
    };
  }, [onlyActive, attempt]);

  const reload = useCallback(() => setAttempt((current) => current + 1), []);

  return { collections, setCollections, isLoading, error, reload };
};

export default useVendorCollections;
