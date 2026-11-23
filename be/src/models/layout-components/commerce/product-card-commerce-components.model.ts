import { z } from 'zod';
import {
	BaseLayoutComponentConfigSchema,
	BoxStyleConfigSchema,
	ColorSchema,
	InterpolatedStringSchema,
	TextConfigSchema,
} from '../base-layout-components.model.js';
import {
	BaseCommerceComponentSchema,
	CommerceComponentTypeSchema,
	CreateBaseCommerceComponentSchema,
	UpdateBaseCommerceComponentSchema,
} from './base-commerce-components.model.js';

export const ProductCardContentLayoutSchema = z.enum(['simple', 'custom']);
export const ProductCardThumbnailRatioSchema = z.enum(['16:9', '4:3', '1:1']);
export const ProductCardThumbnailScaleSchema = z.enum([
  'none', // no scaling
  'fill', // scale to fill
  'contain', // scale down while preserving ratio
  'cover', // scale up to fill while preserving ratio
]);

export const ProductCardBodyItemSchema = z.union([
  z.object({
    type: z.literal('description'),
    value: InterpolatedStringSchema,
    style: TextConfigSchema,
  }),
  z.object({
    type: z.literal('ratings'),
    value: InterpolatedStringSchema,
    ratingType: z.literal('numeral'),
    style: TextConfigSchema,
  }),
  z.object({
    type: z.literal('ratings'),
    value: InterpolatedStringSchema,
    ratingType: z.literal('stars'),
    color: ColorSchema,
  }),
  z.object({
    type: z.literal('priceTag'),
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
        color: TextConfigSchema,
        unitColor: TextConfigSchema,
      })
      .optional(),
  }),
]);

export const ProductCardBodySchema = z.discriminatedUnion('layout', [
  z.object({
    layout: z.literal(ProductCardContentLayoutSchema.enum.simple),
    header: z.object({
      title: TextConfigSchema.extend({
        value: InterpolatedStringSchema,
      }),
      subtitle: TextConfigSchema.extend({
        value: InterpolatedStringSchema,
      }).optional(),
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

export const ProductCardConfigSchema = BaseLayoutComponentConfigSchema.extend({
  ...BoxStyleConfigSchema.shape,
  thumbnail: z.object({
    url: z.url(),
    ratio: ProductCardThumbnailRatioSchema,
    fit: ProductCardThumbnailScaleSchema,
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
    componentType: z
      .literal(CommerceComponentTypeSchema.enum.PRODUCT_CARD)
      .readonly(),
    config: ProductCardConfigSchema.optional(),
  });

// Create Schemas

export const CreateProductCardRepeaterComponentSchema =
  CreateBaseCommerceComponentSchema.extend({
    componentType: z
      .literal(CommerceComponentTypeSchema.enum.PRODUCT_CARD)
      .readonly(),
    config: ProductCardConfigSchema,
  });
