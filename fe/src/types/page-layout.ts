import { CompositeComponent } from './layout-component/composite-component';

export type PageLayoutType =
  | 'ABOUT_US'
  | 'COLLECTION'
  | 'COLLECTION_LIST'
  | 'HOME'
  | 'PRODUCT'
  | 'SEARCH'
  | 'CUSTOM';

export type PageLayout = {
  id: string;
  type: PageLayoutType;
  name: string;
  slug: string;
  root: CompositeComponent;
};

export type PageLayoutSummary = Omit<PageLayout, 'root'>;
