import { PaddingConfig, ResponsiveProp, TextConfig } from '..';
import { AspectRatioValue, MediaFit, MediaFocalPoint } from '../aspect-ratio';
import {
	BaseCommerceComponent,
	CreateBaseCommerceComponent,
	UpdateBaseCommerceComponent,
} from './commerce-component';

export const CONTENT_POSITION_GRID: HeroBannerContentPosition[][] = [
  ['top-left', 'top-center', 'top-right'],
  ['middle-left', 'middle-center', 'middle-right'],
  ['bottom-left', 'bottom-center', 'bottom-right'],
];

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

export type HeroBannerCtaStyle = 'solid' | 'outline' | 'ghost';
export type HeroBannerCtaSize = 'sm' | 'md' | 'lg';
export type HeroBannerCtaTarget = '_self' | '_blank';
export type HeroBannerCtaColorScheme =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'neutral';

export type HeroBannerCta = {
  label: string;
  url: string;
  style: HeroBannerCtaStyle;
  size: ResponsiveProp<HeroBannerCtaSize>;
  target: HeroBannerCtaTarget;
  colorScheme: HeroBannerCtaColorScheme;
};

export type HeroBannerContentSize = 'compact' | 'medium' | 'large' | 'impact';

export type HeroBannerContent = {
  eyebrow?: ({ value: string } & TextConfig) | undefined;
  title: { value: string } & TextConfig;
  subtitle: { value: string } & TextConfig;
  contentPosition: ResponsiveProp<HeroBannerContentPosition>;
  contentSize: HeroBannerContentSize;
};

export type BaseHeroBannerConfig = HeroBannerContent & {
  padding: PaddingConfig;
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

type CreateImageHeroBannerConfig = Omit<
  ImageHeroBannerConfig,
  'desktopMediaUrl' | 'mobileMediaUrl'
> & {
  desktopMedia: Blob;
  mobileMedia?: Blob | undefined;
};

type CreateVideoHeroBannerConfig = Omit<
  VideoHeroBannerConfig,
  'posterUrl' | 'desktopMediaUrl' | 'mobileMediaUrl'
> & {
  poster?: Blob | undefined;
  desktopMedia: Blob | undefined;
  mobileMedia?: Blob | undefined;
};

type CreateHeroBannerConfig =
  | CreateImageHeroBannerConfig
  | CreateVideoHeroBannerConfig;

export interface UpdateHeroBannerCommerceComponent extends UpdateBaseCommerceComponent<CreateHeroBannerConfig> {
  componentType: 'HERO_BANNER';
}

export interface CreateHeroBannerCommerceComponent extends CreateBaseCommerceComponent<CreateHeroBannerConfig> {
  componentType: 'HERO_BANNER';
}
