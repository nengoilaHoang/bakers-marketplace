import { z } from 'zod';
import {
	CreateProductCardRepeaterComponentSchema,
	ProductCardRepeaterComponentSchema,
	UpdateProductCardRepeaterComponentSchema,
} from './product-card-commerce-components.model.js';

export const CommerceComponentSchema = z.discriminatedUnion('componentType', [
	ProductCardRepeaterComponentSchema,
]);

export const UpdateCommerceComponentSchema = z.discriminatedUnion(
	'componentType',
	[UpdateProductCardRepeaterComponentSchema],
);

export const CreateCommerceComponentSchema = z.discriminatedUnion(
	'componentType',
	[CreateProductCardRepeaterComponentSchema],
);

export type CreateCommerceComponent = z.infer<
	typeof CreateCommerceComponentSchema
>;
