import request from '@/lib/api';
import type { Collection, CollectionInput } from '@/types/collection';
import type { Product } from '@/types/product';

export type * from '@/types/collection';

export async function getCollections(
	onlyActive = false,
): Promise<{ data: Collection[] }> {
	return request<{ data: Collection[] }>(
		`/collections${onlyActive ? '?active=true' : ''}`,
	);
}

export async function getCollectionById(
	id: string,
): Promise<{ data: Collection }> {
	return request<{ data: Collection }>(`/collections/${id}`);
}

export async function getCollectionProducts(
	id: string,
): Promise<{ data: Product[] }> {
	return request<{ data: Product[] }>(`/collections/${id}/products`);
}

export async function createCollection(
	input: CollectionInput,
): Promise<{ data: Collection }> {
	return request<{ data: Collection }>('/collections', {
		method: 'POST',
		body: JSON.stringify(input),
	});
}

export async function updateCollection(
	id: string,
	input: Partial<CollectionInput>,
): Promise<{ data: Collection }> {
	return request<{ data: Collection }>(`/collections/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(input),
	});
}

export async function deleteCollection(
	id: string,
): Promise<{ data: Collection }> {
	return request<{ data: Collection }>(`/collections/${id}`, {
		method: 'DELETE',
	});
}

export const collectionApi = {
	getAll: getCollections,
	getById: getCollectionById,
	getProducts: getCollectionProducts,
	create: createCollection,
	update: updateCollection,
	remove: deleteCollection,
};

export default collectionApi;
