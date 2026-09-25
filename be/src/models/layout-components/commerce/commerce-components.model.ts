import { z } from 'zod';
import {
	CreateProductCardRepeaterComponentSchema,
	ProductCardRepeaterComponentSchema,
	UpdateProductCardRepeaterComponentSchema,
} from './product-card-commerce-components.model.js';
import {
	CreateHeroBannerCommerceComponent,
	HeroBannerCommerceComponent,
	UpdateHeroBannerCommerceComponent,
} from './hero-banner-commerce-components.model.js';

export const CommerceComponentSchema = z.discriminatedUnion('componentType', [
	ProductCardRepeaterComponentSchema,
	HeroBannerCommerceComponent,
]);

export const UpdateCommerceComponentSchema = z.discriminatedUnion(
	'componentType',
	[UpdateProductCardRepeaterComponentSchema, UpdateHeroBannerCommerceComponent],
);
export type UpdateCommerceComponent = z.infer<
	typeof UpdateCommerceComponentSchema
>;

export const CreateCommerceComponentSchema = z.discriminatedUnion(
	'componentType',
	[CreateProductCardRepeaterComponentSchema, CreateHeroBannerCommerceComponent],
);
export type CreateCommerceComponent = z.infer<
	typeof CreateCommerceComponentSchema
>;
