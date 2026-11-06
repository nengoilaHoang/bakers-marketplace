import {
	BasePlacementConfig,
	BentoItemConfig,
	ResponsiveProp,
	TextConfig,
} from '..';
import { AspectRatioValue, MediaFit, MediaFocalPoint } from '../aspect-ratio';
import {
	BaseCommerceComponent,
	CreateBaseCommerceComponent,
	UpdateBaseCommerceComponent,
} from './commerce-component';

export type HeroBannerContentPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type HeroBannerOverlay =
  | {
      type: 'none';
    }
  | {
      type: 'solid';
      color: string;
      opacity?: number | undefined;
    }
  | {
      type: 'gradient';
      color: string;
      opacity?: number | undefined;
    };

export type HeroBannerCta = {
  label: string;
  url: string;
  style: 'solid' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  target: '_self' | '_blank';
};

export type HeroBannerContentSize = 'compact' | 'medium' | 'large' | 'impact';

export type HeroBannerContent = {
  eyebrow?: ({ value: string } & TextConfig) | undefined;
  title: { value: string } & TextConfig;
  subtitle: { value: string } & TextConfig;
  contentPosition: ResponsiveProp<HeroBannerContentPosition>;
  contentSize: HeroBannerContentSize;
};

export type BaseHeroBannerConfig = BasePlacementConfig &
  Partial<BentoItemConfig> &
  HeroBannerContent & {
    aspect: ResponsiveProp<AspectRatioValue>;
    fit: MediaFit;
    focalPoint?: MediaFocalPoint | null | undefined;
    desktopMediaUrl: string;
    mobileMediaUrl?: string | null | undefined;
    altText: string;
    overlay: HeroBannerOverlay;
    primaryCta?: HeroBannerCta | undefined;
    secondaryCta?: HeroBannerCta | undefined;
    ctaPosition?: ResponsiveProp<HeroBannerContentPosition> | undefined;
  };

export interface ImageHeroBannerConfig extends BaseHeroBannerConfig {
  mediaType: 'image';
}

export interface VideoHeroBannerConfig extends BaseHeroBannerConfig {
  mediaType: 'video';
  posterUrl: string;
  videoAutoplay?: boolean;
}

export type HeroBannerConfig = ImageHeroBannerConfig | VideoHeroBannerConfig;

export interface HeroBannerCommerceComponent extends BaseCommerceComponent<HeroBannerConfig> {
  componentType: 'HERO_BANNER';
}

export interface UpdateHeroBannerCommerceComponent extends UpdateBaseCommerceComponent<HeroBannerConfig> {
  componentType: 'HERO_BANNER';
}

export interface CreateHeroBannerCommerceComponent extends CreateBaseCommerceComponent<HeroBannerConfig> {
  componentType: 'HERO_BANNER';
}
