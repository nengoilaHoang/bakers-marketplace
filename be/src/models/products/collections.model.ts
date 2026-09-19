import { z } from "zod";

import { ProductSchema } from "#/models/products/products.model.js";

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

export const CollectionSchema = CollectionTableSchema.extend({
  products: z.array(ProductSchema).default([]),
});

/** Dữ liệu client gửi lên khi tạo bộ sưu tập. */
export const CollectionCreateSchema = CollectionTableSchema.omit({
  id: true,
  createdAt: true,
});

/** Khi cập nhật, mọi trường đều không bắt buộc. */
export const CollectionUpdateSchema = CollectionCreateSchema.partial();

export type CollectionCreateInput = z.infer<typeof CollectionCreateSchema>;
export type CollectionUpdateInput = z.infer<typeof CollectionUpdateSchema>;

export type CollectionRow = z.infer<typeof CollectionTableSchema>;
export type ProductCollectionRow = z.infer<typeof ProductCollectionTableSchema>;

export type Collection = z.infer<typeof CollectionSchema>;
