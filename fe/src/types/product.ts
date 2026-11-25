import { Image } from './files';

export type ProductNote = {
	id: string;
	productId: string;
	content: string;
	createdAt: string;
};

export type ProductTag = {
	id: string;
	productId: string;
	name: string;
	createdAt: string;
};

export type StockAlert = {
	id: string;
	productStockId: string;
	alertType: 'MAXIMUM' | 'REORDER' | 'MINIMUM';
	threshold: number;
	createdAt: string;
};

export type ProductStock = {
	id: string;
	stock: number;
	createdAt: string;
	alerts: StockAlert[];
};

export type CollectionSummary = {
	id: string;
	name: string;
	slug: string;
	isActive: boolean;
};

export type Product = {
	id: string;
	brandId: string;
	// Tiệm (thương hiệu) bán sản phẩm.
	brand: { id: string; name: string } | null;
	vendorId: string | null;
	title: string;
	description: string | null;
	slug: string;
	unitPrice: number;
	unitCost: number;
	currency: string;
	unit: string;
	expirationDate: string | null;
	createdAt: string;
	media: Image[];
	notes: ProductNote[];
	tags: ProductTag[];
	stock: ProductStock | null;
	collections: CollectionSummary[];
};

export type ProductInput = {
	brandId: string;
	vendorId: string | null;
	title: string;
	description: string | null;
	slug: string;
	unitPrice: number;
	unitCost: number;
	currency?: string;
	unit: string;
	expirationDate: string | null;
};

export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'popular';

export type ProductFilters = {
	tag?: string;
	minPrice?: number;
	maxPrice?: number;
	inStockOnly?: boolean;
	collection?: string;
	brand?: string;
};

export type PaginatedProducts = {
	items: Product[];
	nextCursor: string | null;
	hasNextPage: boolean;
};
