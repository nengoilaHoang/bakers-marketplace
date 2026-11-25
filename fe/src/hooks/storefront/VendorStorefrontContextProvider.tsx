import { ApiError } from '@/lib/api';
import {
  getMyStorefront,
  getStorefrontReleasePages,
  updateReleaseThemeSettings,
} from '@/services/storefront';
import { Storefront, StorefrontRelease } from '@/types/storefront';
import { ColorPalette, Typography } from '@/types/theme-settings';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useAuth from '../user/useAuthContext';
import VendorStorefrontContext, {
  VendorStorefrontContextValue,
} from './VendorStorefrontContext';

const VendorStorefrontContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { account, isAuthenticating } = useAuth();
  const [storefront, setStorefront] = useState<Storefront | null>(null);
  const [currentReleaseId, setCurrentReleaseId] = useState<string | null>(null);
  const currentRelease = useMemo(
    () => storefront?.releases.find((r) => r.id === currentReleaseId) ?? null,
    [currentReleaseId, storefront?.releases],
  );
  const [mutatedCurrentRelease, setMutatedCurrentRelease] =
    useState<StorefrontRelease | null>(currentRelease);
  const [isSavingThemeSettings, setIsSavingThemeSettings] = useState(false);

  const isVendor = account?.role === 'VENDOR';

  // Check if the current authenticated user is in /vendors
  useEffect(() => {
    if (isAuthenticating || !router.isReady) return;
    if (router.pathname.startsWith('/vendors') && !isVendor) {
      void router.replace('/');
    }
  }, [isAuthenticating, isVendor, router]);

  // Update the mutated version every time currentRelease is recalculated
  useEffect(() => {
    queueMicrotask(() => setMutatedCurrentRelease(currentRelease));
  }, [currentRelease]);

  // Fetch vendor's storefront on first load
  useEffect(() => {
    if (!account || !router.isReady) return;
    const controller = new AbortController();

    const fetchMyStorefront = async () => {
      try {
        const fetchedStorefront = await getMyStorefront(controller.signal);
        if (!fetchedStorefront) return;
        setStorefront(fetchedStorefront);
        setCurrentReleaseId(
          fetchedStorefront.releases.find((r) => r.isActive)?.id ??
            fetchedStorefront.releases[0]?.id ??
            null,
        );
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
      void fetchMyStorefront();
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
      queueMicrotask(() => {
        setCurrentReleaseId(null);
        setMutatedCurrentRelease(null);
      });
      throw new Error('Something went wrong');
    }

    // CACHE HIT: layouts already present in state, exit early to prevent refetching
    if (release.layouts.length !== 0) {
      return;
    }

    queueMicrotask(() => setMutatedCurrentRelease(null));
    // CACHE MISS: fetch once and store into storefront state
    const controller = new AbortController();
    getStorefrontReleasePages(currentReleaseId, controller.signal)
      .then((layouts) => {
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

  const updateTypography = useCallback(
    <K extends keyof Typography>(key: K, value: Typography[K]) => {
      setMutatedCurrentRelease((prev) => {
        if (!prev) return prev;
        const themeSettings = prev.themeSettings;
        const typography = themeSettings.typography;

        if (typography[key] === value) return prev;
        return {
          ...prev,
          themeSettings: {
            ...themeSettings,
            typography: {
              ...typography,
              [key]: value,
            },
          },
        };
      });
    },
    [],
  );

  const updateColorPalette = useCallback(
    <K extends keyof ColorPalette>(key: K, value: ColorPalette[K]) => {
      setMutatedCurrentRelease((prev) => {
        if (!prev) return prev;
        const themeSettings = prev.themeSettings;
        const colorPalette = themeSettings.colorPalette;
        if (colorPalette[key] === value) return prev;
        return {
          ...prev,
          themeSettings: {
            ...themeSettings,
            colorPalette: {
              ...colorPalette,
              [key]: value,
            },
          },
        };
      });
    },
    [],
  );

  const saveThemeSettings = useCallback(async () => {
    if (!mutatedCurrentRelease || isSavingThemeSettings) return;
    const releaseId = mutatedCurrentRelease.id;
    const { id: _tId, ...typography } =
      mutatedCurrentRelease.themeSettings.typography;
    const { id: _cId, ...colorPalette } =
      mutatedCurrentRelease.themeSettings.colorPalette;

    setIsSavingThemeSettings(true);
    try {
      const savedThemeSettings = await updateReleaseThemeSettings(releaseId, {
        typography,
        colorPalette,
      });

      setStorefront((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          releases: prev.releases.map((r) =>
            r.id === releaseId
              ? { ...r, themeSettings: savedThemeSettings }
              : r,
          ),
        };
      });
      setMutatedCurrentRelease((prev) =>
        prev?.id === releaseId
          ? { ...prev, themeSettings: savedThemeSettings }
          : prev,
      );
    } finally {
      setIsSavingThemeSettings(false);
    }
  }, [isSavingThemeSettings, mutatedCurrentRelease]);

  const revalidateLayouts = useCallback(async () => {
    if (!currentReleaseId) return;
    const pages = await getStorefrontReleasePages(currentReleaseId);

    setStorefront((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        releases: prev.releases.map((r) =>
          r.id === currentReleaseId ? { ...r, layouts: pages } : r,
        ),
      };
    });
  }, [currentReleaseId]);

  const hasUnsavedThemeChanges = useMemo(() => {
    if (!currentRelease || !mutatedCurrentRelease) return false;
    return (
      JSON.stringify(currentRelease.themeSettings) !==
      JSON.stringify(mutatedCurrentRelease.themeSettings)
    );
  }, [currentRelease, mutatedCurrentRelease]);

  const contextValue: VendorStorefrontContextValue = useMemo(
    () => ({
      storefront,
      setStorefront,
      currentRelease: mutatedCurrentRelease,
      setCurrentReleaseId,
      updateTypography,
      updateColorPalette,
      saveThemeSettings,
      hasUnsavedThemeChanges,
      revalidateLayouts,
    }),
    [
      storefront,
      mutatedCurrentRelease,
      updateTypography,
      updateColorPalette,
      saveThemeSettings,
      hasUnsavedThemeChanges,
      revalidateLayouts,
    ],
  );

  return (
    <VendorStorefrontContext.Provider value={contextValue}>
      {children}
    </VendorStorefrontContext.Provider>
  );
};

export default VendorStorefrontContextProvider;
