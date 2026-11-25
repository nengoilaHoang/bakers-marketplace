import { BrandPublicView } from './brand';
import { PageLayout } from './page-layout';
import { ThemeSettings } from './theme-settings';

export type Storefront = {
  id: string;
  brand: BrandPublicView;
  createdAt: Date;
  releases: Array<StorefrontRelease>;
};

export type StorefrontRelease = {
  id: string;
  version: number;
  displayName: string;
  layouts: Array<PageLayout>;
  themeSettings: ThemeSettings;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
};
