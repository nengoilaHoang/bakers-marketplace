import type { Request, Response } from 'express';
import { z } from 'zod';
import authAccountDAO from '#/daos/users/auth-accounts.dao.js';
import userDAO from '#/daos/users/users.dao.js';
import { UserCreateSchema } from '#/models/users/users.model.js';
import authenMailService from '#/services/authen/authen-mail.service.js';
import authenRedisService from '#/services/authen/authen-redis.service.js';
import bcryptService from '#/services/authen/bcrypt.service.js';
import cookieService from '#/services/authen/cookie.service.js';
import googleOAuthService from '#/services/authen/google-oauth.service.js';
import jwtService from '#/services/authen/jwt.service.js';
import redisService from '#/services/redis.service.js';
import asyncHandler from '#/utils/asyncHandler.js';
import {
	ConflictError,
	InternalServerError,
	NotFoundError,
	UnauthorizedError,
} from '#/utils/http-errors.js';

const RegisterSchema = UserCreateSchema.omit({
	hashedPassword: true,
	role: true,
}).extend({
	password: z.string().min(8).max(72),
});

const LoginSchema = z.object({
	email: z.email().max(255),
	password: z.string().min(1).max(72),
});

const GoogleLoginSchema = z.object({
	code: z.string().trim().min(1),
	redirectUri: z.url(),
});

const GoogleRegisterSchema = GoogleLoginSchema.extend({
	displayName: z.string().trim().min(1).max(255),
});

const ResetPasswordSchema = z.object({
	email: z.string().trim().pipe(z.email().max(255)),
});

const ChangePasswordSchema = z.object({
	password: z.string().min(8).max(72),
	confirmPassword: z.string().min(8).max(72),
}).refine(({ password, confirmPassword }) => password === confirmPassword, {
	message: 'Passwords do not match',
	path: ['confirmPassword'],
});

type AuthenticatedRequest = Request & {
	userId: string;
};

class AuthenController {
	public register = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const input = RegisterSchema.parse(req.body);
			const { password, ...userInfo } = input;

			await authenRedisService.saveUnverifiedUser(
				{
					...userInfo,
					hashedPassword: null,
					role: 'CUSTOMER',
				},
				password,
			);

