import { Storefront, StorefrontRelease } from '@/types/storefront';
import { ColorPalette, Typography } from '@/types/theme-settings';
import { createContext } from 'react';

export type VendorStorefrontContextValue = {
  storefront: Storefront | null;
  setStorefront: (storefront: Storefront | null) => void;
  currentRelease: StorefrontRelease | null;
  setCurrentReleaseId: (releaseId: string | null) => void;
  updateTypography: <K extends keyof Typography>(
    key: K,
    value: Typography[K],
  ) => void;
  updateColorPalette: <K extends keyof ColorPalette>(
    key: K,
    value: ColorPalette[K],
  ) => void;
  saveThemeSettings: () => Promise<void>;
  hasUnsavedThemeChanges: boolean;
  revalidateLayouts: () => Promise<void>;
};

const VendorStorefrontContext =
  createContext<VendorStorefrontContextValue | null>(null);
export default VendorStorefrontContext;
