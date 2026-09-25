import request from '@/lib/api';
import type {
	Product,
	ProductInput,
	ProductNote,
	ProductStock,
	ProductTag,
	StockAlert,
} from '@/types/product';

export type * from '@/types/product';

export async function getProducts(): Promise<{ data: Product[] }> {
	return request<{ data: Product[] }>('/products');
}

export async function searchProducts(
	keyword: string,
): Promise<{ data: Product[] }> {
	return request<{ data: Product[] }>(
		`/products/search?q=${encodeURIComponent(keyword)}`,
	);
}

export async function getProductById(id: string): Promise<{ data: Product }> {
	return request<{ data: Product }>(`/products/${id}`);
}

export async function getProductBySlug(
	slug: string,
): Promise<{ data: Product }> {
	return request<{ data: Product }>(`/products/slug/${slug}`);
}

export async function createProduct(
	input: ProductInput,
): Promise<{ data: Product }> {
	return request<{ data: Product }>('/products', {
		method: 'POST',
		body: JSON.stringify(input),
	});
}

export async function updateProduct(
	id: string,
	input: Partial<ProductInput>,
): Promise<{ data: Product }> {
	return request<{ data: Product }>(`/products/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(input),
	});
}

export async function deleteProduct(id: string): Promise<{ data: Product }> {
	return request<{ data: Product }>(`/products/${id}`, {
		method: 'DELETE',
	});
}

export async function addProductTag(
	id: string,
	name: string,
): Promise<{ data: ProductTag }> {
	return request<{ data: ProductTag }>(`/products/${id}/tags`, {
		method: 'POST',
		body: JSON.stringify({ name }),
	});
}

export async function removeProductTag(
	id: string,
	name: string,
): Promise<void> {
	return request<void>(`/products/${id}/tags/${encodeURIComponent(name)}`, {
		method: 'DELETE',
	});
}

export async function addProductNote(
	id: string,
	content: string,
): Promise<{ data: ProductNote }> {
	return request<{ data: ProductNote }>(`/products/${id}/notes`, {
		method: 'POST',
		body: JSON.stringify({ content }),
	});
}

export async function removeProductNote(
	id: string,
	noteId: string,
): Promise<void> {
	return request<void>(`/products/${id}/notes/${noteId}`, {
		method: 'DELETE',
	});
}

export async function updateProductStock(
	id: string,
	stock: number,
): Promise<{ data: ProductStock }> {
	return request<{ data: ProductStock }>(`/products/${id}/stock`, {
		method: 'PATCH',
		body: JSON.stringify({ stock }),
	});
}

export async function setProductStockAlert(
	id: string,
	alertType: StockAlert['alertType'],
	threshold: number,
): Promise<{ data: StockAlert }> {
	return request<{ data: StockAlert }>(`/products/${id}/stock/alerts`, {
		method: 'PUT',
		body: JSON.stringify({ alertType, threshold }),
	});
}

export async function removeProductStockAlert(
	id: string,
	alertType: StockAlert['alertType'],
): Promise<void> {
	return request<void>(`/products/${id}/stock/alerts/${alertType}`, {
		method: 'DELETE',
	});
}

export async function assignProductToCollection(
	id: string,
	collectionId: string,
): Promise<{ data: Product }> {
	return request<{ data: Product }>(`/products/${id}/collections`, {
		method: 'POST',
		body: JSON.stringify({ collectionId }),
	});
}

export async function removeProductFromCollection(
	id: string,
	collectionId: string,
): Promise<{ data: Product }> {
	return request<{ data: Product }>(`/products/${id}/collections/${collectionId}`, {
		method: 'DELETE',
	});
}

export const productApi = {
	getAll: getProducts,
	search: searchProducts,
	getById: getProductById,
	getBySlug: getProductBySlug,
	create: createProduct,
	update: updateProduct,
	remove: deleteProduct,
	addTag: addProductTag,
	removeTag: removeProductTag,
	addNote: addProductNote,
	removeNote: removeProductNote,
	updateStock: updateProductStock,
	setAlert: setProductStockAlert,
	removeAlert: removeProductStockAlert,
	assignToCollection: assignProductToCollection,
	removeFromCollection: removeProductFromCollection,
};

export default productApi;
