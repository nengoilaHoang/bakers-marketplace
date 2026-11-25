import { ApiError } from '@/lib/api';
import { getStorefrontReleaseSummaryPages } from '@/services/storefront';
import type { PageLayoutSummary } from '@/types/page-layout';
import { useCallback, useEffect, useState } from 'react';

const useReleaseSummaryPages = (releaseId?: string | null) => {
  const [pages, setPages] = useState<PageLayoutSummary[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(releaseId));
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!releaseId) return;

    const controller = new AbortController();

    const loadSummaryPages = async () => {
      try {
        setIsLoading(true);
        const data = await getStorefrontReleaseSummaryPages(
          releaseId,
          controller.signal,
        );
        if (!controller.signal.aborted) {
          setPages(data);
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

    const requestTimer = window.setTimeout(() => void loadSummaryPages(), 0);

    return () => {
      window.clearTimeout(requestTimer);
      controller.abort();
    };
  }, [releaseId, attempt]);

  const reload = useCallback(() => setAttempt((current) => current + 1), []);

  return { pages, setPages, isLoading, error, reload };
};

export default useReleaseSummaryPages;