			res.status(202).json({
				message: 'Verification email sent',
			});
		},
	);

	public verify = asyncHandler(
		async (
			req: Request<{ code: string }>,
			res: Response,
		): Promise<void> => {
			const code = req.params.code?.trim();
			const pendingUser = code
				? await authenRedisService.checkVerificationStatus(code)
				: null;

			if (!pendingUser) {
				throw new NotFoundError('Verification code is invalid or expired');
			}

			const createdUser = await userDAO.create({
				...pendingUser.userInfo,
				hashedPassword: null,
			});

			if (!createdUser.id) {
				throw new InternalServerError('Created user id is missing');
			}

			try {
				const passwordSaved = await bcryptService.savePassword(
					createdUser.id,
					pendingUser.password,
				);

				if (!passwordSaved) {
					throw new InternalServerError('Password could not be saved');
				}

				await jwtService.generateToken(createdUser, 'access', res);
				await jwtService.generateToken(createdUser, 'refresh', res);
				await redisService.delete(`verify-email:${code}`);
			} catch (error) {
				cookieService.clearTokenCookie(res, 'access');
				cookieService.clearTokenCookie(res, 'refresh');
				await userDAO.delete(createdUser.id);
				throw error;
			}

			res.status(201).json({
				data: createdUser,
			});
		},
	);

	public login = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const input = LoginSchema.parse(req.body);
			const passwordMatched = await bcryptService.checkPassword(
				input.email,
				input.password,
			);

			if (!passwordMatched) {
				throw new UnauthorizedError('Email or password is incorrect');
			}

			const user = await userDAO.getByEmail(input.email);

			if (!user) {
				throw new UnauthorizedError('Email or password is incorrect');
			}

			try {
				await jwtService.generateToken(user, 'access', res);
				await jwtService.generateToken(user, 'refresh', res);
			} catch (error) {
				cookieService.clearTokenCookie(res, 'access');
				cookieService.clearTokenCookie(res, 'refresh');
				throw error;
			}

			res.status(200).json({ data: user });
		},
	);

	public loginWithGoogle = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const input = GoogleLoginSchema.parse(req.body);
			const googleProfile = await googleOAuthService.exchangeCode(
				input.code,
				input.redirectUri,
			);
			const authAccount = await authAccountDAO.getByProviderIdentity(
				'GOOGLE',
				googleProfile.providerUserId,
			);

			if (!authAccount) {
				throw new UnauthorizedError(
					'Google account is not registered',
					'GOOGLE_ACCOUNT_NOT_REGISTERED',
				);
			}

			const user = await userDAO.getById(authAccount.userId);

			if (!user) {
				throw new UnauthorizedError(
					'Google account is no longer available',
					'GOOGLE_ACCOUNT_NOT_AVAILABLE',
				);
			}

			try {
				await jwtService.generateToken(user, 'access', res);
				await jwtService.generateToken(user, 'refresh', res);
			} catch (error) {
				cookieService.clearTokenCookie(res, 'access');
				cookieService.clearTokenCookie(res, 'refresh');
				throw error;
			}

			res.status(200).json({ data: user });
		},
	);

	public registerWithGoogle = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const input = GoogleRegisterSchema.parse(req.body);
			const googleProfile = await googleOAuthService.exchangeCode(
				input.code,
				input.redirectUri,
			);
			const existingAuthAccount = await authAccountDAO.getByProviderIdentity(
				'GOOGLE',
				googleProfile.providerUserId,
			);

			if (existingAuthAccount) {
				throw new ConflictError('Google account is already registered');
			}

			const existingUser = await userDAO.getByEmail(googleProfile.email);

			if (existingUser) {
				throw new ConflictError('An account with this email already exists');
			}

			const createdUser = await userDAO.create({
				email: googleProfile.email,
				displayName: input.displayName,
				hashedPassword: null,
				role: 'CUSTOMER',
			});

			if (!createdUser.id) {
				throw new InternalServerError('Created user id is missing');
			}

			try {
				await authAccountDAO.create({
					userId: createdUser.id,
					provider: 'GOOGLE',
					providerUserId: googleProfile.providerUserId,
				});
				await jwtService.generateToken(createdUser, 'access', res);
				await jwtService.generateToken(createdUser, 'refresh', res);
			} catch (error) {
				cookieService.clearTokenCookie(res, 'access');
				cookieService.clearTokenCookie(res, 'refresh');
				await userDAO.delete(createdUser.id);
				throw error;
			}

			res.status(201).json({ data: createdUser });
		},
	);

	public resetPassword = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { email } = ResetPasswordSchema.parse(req.body);
			const user = await userDAO.getCredentialsByEmail(email);

			if (user?.hashedPassword == null) {
				throw new NotFoundError(
					'Account was not found or cannot reset its password',
				);
			}

			await this.sendPasswordResetEmail(user.email);

			res.status(202).json({
				message: 'Reset password email sent',
			});
		},
	);

	public resetCurrentUserPassword = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const user = await userDAO.getById(req.userId);

			if (!user) {
				throw new NotFoundError('Account is no longer available');
			}

			const credentials = await userDAO.getCredentialsByEmail(user.email);

			if (credentials?.hashedPassword == null) {
				throw new NotFoundError(
					'Account was not found or cannot reset its password',
				);
			}

			await this.sendPasswordResetEmail(user.email, user.displayName);

			res.status(202).json({
				message: 'Reset password email sent',
			});
		},
	);

	public changePassword = asyncHandler(
		async (
			req: Request<{ code: string }>,
			res: Response,
		): Promise<void> => {
			const code = req.params.code?.trim();
			const { password } = ChangePasswordSchema.parse(req.body);
			const email = code
				? await authenRedisService.getPasswordResetEmail(code)
				: null;

			if (!email) {
				throw new NotFoundError('Reset password code is invalid or expired');
			}

			const credentials = await userDAO.getCredentialsByEmail(email);

			if (!credentials?.id || credentials.hashedPassword == null) {
				await authenRedisService.deletePasswordReset(code);
				throw new NotFoundError(
					'Account was not found or cannot reset its password',
				);
			}

			const passwordSaved = await bcryptService.savePassword(
				credentials.id,
				password,
			);

			if (!passwordSaved) {
				throw new InternalServerError('Password could not be changed');
			}

			await authenRedisService.deletePasswordReset(code);

			res.status(200).json({
				message: 'Password changed successfully',
			});
		},
	);

	public logout = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const refreshToken = cookieService.getTokenFromRequest(req, 'refresh');

			try {
				if (refreshToken) {
					const userId = jwtService.getUserIdFromRefreshToken(refreshToken);

					if (userId) {
						await bcryptService.deleteRefreshToken(userId, refreshToken);
					}
				}
			} finally {
				cookieService.clearTokenCookie(res, 'access');
				cookieService.clearTokenCookie(res, 'refresh');
			}

			res.status(204).send();
		},
	);

	public getSession = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const refreshToken = cookieService.getTokenFromRequest(req, 'refresh');
			const refreshUserId = refreshToken
				? jwtService.getUserIdFromRefreshToken(refreshToken)
				: null;

			if (!refreshToken || refreshUserId !== req.userId) {
				cookieService.clearTokenCookie(res, 'access');
				cookieService.clearTokenCookie(res, 'refresh');
				throw new UnauthorizedError(
					'An active access and refresh token pair is required',
					'SESSION_REQUIRED',
				);
			}

			const activeSession = await bcryptService.checkRefreshToken(
				req.userId,
				refreshToken,
			);

			if (!activeSession) {
				cookieService.clearTokenCookie(res, 'access');
				cookieService.clearTokenCookie(res, 'refresh');
				throw new UnauthorizedError(
					'Session is no longer active',
					'SESSION_INVALID',
				);
			}

			const user = await userDAO.getById(req.userId);

			if (!user) {
				cookieService.clearTokenCookie(res, 'access');
				cookieService.clearTokenCookie(res, 'refresh');
				throw new UnauthorizedError(
					'Account is no longer available',
					'SESSION_INVALID',
				);
			}

			res.status(200).json({ data: user });
		},
	);

	public refreshToken = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const refreshToken =
			cookieService.getTokenFromRequest(req, 'refresh');
			if (!refreshToken) {
				throw new UnauthorizedError(
					'Refresh token is required',
					'REFRESH_TOKEN_REQUIRED',
				);
			}
			await jwtService.refreshToken(refreshToken, res);

			res.status(200).json({
				message: 'Token refreshed successfully',
			});
		},
	);

	private async sendPasswordResetEmail(
		email: string,
		displayName?: string,
	): Promise<void> {
		const code = await authenRedisService.savePasswordReset(email);
		const frontendUrl = process.env.FE_URL?.trim();

		try {
			if (!frontendUrl) {
				throw new Error('FE_URL is not configured');
			}

			const resetPasswordUrl = new URL(
				`/authen/reset-password/${encodeURIComponent(code)}`,
				frontendUrl,
			).toString();
			const emailSent = await authenMailService.sendResetPasswordEmail(
				email,
				resetPasswordUrl,
				displayName,
			);

			if (!emailSent) {
				throw new InternalServerError(
					'Reset password email could not be sent',
				);
			}
		} catch (error) {
			await authenRedisService.deletePasswordReset(code);
			throw error;
		}
	}
	
}

export default new AuthenController();
