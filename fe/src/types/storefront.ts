import { PageLayout } from './page-layout';

export type StorefrontRelease = {
	id: string;
	version: number;
	displayName: string;
	layouts: Array<PageLayout>;
	createdAt: Date;
	updatedAt: Date;
	isActive: boolean;
};
