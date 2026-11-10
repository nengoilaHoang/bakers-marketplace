import { ApiError } from '@/lib/api';
import {
  getMyStorefront,
  getStorefrontReleaseLayouts,
} from '@/services/storefront';
import { Storefront, StorefrontRelease } from '@/types/storefront';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import useAuth from '../user/useAuthContext';
import VendorContext, { VendorContextValue } from './VendorContext';

const VendorContextProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { account, isAuthenticating } = useAuth();
  const [storefront, setStorefront] = useState<Storefront | null>(null);
  const [currentReleaseId, setCurrentReleaseId] = useState('');
  const [currentRelease, setCurrentRelease] =
    useState<StorefrontRelease | null>(null);

  const isVendor = account?.role === 'VENDOR';

  // Check if the current authenticated user is in /vendors
  useEffect(() => {
    if (isAuthenticating || !router.isReady) return;
    if (router.pathname.startsWith('/vendors') && !isVendor) {
      void router.replace('/');
    }
  }, [isAuthenticating, isVendor, router]);

  // Update currentReleaseId when the route changes
  useEffect(() => {
    if (!account || !router.isReady) return;
    const { id } = router.query;
    if (typeof id === 'string' && id !== currentReleaseId) {
      queueMicrotask(() => setCurrentReleaseId(id));
    }
  }, [currentReleaseId, router.isReady, router.query, account]);

  // Fetch all vendors' storefronts on first load
  useEffect(() => {
    if (!account || !router.isReady) return;
    const controller = new AbortController();

    const fetchMyStorefronts = async () => {
      try {
        const fetchedStorefront = await getMyStorefront(controller.signal);
        if (controller.signal.aborted) return;
        setStorefront(fetchedStorefront);

        if (fetchedStorefront !== null) {
          setCurrentReleaseId((prevReleaseId) => {
            if (prevReleaseId) return prevReleaseId;
            const defaultRelease =
              fetchedStorefront.releases.find((r) => r.isActive) ||
              fetchedStorefront.releases[0];
            return defaultRelease ? defaultRelease.id : '';
          });
        }
      } catch (err: unknown) {
        const isAbortError =
          err instanceof DOMException && err.name === 'AbortError';
        if (isAbortError || controller.signal.aborted) {
          // Do nothing
        }
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
        setStorefront(null);
      }
    };

    const requestTimer = window.setTimeout(() => {
      void fetchMyStorefronts();
    }, 0);

    return () => {
      window.clearTimeout(requestTimer);
      controller.abort();
    };
  }, [router.isReady, router.pathname, account]);

  // Load and cache release layouts
  useEffect(() => {
    if (!storefront || !currentReleaseId) {
      return;
    }

    const release = storefront.releases.find((r) => r.id === currentReleaseId);
    if (!release) {
      queueMicrotask(() => setCurrentRelease(null));
      throw new Error(
        `Release with ID ${currentReleaseId} does not exist within your storefront.`,
      );
    }

    // CACHE HIT: layouts already present in state, exit early to prevent refetching
    const { layouts } = release;
    if (layouts.length !== 0) {
      queueMicrotask(() => setCurrentRelease({ ...release, layouts }));
      return;
    }

    // CACHE MISS: fetch once and store into storefronts state
    const controller = new AbortController();
    getStorefrontReleaseLayouts(currentReleaseId, controller.signal)
      .then((layouts) => {
        const releaseWithLayouts = { ...release, layouts };
        setCurrentRelease(releaseWithLayouts);

        setStorefront((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            releases: prev.releases.map((r) => {
              return r.id === currentReleaseId ? { ...r, layouts } : r;
            }),
          };
        });
      })
      .catch((err) => {
        throw err;
      });

    return () => {
      controller.abort();
    };
  }, [currentReleaseId, storefront]);

  const contextValue: VendorContextValue = useMemo(
    () => ({
      storefront,
      currentRelease,
      setCurrentReleaseId,
    }),
    [storefront, currentRelease],
  );

  return (
    <VendorContext.Provider value={contextValue}>
      {children}
    </VendorContext.Provider>
  );
};

export default VendorContextProvider;
