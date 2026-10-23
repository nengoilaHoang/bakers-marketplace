import db from '#/db/index.js';
import type { Knex } from 'knex';
import type { PublicUserProfile, UserFollowStatus, UserReportCreate, UserReportReceipt } from '#/models/users/user-social.model.js';
import { ConflictError, NotFoundError } from '#/utils/http-errors.js';

class UserSocialDAO {
  public async getProfile(userId: string, viewerId?: string): Promise<PublicUserProfile | null> {
    const query = db.instance('users as u')
      .select('u.id', { displayName: 'u.displayname' }, 'u.createdAt')
      .select(db.instance.raw('(SELECT COUNT(*)::int FROM user_follows WHERE following_id = u.id) AS follower_count'))
      .select(db.instance.raw('(SELECT COUNT(*)::int FROM user_follows WHERE follower_id = u.id) AS following_count'));

    if (viewerId) {
      query.select(db.instance.raw('EXISTS (SELECT 1 FROM user_follows WHERE follower_id = ? AND following_id = u.id) AS following', [viewerId]));
    } else {
      query.select(db.instance.raw('false AS following'));
    }

    return await query.where('u.id', userId).first() ?? null;
  }

  public async setFollow(actorId: string, userId: string, following: boolean): Promise<UserFollowStatus> {
    return db.instance.transaction(async (trx) => {
      // Serialize changes to this target so the returned count matches this action.
      await this.lockTarget(trx, userId);
      if (following) {
        await trx('user_follows').insert({ followerId: actorId, followingId: userId })
          .onConflict(['followerId', 'followingId']).ignore();
      } else {
        await trx('user_follows').where({ followerId: actorId, followingId: userId }).delete();
      }
      const count = await trx('user_follows').where({ followingId: userId }).count('* as count').first();
      return { following, followerCount: Number(count?.count ?? 0) };
    });
  }

  public async createReport(actorId: string, userId: string, payload: UserReportCreate): Promise<UserReportReceipt> {
    return db.instance.transaction(async (trx) => {
      // A transaction alone cannot prevent two concurrent requests from both seeing no report.
      await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [`user-report:${actorId}:${userId}`]);
      const target = await trx('users').select('id').where('id', userId).forKeyShare().first();
      if (!target) throw new NotFoundError('Không tìm thấy người dùng.');

      const duplicate = await trx('user_reports as ur').join('reports as r', 'r.id', 'ur.id')
        .where({ 'ur.reportedUserId': userId, 'r.reporterId': actorId, 'r.status': 'OPEN' })
        .select('ur.id').first();
      if (duplicate) throw new ConflictError('Bạn đã có báo cáo đang chờ xử lý cho người dùng này.');

      const [report] = await trx('reports').insert({
        reporterId: actorId,
        reason: payload.reason,
        description: payload.description || null,
        status: 'OPEN',
      }).returning(['id', 'status']);
      await trx('user_reports').insert({ id: report.id, reportedUserId: userId });
      return report as UserReportReceipt;
    });
  }

  private async lockTarget(trx: Knex.Transaction, userId: string): Promise<void> {
    await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [`user-follow:${userId}`]);
    // Key-share permits reciprocal follows without deadlocking on FK checks.
    const target = await trx('users').select('id').where('id', userId).forKeyShare().first();
    if (!target) throw new NotFoundError('Không tìm thấy người dùng.');
  }
}

export default new UserSocialDAO();
