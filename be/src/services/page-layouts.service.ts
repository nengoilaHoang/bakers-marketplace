import pageLayoutDao, { PageLayoutDao } from '#/daos/layouts/page-layout.dao.js';
import {
	CompositeComponent,
	CompositeComponentSchema,
} from '#/models/layout-components/composite/composite-components.model.js';
import { UnprocessableEntityError } from '#/utils/http-errors.js';

export class PageLayoutService {
	constructor(private readonly pageLayoutDao: PageLayoutDao) {}

	public ensureExists = async (pageId: string) => {
		// Skip for now
	};

	// public ensureBelongsTo = async (
	// 	pageId: string,
	// 	releaseId?: string,
	// 	storeId?: string,
	// ) => {
	// 	const exists = await this.pageLayoutDao.checkIfExists(
	// 		pageId,
	// 		releaseId,
	// 		storeId,
	// 	);

	// 	if (!exists && releaseId && storeId) {
	// 		throw new NotFoundError(
	// 			`Page layout with id '${pageId}' does not belong to release '${releaseId}' and store '${storeId}'`,
	// 		);
	// 	}

	// 	if (!exists && releaseId) {
	// 		throw new NotFoundError(
	// 			`Page layout with id '${pageId}' does not belong to release '${releaseId}'`,
	// 		);
	// 	}

	// 	if (!exists) {
	// 		throw new NotFoundError(
	// 			`Page layout with id '${pageId}' does not exist.`,
	// 		);
	// 	}
	// };

	public updatePageLayout = async (
		pageId: string,
		root: CompositeComponent,
	) => {
		const result = CompositeComponentSchema.safeParse(root);
		if (!result.success) {
			throw new UnprocessableEntityError(
				`Invalid layout component schema: ${result.error}`,
			);
		}

		await this.pageLayoutDao.updatePageLayout(pageId, result.data);
	};
}

const pageLayoutService = new PageLayoutService(pageLayoutDao);
export default pageLayoutService;
