import { z } from 'zod';
import {
	BaseCommerceComponentSchema,
	CommerceComponentTypeSchema,
	CreateBaseCommerceComponentSchema,
	UpdateBaseCommerceComponentSchema,
} from './base-commerce-components.model.js';
import {
	BaseLayoutComponentConfigSchema,
	TextStyle,
} from '../base-layout-components.model.js';

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

export const BaseHeroBannerConfigSchema =
	BaseLayoutComponentConfigSchema.extend({
		mediaType: HeroBannerMediaTypeSchema,
		desktopMediaUrl: z.url(),
		mobileMediaUrl: z.url().nullable(),
		altText: z.string(),

		eyebrow: z
			.object({
				value: z.string(),
				...TextStyle.shape,
			})
			.optional(),
		title: z.object({
			value: z.string(),
			...TextStyle.shape,
		}),
		subtitle: z.object({
			value: z.string(),
			...TextStyle.shape,
		}),

		contentPosition: HeroBannerContentPositionTypeSchema,

		overlay: HeroBannerOverlaySchema.default({ type: 'none' }),

		primaryCta: z
			.object({
				label: z.string(),
				url: z.url(),
				style: HeroBannerCtaStyleTypeSchema,
				size: HeroBannerCtaSizeTypeSchema,
				target: HeroBannerCtaTargetTypeSchema,
			})
			.optional(),
		secondaryCta: z
			.object({
				label: z.string(),
				url: z.url(),
				style: HeroBannerCtaStyleTypeSchema,
				size: HeroBannerCtaSizeTypeSchema,
				target: HeroBannerCtaTargetTypeSchema,
			})
			.optional(),
		ctaPosition: HeroBannerContentPositionTypeSchema.optional(),
	});

export const ImageHeroBannerConfigSchema = BaseHeroBannerConfigSchema.extend({
	mediaType: z.literal(HeroBannerMediaTypeSchema.enum.image),
});

export const VideoHeroBannerConfigSchema = BaseHeroBannerConfigSchema.extend({
	mediaType: z.literal(HeroBannerMediaTypeSchema.enum.video),
	posterUrl: z.url(), // Fallback for video
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

export const UpdateHeroBannerCommerceComponent =
	UpdateBaseCommerceComponentSchema.extend({
		componentType: z
			.literal(CommerceComponentTypeSchema.enum.HERO_BANNER)
			.readonly(),
		config: z
			.union([
				ImageHeroBannerConfigSchema.partial(),
				VideoHeroBannerConfigSchema.partial(),
			])
			.optional(),
	});

export const CreateHeroBannerCommerceComponent =
	CreateBaseCommerceComponentSchema.extend({
		componentType: z
			.literal(CommerceComponentTypeSchema.enum.HERO_BANNER)
			.readonly(),
		config: HeroBannerConfigSchema,
	});
