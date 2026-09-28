import { createHash } from 'node:crypto';
import bcrypt from 'bcrypt';
import sessionDAO from '#/daos/users/sessions.dao.js';
import userDAO from '#/daos/users/users.dao.js';
import type { Session } from '#/models/users/sessions.model.js';

const SALT_ROUNDS = 12;

class BcryptService {
	public async savePassword(userId: string, password: string): Promise<boolean> {
		if (!userId) {
			throw new Error('User id is required');
		}

		if (!password) {
			throw new Error('Password is required');
		}

		const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

		return userDAO.updatePassword(userId, { hashedPassword });
	}

	public async checkPassword(email: string, password: string): Promise<boolean> {
		if (!email || !password) {
			return false;
		}

		const credentials = await userDAO.getCredentialsByEmail(email.trim());

		if (!credentials?.hashedPassword) {
			return false;
		}

		return bcrypt.compare(password, credentials.hashedPassword);
	}

	public async saveRefreshToken(
		userId: string,
		refreshToken: string,
	): Promise<Session> {
		if (!userId || !refreshToken) {
			throw new Error('User id and refresh token are required');
		}

		const tokenDigest = createHash('sha256').update(refreshToken).digest();
		const refreshTokenHash = await bcrypt.hash(tokenDigest, SALT_ROUNDS);

		return sessionDAO.create({ userId, refreshTokenHash });
	}

	public async checkRefreshToken(
		userId: string,
		refreshToken: string,
	): Promise<Session | null> {
		if (!userId || !refreshToken) {
			return null;
		}

		const sessions = await sessionDAO.getByUserId(userId);
		const tokenDigest = createHash('sha256').update(refreshToken).digest();

		for (const session of sessions) {
			if (await bcrypt.compare(tokenDigest, session.refreshTokenHash)) {
				return session;
			}
		}

		return null;
	}

	public async changeRefreshToken(
		sessionId: string,
		refreshToken: string,
	): Promise<boolean> {
		if (!sessionId || !refreshToken) {
			return false;
		}

		const tokenDigest = createHash('sha256').update(refreshToken).digest();
		const refreshTokenHash = await bcrypt.hash(tokenDigest, SALT_ROUNDS);
		const updatedSession = await sessionDAO.update(sessionId, {
			refreshTokenHash,
		});

		return updatedSession !== null;
	}
}

export default new BcryptService();
