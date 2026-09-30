import jwt, { type JwtPayload } from 'jsonwebtoken';
import { z } from 'zod';
import {
	InternalServerError,
	UnauthorizedError,
} from '#/utils/http-errors.js';

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

const GoogleTokenResponseSchema = z.object({
	id_token: z.string().min(1),
});

const GoogleTokenErrorSchema = z.object({
	error: z.string().optional(),
	error_description: z.string().optional(),
});

const GoogleIdTokenSchema = z.object({
	iss: z.enum(['https://accounts.google.com', 'accounts.google.com']),
	aud: z.union([z.string(), z.array(z.string())]),
	sub: z.string().min(1),
	email: z.email(),
	email_verified: z.union([z.boolean(), z.literal('true'), z.literal('false')]),
	name: z.string().trim().min(1).optional(),
	exp: z.number().int(),
});

export type GoogleProfile = {
	providerUserId: string;
	email: string;
	displayName: string;
};

class GoogleOAuthService {
	public async exchangeCode(
		code: string,
		redirectUri: string,
	): Promise<GoogleProfile> {
		const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
		const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

		if (!clientId || !clientSecret) {
			throw new InternalServerError('Google OAuth is not configured');
		}

		this.assertAllowedRedirectUri(redirectUri);

		const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				code,
				client_id: clientId,
				client_secret: clientSecret,
				redirect_uri: redirectUri,
				grant_type: 'authorization_code',
			}),
		});

		if (!response.ok) {
			const errorBody = GoogleTokenErrorSchema.safeParse(
				await response.json().catch(() => null),
			);
			const googleError = errorBody.success ? errorBody.data : {};

			console.error('[GOOGLE_OAUTH_TOKEN_ERROR]', {
				status: response.status,
				error: googleError.error ?? 'unknown_error',
				description: googleError.error_description ?? 'No description',
			});

			if (googleError.error === 'invalid_client') {
				throw new UnauthorizedError(
					'Google OAuth client secret does not match the configured client ID',
					'GOOGLE_CLIENT_INVALID',
				);
			}

			throw new UnauthorizedError(
				'Google authorization code is invalid or expired',
				'GOOGLE_AUTHORIZATION_CODE_REJECTED',
			);
		}

		const tokenResponse = GoogleTokenResponseSchema.safeParse(
			await response.json(),
		);

		if (!tokenResponse.success) {
			throw new UnauthorizedError('Google did not return a valid identity token');
		}

		const decodedToken = jwt.decode(tokenResponse.data.id_token);
		const claims = GoogleIdTokenSchema.safeParse(
			typeof decodedToken === 'string' || decodedToken === null
				? null
				: (decodedToken as JwtPayload),
		);

		if (!claims.success) {
			throw new UnauthorizedError('Google identity token is invalid');
		}

		const audiences = Array.isArray(claims.data.aud)
			? claims.data.aud
			: [claims.data.aud];
		const emailVerified =
			claims.data.email_verified === true ||
			claims.data.email_verified === 'true';

		if (
			!audiences.includes(clientId) ||
			claims.data.exp * 1000 <= Date.now() ||
			!emailVerified
		) {
			throw new UnauthorizedError('Google identity could not be verified');
		}

		return {
			providerUserId: claims.data.sub,
			email: claims.data.email.toLowerCase(),
			displayName:
				claims.data.name ?? claims.data.email.split('@')[0] ?? 'Google User',
		};
	}

	private assertAllowedRedirectUri(redirectUri: string): void {
		const allowedRedirectUris = [
			process.env.GOOGLE_REDIRECT_URI,
			process.env.GOOGLE_REGISTER_REDIRECT_URI,
		]
			.map((value) => value?.trim())
			.filter((value): value is string => Boolean(value));

		if (allowedRedirectUris.length === 0) {
			throw new InternalServerError('Google redirect URI is not configured');
		}

		if (!allowedRedirectUris.includes(redirectUri)) {
			throw new UnauthorizedError('Google redirect URI is not allowed');
		}
	}
}

export default new GoogleOAuthService();
