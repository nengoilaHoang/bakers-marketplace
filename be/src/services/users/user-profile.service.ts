import userDAO from '#/daos/users/users.dao.js';
import authAccountDAO from '#/daos/users/auth-accounts.dao.js';
import type { UserProfileUpdate } from '#/models/users/user-profile.model.js';
import { NotFoundError } from '#/utils/http-errors.js';

class UserProfileService {
  public async getSettings(userId: string) {
    const user = await userDAO.getById(userId);
    if (!user) throw new NotFoundError('Tài khoản không còn tồn tại.');
    const [account, credentials] = await Promise.all([
      authAccountDAO.getByUserId(userId),
      userDAO.getCredentialsByEmail(user.email),
    ]);
    return {
      authProvider: account?.provider ?? null,
      canChangeEmail: account?.provider !== 'GOOGLE',
      canResetPassword: credentials?.id === userId && credentials.hashedPassword != null,
    };
  }

  public async update(userId: string, payload: UserProfileUpdate) {
    const user = await userDAO.update(userId, { displayName: payload.displayName });
    if (!user) throw new NotFoundError('Tài khoản không còn tồn tại.');
    return user;
  }
}

export default new UserProfileService();
