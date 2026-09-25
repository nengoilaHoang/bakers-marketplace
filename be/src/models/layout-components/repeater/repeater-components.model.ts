import { z } from 'zod';
import {
	CollectionGridSchema,
	CreateCollectionGridSchema,
	UpdateCollectionGridSchema,
} from './collection-grid-repeater-components.mode.js';

export const RepeaterComponentSchema = z.discriminatedUnion('componentType', [
	CollectionGridSchema,
]);

export const UpdateRepeaterComponentSchema = z.discriminatedUnion(
	'componentType',
	[UpdateCollectionGridSchema],
);
export type UpdateRepeaterComponent = z.infer<
	typeof UpdateRepeaterComponentSchema
>;

export const CreateRepeaterComponentSchema = z.discriminatedUnion(
	'componentType',
	[CreateCollectionGridSchema],
);
export type CreateRepeaterComponent = z.infer<
	typeof CreateRepeaterComponentSchema
>;
