import { randomUUID } from 'node:crypto';
import type { Response } from 'express';
import jwt, {
	type JwtPayload,
	type SignOptions,
} from 'jsonwebtoken';
import bcryptService from '#/services/authen/bcrypt.service.js';
import cookieService from '#/services/authen/cookie.service.js';
import {
	UserInfoSchema,
	type UserInfo,
} from '#/models/users/users.model.js';
import { UnauthorizedError } from '#/utils/http-errors.js';

const TOKEN_CONFIG = {
	access: {
		secretEnvironmentKey: 'ACCESS_TOKEN_SECRET',
		expiresIn: '15m',
	},
	refresh: {
		secretEnvironmentKey: 'REFRESH_TOKEN_SECRET',
		expiresIn: '7d',
	},
} as const;

class JwtService {
	public async generateToken(
		userInfo: UserInfo,
		type: 'access' | 'refresh',
		res: Response,
	): Promise<string> {
		const payload = this.toTokenPayload(userInfo);
		const token = this.signToken(payload, type);

		if (type === 'refresh') {
			if (!payload.id) {
				throw new UnauthorizedError('Token user id is missing');
			}

			await bcryptService.saveRefreshToken(payload.id, token);
		}

		cookieService.setTokenCookie(res, token, type);

		return token;
	}

	public async refreshToken(refreshToken: string, res: Response): Promise<{
		accessToken: string;
		refreshToken?: string;
	}> {
		if (!refreshToken) {
			throw new UnauthorizedError('Refresh token is required');
		}

		let payload: UserInfo;
		let isExpired = false;

		try {
			payload = this.parsePayload(
				jwt.verify(refreshToken, this.getSecret('refresh')),
			);
		} catch (error) {
			if (!(error instanceof jwt.TokenExpiredError)) {
				if (error instanceof UnauthorizedError) {
					throw error;
				}

				throw new UnauthorizedError('Refresh token is invalid');
			}

			const decoded = jwt.decode(refreshToken);

			if (!decoded) {
				throw new UnauthorizedError('Expired refresh token could not be decoded');
			}

			payload = this.parsePayload(decoded);
			isExpired = true;
		}

		const userId = payload.id;

		if (!userId) {
			throw new UnauthorizedError('Token user id is missing');
		}

		const session = await bcryptService.checkRefreshToken(userId, refreshToken);

		if (!session) {
			throw new UnauthorizedError('Refresh token is not associated with an active session');
		}

		const accessToken = this.signToken(payload, 'access');

		if (!isExpired) {
			cookieService.setTokenCookie(res, accessToken, 'access');
			return { accessToken };
		}

		if (!session.id) {
			throw new UnauthorizedError('Session id is missing');
		}

		const newRefreshToken = this.signToken(payload, 'refresh');
		const changed = await bcryptService.changeRefreshToken(
			session.id,
			newRefreshToken,
		);

		if (!changed) {
			throw new UnauthorizedError('Refresh token has already been rotated');
		}

		cookieService.setTokenCookie(res, accessToken, 'access');
		cookieService.setTokenCookie(res, newRefreshToken, 'refresh');

		return {
			accessToken,
			refreshToken: newRefreshToken,
		};
	}

	public getUserIdAndRoleFromAccessToken(accessToken: string): { id: string; role: string } {
		if (!accessToken) {
			throw new UnauthorizedError(
				'Access token is required',
				'ACCESS_TOKEN_REQUIRED',
			);
		}

		const secret = this.getSecret('access');

		try {
			const payload = this.parsePayload(
				jwt.verify(accessToken, secret),
			);

			if (!payload.id) {
				throw new UnauthorizedError(
					'Token user id is missing',
					'ACCESS_TOKEN_INVALID',
				);
			}

			return {
				id: payload.id,
				role: payload.role,
			}
		} catch (error) {
			if (error instanceof jwt.TokenExpiredError) {
				throw new UnauthorizedError(
					'Access token has expired',
					'ACCESS_TOKEN_EXPIRED',
				);
			}

			if (error instanceof UnauthorizedError) {
				throw error;
			}

			throw new UnauthorizedError(
				'Access token is invalid',
				'ACCESS_TOKEN_INVALID',
			);
		}
	}

	public getUserIdFromRefreshToken(refreshToken: string): string | null {
		if (!refreshToken) {
			return null;
		}

		const secret = this.getSecret('refresh');

		try {
			const payload = this.parsePayload(
				jwt.verify(refreshToken, secret, { ignoreExpiration: true }),
			);

			return payload.id ?? null;
		} catch {
			return null;
		}
	}

	private signToken(
		userInfo: UserInfo,
		type: 'access' | 'refresh',
	): string {
		const config = TOKEN_CONFIG[type];
		const options: SignOptions = {
			expiresIn: config.expiresIn,
			jwtid: randomUUID(),
		};

		return jwt.sign(userInfo, this.getSecret(type), options);
	}

	private parsePayload(payload: string | JwtPayload): UserInfo {
		const parsed = UserInfoSchema.safeParse(payload);

		if (!parsed.success || !parsed.data.id) {
			throw new UnauthorizedError('Token payload is invalid');
		}

		return parsed.data;
	}

	private toTokenPayload(userInfo: UserInfo): UserInfo {
		const parsed = UserInfoSchema.safeParse(userInfo);

		if (!parsed.success || !parsed.data.id) {
			throw new Error('A valid user id is required to generate a token');
		}

		const {
			createdAt: _createdAt,
			updatedAt: _updatedAt,
			...payload
		} = parsed.data;

		return payload;
	}

	private getSecret(type: 'access' | 'refresh'): string {
		const environmentKey = TOKEN_CONFIG[type].secretEnvironmentKey;
		const secret = process.env[environmentKey]?.trim();

		if (!secret) {
			throw new Error(`${environmentKey} is not configured`);
		}

		return secret;
	}

}

export default new JwtService();
