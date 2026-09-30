import type { Request, Response } from 'express';

const COOKIE_CONFIG = {
	access: {
		name: 'accessToken',
		maxAge: 15 * 60 * 1000,
	},
	refresh: {
		name: 'refreshToken',
		maxAge: 7 * 24 * 60 * 60 * 1000,
	},
} as const;

class CookieService {
	public setTokenCookie(
		res: Response,
		token: string,
		type: 'access' | 'refresh',
	): void {
		const config = COOKIE_CONFIG[type];

		res.cookie(config.name, token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: config.maxAge,
			path: '/',
		});
	}

	public clearTokenCookie(
		res: Response,
		type: 'access' | 'refresh',
	): void {
		res.clearCookie(COOKIE_CONFIG[type].name, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
		});
	}

	public getTokenFromRequest(
		req: Request,
		type: 'access' | 'refresh',
	): string | null {
		const token = req.cookies?.[COOKIE_CONFIG[type].name];
		return typeof token === 'string' && token.length > 0 ? token : null;
	}
}

export default new CookieService();
