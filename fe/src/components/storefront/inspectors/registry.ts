import { DeviceBreakpoint } from '@/types/canvas';
import { FlattenComponent } from '@/utils/flattenLayout';
import { ComponentType } from 'react';
import { SectionId } from '../ComponentInspector';
import CollectionGridInspector from './CollectionGridInspector';
import GridInspector from './GridInspector';
import HeroBannerInspector from './HeroBannerInspector';
import ProductCardInspector from './ProductCardInspector';

export type InspectorProps<T extends FlattenComponent = FlattenComponent> = {
  component: T;
  openSections: Record<string, boolean | undefined>;
  toggleSection: (id: SectionId) => void;
  onUpdate: (pathname: string, value: unknown, bp?: string) => void;
  onActiveSectionChange: (id: SectionId | null) => void;
  getSectionZIndex: (id: SectionId) => number;
  currentBp: DeviceBreakpoint;
};

export const COMPONENT_INSPECTORS: Record<
  string,
  ComponentType<InspectorProps<any>>
> = {
  HERO_BANNER: HeroBannerInspector,
  GRID: GridInspector,
  COLLECTION_GRID: CollectionGridInspector,
  PRODUCT_CARD: ProductCardInspector,
};
