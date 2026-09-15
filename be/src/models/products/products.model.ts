import { z } from 'zod';

import { ImageSchema } from '#/models/images.model.js';

export const StockAlertEnum = z.enum(['MAXIMUM', 'REORDER', 'MINIMUM']);

export const ProductTableSchema = z.object({
	id: z.uuidv4(),
	brandId: z.uuidv4(),
	vendorId: z.uuidv4().nullable(),
	title: z.string().max(255),
	description: z.string().nullable(),
	slug: z.string().max(255),
	unitPrice: z.number().nonnegative(),
	unitCost: z.number().nonnegative(),
	currency: z.string().length(3).default('VND'),
	unit: z.string().max(255),
	expirationDate: z.date().nullable(),
	createdAt: z.date().default(() => new Date()),
});

export const ProductImageTableSchema = z.object({
	productId: z.uuidv4(),
	imageId: z.uuidv4(),
	sortOrder: z.number().int().positive(),
});

export const ProductNoteTableSchema = z.object({
	id: z.uuidv4(),
	productId: z.uuidv4(),
	content: z.string(),
	createdAt: z.date().default(() => new Date()),
});

export const ProductTagTableSchema = z.object({
	id: z.uuidv4(),
	productId: z.uuidv4(),
	name: z.string().max(100),
	createdAt: z.date().default(() => new Date()),
});

export const ProductStockTableSchema = z.object({
	id: z.uuidv4(),
	stock: z.number().int().nonnegative().default(0),
	createdAt: z.date().default(() => new Date()),
});

export const StockAlertTableSchema = z.object({
	id: z.uuidv4(),
	productStockId: z.uuidv4(),
	alertType: StockAlertEnum,
	threshold: z.number().int().nonnegative(),
	createdAt: z.date().default(() => new Date()),
});

export const CollectionTableSchema = z.object({
	id: z.uuidv4(),
	name: z.string().max(255),
	slug: z.string().max(255),
	description: z.string().nullable(),
	isActive: z.boolean().default(true),
	createdAt: z.date().default(() => new Date()),
});

export const ProductCollectionTableSchema = z.object({
	productId: z.uuidv4(),
	collectionId: z.uuidv4(),
	createdAt: z.date().default(() => new Date()),
});

export const ProductStockSchema = ProductStockTableSchema.extend({
	alerts: z.array(StockAlertTableSchema).max(3).default([]),
});

export const ProductSchema = ProductTableSchema.extend({
	media: z.array(ImageSchema).default([]),
	notes: z.array(ProductNoteTableSchema).default([]),
	tags: z.array(ProductTagTableSchema).default([]),
	stock: ProductStockSchema.nullable().default(null),
});

export const CollectionSchema = CollectionTableSchema.extend({
	products: z.array(ProductSchema).default([]),
});

export type ProductRow = z.infer<typeof ProductTableSchema>;
export type ProductImageRow = z.infer<typeof ProductImageTableSchema>;
export type ProductNoteRow = z.infer<typeof ProductNoteTableSchema>;
export type ProductTagRow = z.infer<typeof ProductTagTableSchema>;
export type ProductStockRow = z.infer<typeof ProductStockTableSchema>;
export type StockAlertRow = z.infer<typeof StockAlertTableSchema>;
export type CollectionRow = z.infer<typeof CollectionTableSchema>;
export type ProductCollectionRow = z.infer<typeof ProductCollectionTableSchema>;

export type Product = z.infer<typeof ProductSchema>;
export type ProductStock = z.infer<typeof ProductStockSchema>;
export type StockAlert = z.infer<typeof StockAlertTableSchema>;
export type Collection = z.infer<typeof CollectionSchema>;
