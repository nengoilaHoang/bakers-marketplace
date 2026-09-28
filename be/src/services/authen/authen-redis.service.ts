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
const RESET_PASSWORD_PREFIX = 'reset-password:';
const RESET_PASSWORD_TTL_SECONDS = 15 * 60;

class AuthenRedisService {
	public async saveUnverifiedUser(
		userInfo: UserCreate,
		password: string,
	): Promise<string> {
		const parsedUser = UserCreateSchema.parse(userInfo);
		const existingUser = await userDAO.getCredentialsByEmail(parsedUser.email);

		if (existingUser) {
			throw new ConflictError('Email is already registered');
		}

		const code = randomBytes(32).toString('hex');
		const key = `${VERIFY_EMAIL_PREFIX}${code}`;

		await redisService.set(
			key,
			{ userInfo: parsedUser, password },
			VERIFY_EMAIL_TTL_SECONDS,
		);

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

	public async checkVerificationStatus(code: string): Promise<{
		userInfo: UserCreate;
		password: string;
	} | null> {
		const normalizedCode = code.trim();

		if (!normalizedCode) {
			return null;
		}

		const data = await redisService.get<{
			userInfo: UserCreate;
			password: string;
		}>(
			`${VERIFY_EMAIL_PREFIX}${normalizedCode}`,
		);
		const parsedUser = UserCreateSchema.safeParse(data?.userInfo);

		if (!parsedUser.success || !data?.password) {
			return null;
		}

		return {
			userInfo: parsedUser.data,
			password: data.password,
		};
	}

	public async savePasswordReset(email: string): Promise<string> {
		const code = randomBytes(32).toString('hex');
		const key = `${RESET_PASSWORD_PREFIX}${code}`;

		await redisService.set(key, email, RESET_PASSWORD_TTL_SECONDS);

		return code;
	}

	public async getPasswordResetEmail(code: string): Promise<string | null> {
		const normalizedCode = code.trim();

		if (!normalizedCode) {
			return null;
		}

		const email = await redisService.get<unknown>(
			`${RESET_PASSWORD_PREFIX}${normalizedCode}`,
		);

		return typeof email === 'string' && email.length > 0 ? email : null;
	}

	public async deletePasswordReset(code: string): Promise<boolean> {
		const normalizedCode = code.trim();

		if (!normalizedCode) {
			return false;
		}

		return redisService.delete(`${RESET_PASSWORD_PREFIX}${normalizedCode}`);
	}
}

export default new AuthenRedisService();
