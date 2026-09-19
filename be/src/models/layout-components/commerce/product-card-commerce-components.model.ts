import { z } from 'zod';
import {
	BaseCommerceComponentSchema,
	CommerceComponentTypeSchema,
	CreateBaseCommerceComponentSchema,
	UpdateBaseCommerceComponentSchema,
} from './base-commerce-components.model.js';
import {
	InterpolatedStringSchema,
	TextStyle,
} from '../base-layout-components.model.js';

export const ProductCardContentLayoutSchema = z.enum(['simple', 'custom']);
export const ProductCardThumbnailRatioSchema = z.enum(['16:9', '4:3', '1:1']);
export const ProductCardThumbnailScaleSchema = z.enum([
	'none', // no scaling
	'fill', // scale to fill
	'contain', // scale down while preserving ratio
	'cover', // scale up to fill while preserving ratio
]);

export const ProductCardBodyItemSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('description'),
		display: z.boolean(),
		value: InterpolatedStringSchema,
		style: TextStyle,
	}),
	z.object({
		type: z.literal('ratings'),
		display: z.boolean(),
		value: InterpolatedStringSchema,
		ratingType: z.enum(['stars', 'numeral']).optional(),
	}),
	z.object({
		type: z.literal('priceTag'),
		display: z.boolean(),
		value: InterpolatedStringSchema,

		currency: InterpolatedStringSchema,
		unit: InterpolatedStringSchema,

		format: z.object({
			showUnit: z.boolean().default(true),
			showCurrency: z.boolean().default(true),
			unitSeparator: z.enum(['/', 'per', '.']).default('/'),
		}),

		style: z
			.object({
				color: TextStyle,
				unitColor: TextStyle,
			})
			.optional(),
	}),
]);

export const ProductCardBodySchema = z.discriminatedUnion('layout', [
	z.object({
		layout: z.literal(ProductCardContentLayoutSchema.enum.simple),
		header: z.object({
			title: z.object({
				value: InterpolatedStringSchema,
				style: TextStyle,
			}),
			subtitle: z.object({
				display: z.boolean(),
				value: InterpolatedStringSchema,
				style: TextStyle,
			}),
		}),
		body: z.array(ProductCardBodyItemSchema).superRefine((items, ctx) => {
			const seen = new Set();

			items.forEach((item, idx) => {
				if (seen.has(item.type)) {
					ctx.addIssue({
						code: 'custom',
						message: `Duplicate item: "${item.type}" appeared more than once.`,
						path: [idx, 'type'],
					});
				}
				seen.add(item);
			});
		}),
	}),
]);

export const ProductCardConfigSchema = z.object({
	thumbnail: z.object({
		url: z.url(),
		ratio: ProductCardThumbnailRatioSchema,
		scale: ProductCardThumbnailScaleSchema,
	}),
	content: ProductCardBodySchema,
});

export const ProductCardRepeaterComponentSchema =
	BaseCommerceComponentSchema.extend({
		componentType: z
			.literal(CommerceComponentTypeSchema.enum.PRODUCT_CARD)
			.readonly(),
		config: ProductCardConfigSchema,
	});

// Update Schemas

export const UpdateProductCardRepeaterComponentSchema =
	UpdateBaseCommerceComponentSchema.extend({
		config: ProductCardConfigSchema.partial().optional(),
	});

// Create Schemas

export const CreateProductCardRepeaterComponentSchema =
	CreateBaseCommerceComponentSchema.extend({
		componentType: z
			.literal(CommerceComponentTypeSchema.enum.PRODUCT_CARD)
			.readonly(),
		config: ProductCardConfigSchema,
	});
