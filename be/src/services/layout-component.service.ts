import { LayoutComponentDao } from '#/daos/layouts/layout-components.dao.js';

import {
	UpdateLayoutComponent,
	UpdateLayoutComponentSchema,
} from '#/models/layout-components/layout-components.model.js';
import { UnprocessableEntityError } from '#/utils/http-errors.js';

export class LayoutComponentService {
	constructor(private readonly layoutComponentDao: LayoutComponentDao) {}

	public updateLayoutComponent = async (payload: UpdateLayoutComponent) => {
		const result = UpdateLayoutComponentSchema.safeParse(payload);
		if (!result.success) {
			throw new UnprocessableEntityError(
				`Invalid layout component schema: ${result.error}`,
			);
		}

		await this.layoutComponentDao.upsertLayoutComponent(result.data);
	};
}
