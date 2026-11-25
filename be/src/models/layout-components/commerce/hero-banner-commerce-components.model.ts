import { z } from 'zod';
import {
	AspectRatioValueSchema,
	MediaFitSchema,
	MediaFocalPointSchema,
} from '../aspect-ratio.model.js';
import {
	BasePlacementConfigSchema,
	PaddingSchema,
	ResponsiveProp,
	TextConfigSchema,
} from '../base-layout-components.model.js';
import {
	BaseCommerceComponentSchema,
	CommerceComponentTypeSchema,
	CreateBaseCommerceComponentSchema,
	UpdateBaseCommerceComponentSchema,
} from './base-commerce-components.model.js';

const HeroBannerMediaTypeSchema = z.enum(['image', 'video']);
const HeroBannerCtaTargetTypeSchema = z.enum(['_self', '_blank']);
const HeroBannerCtaStyleTypeSchema = z.enum(['solid', 'outline', 'ghost']);
const HeroBannerContentPositionTypeSchema = z.enum([
  'top-left',
  'top-center',
  'top-right',
  'middle-left',
  'middle-center',
  'middle-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
]);
const HeroBannerCtaSizeTypeSchema = z.enum(['sm', 'md', 'lg']);

export const HeroBannerOverlaySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('none'),
  }),

  z.object({
    type: z.literal('solid'),
    color: z.string(),
    opacity: z.uint32().min(0).max(100).optional(),
  }),

  z.object({
    type: z.literal('gradient'),
    color: z.string(),
    opacity: z.uint32().min(0).max(100).optional(),
  }),
]);

export const HeroBannerContentSizeTypeSchema = z.enum([
  'compact',
  'medium',
  'large',
  'impact',
]);

export const HeroBannerContentSchema = z.object({
  eyebrow: z
    .object({
      value: z.string(),
      ...TextConfigSchema.shape,
    })
    .optional(),
  title: z.object({
    value: z.string(),
    ...TextConfigSchema.shape,
  }),
  subtitle: z.object({
    value: z.string(),
    ...TextConfigSchema.shape,
  }),
  contentPosition: ResponsiveProp(
    HeroBannerContentPositionTypeSchema.default('middle-center'),
  ),
  contentSize: HeroBannerContentSizeTypeSchema.default('large'),
});

export const HeroBannerCtaColorSchemeSchema = z.enum([
  'primary',
  'secondary',
  'accent',
  'neutral', // Resolves to high-contrast surface/text tokens for busy hero media
]);

export const HeroBannerCtaSchema = z.object({
  label: z.string(),
  url: z.url(),
  style: HeroBannerCtaStyleTypeSchema,
  colorScheme: HeroBannerCtaColorSchemeSchema.default('primary'),
  size: ResponsiveProp(HeroBannerCtaSizeTypeSchema.default('md')),
  target: HeroBannerCtaTargetTypeSchema,
});

export const BaseHeroBannerConfigSchema = BasePlacementConfigSchema.extend({
  padding: PaddingSchema,
  aspect: ResponsiveProp(AspectRatioValueSchema.default('16:9')),
  fit: MediaFitSchema,
  focalPoint: MediaFocalPointSchema.nullable().optional().default(null),
  mediaType: HeroBannerMediaTypeSchema,
  desktopMediaUrl: z.url(),
  mobileMediaUrl: z.url().nullable().optional().default(null),
  altText: z.string(),

  overlay: HeroBannerOverlaySchema.default({ type: 'none' }),

  ...HeroBannerContentSchema.shape,

  primaryCta: HeroBannerCtaSchema.extend({
    colorScheme: HeroBannerCtaColorSchemeSchema.default('primary'),
  }).optional(),
  secondaryCta: HeroBannerCtaSchema.extend({
    colorScheme: HeroBannerCtaColorSchemeSchema.default('secondary'),
  }).optional(),
  ctaPosition: ResponsiveProp(
    HeroBannerContentPositionTypeSchema.default('middle-center'),
  ).optional(),
});

export const ImageHeroBannerConfigSchema = BaseHeroBannerConfigSchema.extend({
  mediaType: z.literal(HeroBannerMediaTypeSchema.enum.image),
});

export const VideoHeroBannerConfigSchema = BaseHeroBannerConfigSchema.extend({
  mediaType: z.literal(HeroBannerMediaTypeSchema.enum.video),
  posterUrl: z.url().optional(), // Fallback for video
  videoAutoplay: z.boolean().default(false),
});

export const HeroBannerConfigSchema = z.discriminatedUnion('mediaType', [
  ImageHeroBannerConfigSchema,
  VideoHeroBannerConfigSchema,
]);

export const HeroBannerCommerceComponent = BaseCommerceComponentSchema.extend({
  componentType: z
    .literal(CommerceComponentTypeSchema.enum.HERO_BANNER)
    .readonly(),
  config: HeroBannerConfigSchema,
});

const CreateImageHeroBannerConfigSchema = ImageHeroBannerConfigSchema.omit({
  desktopMediaUrl: true,
  mobileMediaUrl: true,
}).extend({
  desktopMedia: z.file(),
  mobileMedia: z.file().optional(),
});

const CreateVideoHeroBannerConfigSchema = VideoHeroBannerConfigSchema.omit({
  posterUrl: true,
  desktopMediaUrl: true,
  mobileMediaUrl: true,
}).extend({
  poster: z.file().optional(),
  desktopMedia: z.file(),
  mobileMedia: z.file().optional(),
});

const PutImageHeroBannerConfigSchema = z.union([
  CreateImageHeroBannerConfigSchema,
  ImageHeroBannerConfigSchema,
]);

const PutVideoHeroBannerConfigSchema = z.union([
  CreateVideoHeroBannerConfigSchema,
  VideoHeroBannerConfigSchema,
]);

export const PutHeroBannerConfigSchema = z.union([
  PutImageHeroBannerConfigSchema,
  PutVideoHeroBannerConfigSchema,
]);

export const UpdateHeroBannerCommerceComponent =
  UpdateBaseCommerceComponentSchema.extend({
    componentType: z
      .literal(CommerceComponentTypeSchema.enum.HERO_BANNER)
      .readonly(),
    config: PutHeroBannerConfigSchema.optional(),
  });

export const CreateHeroBannerCommerceComponent =
  CreateBaseCommerceComponentSchema.extend({
    componentType: z
      .literal(CommerceComponentTypeSchema.enum.HERO_BANNER)
      .readonly(),
    config: z.discriminatedUnion('mediaType', [
      CreateImageHeroBannerConfigSchema,
      CreateVideoHeroBannerConfigSchema,
    ]),
  });
