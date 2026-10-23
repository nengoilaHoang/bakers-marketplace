import { randomBytes } from 'node:crypto';
import userDAO from '#/daos/users/users.dao.js';
import authAccountDAO from '#/daos/users/auth-accounts.dao.js';
import { PendingEmailChangeSchema, type PendingEmailChange } from '#/models/users/user-profile.model.js';
import type { UserInfo } from '#/models/users/users.model.js';
import redisService from '#/services/redis.service.js';
import authenMailService from '#/services/authen/authen-mail.service.js';
import { BadRequestError, ConflictError, ForbiddenError, InternalServerError, NotFoundError } from '#/utils/http-errors.js';

const TTL_SECONDS = 15 * 60;
type Step = 'current' | 'new';

class EmailChangeService {
  public async start(userId: string, newEmail: string): Promise<void> {
    const user = await userDAO.getById(userId);
    if (!user) throw new NotFoundError('Tài khoản không còn tồn tại.');
    await this.assertEmailChangeAllowed(userId);
    await this.assertEmailAvailable(user, newEmail);
    await this.sendStep({
      userId,
      currentEmail: user.email,
      newEmail,
      stage: 'WAITING_CURRENT_CONFIRMATION',
    }, 'current', user.displayName);
  }

  public async inspect(token: string) {
    const current = await redisService.get<unknown>(`change-email:current:${token}`);
    const raw = current ?? await redisService.get<unknown>(`change-email:new:${token}`);
    const parsed = PendingEmailChangeSchema.safeParse(raw);
    if (!parsed.success) throw this.invalidToken();
    const pending = parsed.data;
    await this.assertCurrentAccount(pending);
    return { stage: pending.stage, newEmail: pending.newEmail };
  }

  public async confirmCurrent(token: string, newEmail: string): Promise<void> {
    const pending = await this.readToken(token, 'current');
    if (pending.newEmail !== newEmail) {
      throw new BadRequestError('Vui lòng nhập lại đúng email mới đã yêu cầu.');
    }
    const user = await this.assertCurrentAccount(pending);
    await this.assertEmailAvailable(user, newEmail);

    // Consume only after validation, but before mail. GETDEL prevents parallel replay.
    const consumed = await this.readToken(token, 'current', true);
    await this.sendStep({ ...consumed, stage: 'WAITING_NEW_CONFIRMATION' }, 'new', user.displayName);
  }

  public async complete(token: string): Promise<{ email: string }> {
    const pending = await this.readToken(token, 'new', true);
    await this.assertCurrentAccount(pending);
    // The DAO checks currentEmail again under a row lock and handles unique races.
    // The consumed token stays invalid even if the DB operation fails.
    await userDAO.changeEmail(pending.userId, pending.currentEmail, pending.newEmail);
    return { email: pending.newEmail };
  }

  private async readToken(token: string, step: Step, consume = false): Promise<PendingEmailChange> {
    const key = `change-email:${step}:${token}`;
    const raw = consume ? await redisService.take<unknown>(key) : await redisService.get<unknown>(key);
    const parsed = PendingEmailChangeSchema.safeParse(raw);
    const expectedStage = step === 'current' ? 'WAITING_CURRENT_CONFIRMATION' : 'WAITING_NEW_CONFIRMATION';
    if (!parsed.success || parsed.data.stage !== expectedStage) throw this.invalidToken();
    return parsed.data;
  }

  private async assertCurrentAccount(pending: PendingEmailChange): Promise<UserInfo> {
    const user = await userDAO.getById(pending.userId);
    if (!user || user.email !== pending.currentEmail) throw this.invalidToken();
    await this.assertEmailChangeAllowed(pending.userId);
    return user;
  }

  private async assertEmailChangeAllowed(userId: string): Promise<void> {
    const account = await authAccountDAO.getByUserId(userId);
    if (account?.provider === 'GOOGLE') {
      throw new ForbiddenError('Tài khoản đăng nhập bằng Google không được đổi email.');
    }
  }

  private async assertEmailAvailable(user: UserInfo, newEmail: string): Promise<void> {
    if (user.email.trim().toLowerCase() === newEmail.trim().toLowerCase()) {
      throw new BadRequestError('Email mới phải khác email hiện tại.');
    }
    if (await userDAO.getByEmailInsensitive(newEmail)) {
      throw new ConflictError('Email mới đã tồn tại trong hệ thống. Vui lòng chọn email khác.');
    }
  }

  private async sendStep(pending: PendingEmailChange, step: Step, displayName: string): Promise<void> {
    const token = randomBytes(32).toString('hex');
    const key = `change-email:${step}:${token}`;
    await redisService.set(key, pending, TTL_SECONDS);
    try {
      const frontendUrl = process.env.FE_URL?.trim();
      if (!frontendUrl) throw new Error('FE_URL is not configured');
      const actionUrl = new URL(`/authen/change-email/${token}`, frontendUrl).toString();
      const sent = await authenMailService.sendEmailChange(
        step === 'current' ? pending.currentEmail : pending.newEmail,
        actionUrl,
        step,
        pending.newEmail,
        displayName,
      );
      if (!sent) throw new Error('Email delivery failed');
    } catch {
      await redisService.delete(key);
      throw new InternalServerError('Không thể gửi email xác nhận. Vui lòng bắt đầu lại trong Cài đặt.');
    }
  }

  private invalidToken(): NotFoundError {
    return new NotFoundError('Liên kết không hợp lệ, đã hết hạn hoặc đã được sử dụng. Vui lòng bắt đầu lại trong Cài đặt.');
  }
}

export default new EmailChangeService();
