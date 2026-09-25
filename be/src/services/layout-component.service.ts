import layoutComponentDao, {
	LayoutComponentDao,
} from '#/daos/layouts/layout-components.dao.js';

import {
	UpdateLayoutComponent,
	UpdateLayoutComponentSchema,
} from '#/models/layout-components/layout-components.model.js';
import { UnprocessableEntityError } from '#/utils/http-errors.js';
import { z } from 'zod';

export class LayoutComponentService {
	constructor(private readonly layoutComponentDao: LayoutComponentDao) {}

	public update = async (payload: UpdateLayoutComponent) => {
		const result = UpdateLayoutComponentSchema.safeParse(payload);
		if (!result.success) {
			throw new UnprocessableEntityError(
				`Invalid layout component schema: ${result.error}`,
			);
		}

		await this.layoutComponentDao.upsertLayoutComponent(result.data);
	};

	public delete = async (ids: string[]) => {
		const result = z.uuidv4().array().safeParse(ids);
		if (!result.success) {
			throw new UnprocessableEntityError(
				`Invalid layout component IDs: ${result.error}`,
			);
		}

		await this.layoutComponentDao.deleteComponents(result.data);
	};
}

const layoutComponentService = new LayoutComponentService(layoutComponentDao);
export default layoutComponentService;
