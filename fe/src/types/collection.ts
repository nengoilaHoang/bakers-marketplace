import type { Product } from './product';

export type Collection = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	isActive: boolean;
	createdAt: string;
	products?: Product[];
};

export type CollectionInput = {
	name: string;
	slug: string;
	description: string | null;
	isActive: boolean;
};
