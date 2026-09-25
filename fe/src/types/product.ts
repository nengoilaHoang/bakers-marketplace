export type Image = {
	id: string;
	displayName: string | null;
	originalName: string | null;
	url: string;
	contentType: string | null;
	extName: string | null;
	size: number | null;
	checksum: string | null;
	uploadedAt: string | null;
	createdAt: string;
};

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
