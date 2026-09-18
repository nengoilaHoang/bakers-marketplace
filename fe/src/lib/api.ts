/**
 * Lớp gọi API thô cho module Product / Collection.
 * Chưa tách theo domain, chưa xử lý cache — chỉ đủ để test luồng CRUD.
 */

const BASE_URL =
	process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

// ---------- kiểu dữ liệu, khớp với response của backend ----------

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

export type Collection = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	isActive: boolean;
	createdAt: string;
	products?: Product[];
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

export type CollectionInput = {
	name: string;
	slug: string;
	description: string | null;
	isActive: boolean;
};

// ---------- hàm gọi chung ----------

export class ApiError extends Error {
	public readonly status: number;
	public readonly details: unknown;

	constructor(status: number, message: string, details?: unknown) {
		super(message);
		this.status = status;
		this.details = details;
	}
}

async function request<T>(
	path: string,
	init?: RequestInit,
): Promise<T> {
	const res = await fetch(`${BASE_URL}${path}`, {
		headers: { 'Content-Type': 'application/json' },
		...init,
	});

	if (res.status === 204) {
		return undefined as T;
	}

	const body = await res.json().catch(() => null);

	if (!res.ok) {
		throw new ApiError(
			res.status,
			body?.message ?? `Request failed (${res.status})`,
			body?.errors,
		);
	}

	return normalizeNumbers(body?.data) as T;
}

/**
 * Driver `pg` trả cột NUMERIC dưới dạng chuỗi ("85000.00") để không mất
 * độ chính xác. Chuyển các trường tiền tệ về number để hiển thị.
 */
const NUMERIC_FIELDS = new Set(['unitPrice', 'unitCost']);

function normalizeNumbers(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map(normalizeNumbers);
	}

	if (value !== null && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value as Record<string, unknown>).map(
				([key, val]) => [
					key,
					NUMERIC_FIELDS.has(key) && typeof val === 'string'
						? Number(val)
						: normalizeNumbers(val),
				],
			),
		);
	}

	return value;
}

// ---------- products ----------

export const productApi = {
	getAll: () => request<Product[]>('/products'),

	search: (keyword: string) =>
		request<Product[]>(
			`/products/search?q=${encodeURIComponent(keyword)}`,
		),

	getById: (id: string) => request<Product>(`/products/${id}`),

	getBySlug: (slug: string) =>
		request<Product>(`/products/slug/${slug}`),

	create: (input: ProductInput) =>
		request<Product>('/products', {
			method: 'POST',
			body: JSON.stringify(input),
		}),

	update: (id: string, input: Partial<ProductInput>) =>
		request<Product>(`/products/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(input),
		}),

	remove: (id: string) =>
		request<Product>(`/products/${id}`, { method: 'DELETE' }),

	addTag: (id: string, name: string) =>
		request<ProductTag>(`/products/${id}/tags`, {
			method: 'POST',
			body: JSON.stringify({ name }),
		}),

	removeTag: (id: string, name: string) =>
		request<void>(
			`/products/${id}/tags/${encodeURIComponent(name)}`,
			{ method: 'DELETE' },
		),

	addNote: (id: string, content: string) =>
		request<ProductNote>(`/products/${id}/notes`, {
			method: 'POST',
			body: JSON.stringify({ content }),
		}),

	removeNote: (id: string, noteId: string) =>
		request<void>(`/products/${id}/notes/${noteId}`, {
			method: 'DELETE',
		}),

	updateStock: (id: string, stock: number) =>
		request<ProductStock>(`/products/${id}/stock`, {
			method: 'PATCH',
			body: JSON.stringify({ stock }),
		}),

	setAlert: (
		id: string,
		alertType: StockAlert['alertType'],
		threshold: number,
	) =>
		request<StockAlert>(`/products/${id}/stock/alerts`, {
			method: 'PUT',
			body: JSON.stringify({ alertType, threshold }),
		}),

	removeAlert: (id: string, alertType: StockAlert['alertType']) =>
		request<void>(`/products/${id}/stock/alerts/${alertType}`, {
			method: 'DELETE',
		}),

	assignToCollection: (id: string, collectionId: string) =>
		request<Product>(`/products/${id}/collections`, {
			method: 'POST',
			body: JSON.stringify({ collectionId }),
		}),

	removeFromCollection: (id: string, collectionId: string) =>
		request<Product>(
			`/products/${id}/collections/${collectionId}`,
			{ method: 'DELETE' },
		),
};

// ---------- collections ----------

export const collectionApi = {
	getAll: (onlyActive = false) =>
		request<Collection[]>(
			`/collections${onlyActive ? '?active=true' : ''}`,
		),

	getById: (id: string) => request<Collection>(`/collections/${id}`),

	getProducts: (id: string) =>
		request<Product[]>(`/collections/${id}/products`),

	create: (input: CollectionInput) =>
		request<Collection>('/collections', {
			method: 'POST',
			body: JSON.stringify(input),
		}),

	update: (id: string, input: Partial<CollectionInput>) =>
		request<Collection>(`/collections/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(input),
		}),

	remove: (id: string) =>
		request<Collection>(`/collections/${id}`, { method: 'DELETE' }),
};
