import userDAO from '#/daos/users/users.dao.js';
import { NotFoundError } from '#/utils/http-errors.js';
import type { PublicProfile } from '#/models/users/users.model.js';

class UserService {
	private userDAO = userDAO;

	public async getPublicProfile(id: string): Promise<PublicProfile> {
		const profile = await this.userDAO.getPublicProfile(id);

		if (!profile) {
			throw new NotFoundError('User not found');
		}

		return profile;
	}
}

export default new UserService();
