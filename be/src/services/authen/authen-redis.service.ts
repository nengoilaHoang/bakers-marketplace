import { randomBytes } from 'node:crypto';
import userDAO from '#/daos/users/users.dao.js';
import {
	UserCreateSchema,
	type UserCreate,
} from '#/models/users/users.model.js';
import authenMailService from '#/services/authen/authen-mail.service.js';
import redisService from '#/services/redis.service.js';
import {
	ConflictError,
	InternalServerError,
} from '#/utils/http-errors.js';

const VERIFY_EMAIL_PREFIX = 'verify-email:';
const VERIFY_EMAIL_TTL_SECONDS = 15 * 60;

class AuthenRedisService {
	public async saveUnverifiedUser(userInfo: UserCreate): Promise<string> {
		const parsedUser = UserCreateSchema.parse(userInfo);
		const existingUser = await userDAO.getCredentialsByEmail(parsedUser.email);

		if (existingUser) {
			throw new ConflictError('Email is already registered');
		}

		const code = randomBytes(32).toString('hex');
		const key = `${VERIFY_EMAIL_PREFIX}${code}`;

		await redisService.set(key, parsedUser, VERIFY_EMAIL_TTL_SECONDS);

		const frontendUrl = process.env.FE_URL?.trim();

		if (!frontendUrl) {
			await redisService.delete(key);
			throw new Error('FE_URL is not configured');
		}

		const verificationUrl = new URL(
			`/authen/verify/${encodeURIComponent(code)}`,
			frontendUrl,
		).toString();
		try {
			const emailSent = await authenMailService.sendVerificationEmail(
				parsedUser.email,
				verificationUrl,
				parsedUser.displayName,
			);

			if (!emailSent) {
				throw new InternalServerError('Verification email could not be sent');
			}
		} catch (error) {
			await redisService.delete(key);
			throw error;
		}

		return code;
	}

	public async checkVerificationStatus(code: string): Promise<UserCreate | null> {
		const normalizedCode = code.trim();

		if (!normalizedCode) {
			return null;
		}

		const data = await redisService.get<UserCreate>(
			`${VERIFY_EMAIL_PREFIX}${normalizedCode}`,
		);
		const parsedUser = UserCreateSchema.safeParse(data);

		return parsedUser.success ? parsedUser.data : null;
	}
}

export default new AuthenRedisService();
