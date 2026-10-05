import { Brand } from './brand';
import { PageLayout } from './page-layout';

export type Storefront = {
  id: string;
  brand: Brand;
  createdAt: Date;
  releases: Array<StorefrontRelease>;
};

export type StorefrontRelease = {
  id: string;
  version: number;
  displayName: string;
  layouts?: Array<PageLayout>;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
};

export type StorefrontReleaseWithLayout = Omit<StorefrontRelease, 'layouts'> & {
  layouts: Array<PageLayout>;
};
