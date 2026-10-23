import userSocialDAO from '#/daos/users/user-social.dao.js';
import type { UserReportCreate } from '#/models/users/user-social.model.js';
import { BadRequestError, NotFoundError } from '#/utils/http-errors.js';

class UserSocialService {
  public async getProfile(userId: string, viewerId?: string) {
    const profile = await userSocialDAO.getProfile(userId, viewerId);
    if (!profile) throw new NotFoundError('Không tìm thấy người dùng.');
    return profile;
  }

  public async setFollow(actorId: string, userId: string, following: boolean) {
    if (actorId.toLowerCase() === userId.toLowerCase()) {
      throw new BadRequestError('Bạn không thể tự theo dõi chính mình.');
    }
    return userSocialDAO.setFollow(actorId, userId, following);
  }

  public async report(actorId: string, userId: string, payload: UserReportCreate) {
    if (actorId.toLowerCase() === userId.toLowerCase()) {
      throw new BadRequestError('Bạn không thể tự báo cáo chính mình.');
    }
    return userSocialDAO.createReport(actorId, userId, payload);
  }
}

export default new UserSocialService();
