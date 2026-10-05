import {
  getMyStorefronts,
  getStorefrontReleaseLayouts,
} from '@/services/storefront';
import { Storefront, StorefrontReleaseWithLayout } from '@/types/storefront';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import useAuth from '../user/useAuthContext';
import VendorContext from './VendorContext';

const VendorContextProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [storefronts, setStorefronts] = useState<Storefront[]>([]);
  const [currentStorefrontId, setCurrentStorefrontId] = useState<string>('');
  const [currentReleaseId, setCurrentReleaseId] = useState('');
  const [currentRelease, setCurrentRelease] =
    useState<StorefrontReleaseWithLayout | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const { id } = router.query;
    if (typeof id === 'string' && id !== currentReleaseId) {
      queueMicrotask(() => setCurrentReleaseId(id));
    }
  }, [currentReleaseId, router.isReady, router.query]);

  useEffect(() => {
    if (!user || !router.isReady) return;
    if (!router.pathname.startsWith('/vendors')) return;

    const controller = new AbortController();

    const fetchMyStorefronts = async () => {
      try {
        const fetchedStorefronts = await getMyStorefronts(controller.signal);
        if (controller.signal.aborted) return;
        setStorefronts(fetchedStorefronts);

        if (fetchedStorefronts.length > 0) {
          setCurrentStorefrontId((prevId) => {
            if (prevId && fetchedStorefronts.some((s) => s.id === prevId)) {
              return prevId;
            }
            return fetchedStorefronts[0].id;
          });

          setCurrentReleaseId((prevReleaseId) => {
            if (prevReleaseId) return prevReleaseId;
            const defaultRelease =
              fetchedStorefronts[0].releases.find((r) => r.isActive) ||
              fetchedStorefronts[0].releases[0];
            return defaultRelease ? defaultRelease.id : '';
          });
        }
      } catch (err: Error) {
        const isAbortError =
          err instanceof DOMException && err.name === 'AbortError';
        if (isAbortError || controller.signal.aborted) return;
        setStorefronts([]);
      }
    };

    const requestTimer = window.setTimeout(() => {
      void fetchMyStorefronts();
    }, 0);

    return () => {
      window.clearTimeout(requestTimer);
      controller.abort();
    };
  }, [router.isReady, router.pathname, user]);

  const activeStorefront = useMemo(
    function () {
      if (!currentStorefrontId || storefronts.length === 0) return null;
      return (
        storefronts.find(function (s) {
          return s.id === currentStorefrontId;
        }) || null
      );
    },
    [currentStorefrontId, storefronts],
  );

  // Load and cache release layouts
  useEffect(() => {
    if (!activeStorefront || !currentReleaseId) {
      return;
    }

    const release = activeStorefront.releases.find((r) => {
      return r.id === currentReleaseId;
    });
    if (!release) {
      queueMicrotask(() => setCurrentRelease(null));
      return;
    }

    // CACHE HIT: layouts already present in state, exit early to prevent refetching
    const { layouts } = release;
    if (layouts && layouts.length !== 0) {
      queueMicrotask(() => setCurrentRelease({ ...release, layouts }));
      return;
    }

    // CACHE MISS: fetch once and store into storefronts state
    const controller = new AbortController();
    getStorefrontReleaseLayouts(
      currentStorefrontId,
      currentReleaseId,
      controller.signal,
    )
      .then((layouts) => {
        const releaseWithLayouts = { ...release, layouts };
        setCurrentRelease(releaseWithLayouts);

        setStorefronts(function (prev) {
          return prev.map((s) => {
            if (s.id !== currentStorefrontId) return s;
            return {
              ...s,
              releases: s.releases.map((r) => {
                return r.id === currentReleaseId ? { ...r, layouts } : r;
              }),
            };
          });
        });
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error('Failed to load layouts:', err);
        }
      });

    return () => {
      controller.abort();
    };
  }, [activeStorefront, currentReleaseId, currentStorefrontId]);

  const contextValue = useMemo(
    () => ({
      storefronts,
      currentStorefront: activeStorefront,
      setCurrentStorefrontId,
      currentRelease,
      setCurrentReleaseId,
    }),
    [storefronts, activeStorefront, currentRelease],
  );

  return (
    <VendorContext.Provider value={contextValue}>
      {children}
    </VendorContext.Provider>
  );
};

export default VendorContextProvider;
