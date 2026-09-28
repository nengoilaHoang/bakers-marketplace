import type { Request, Response } from 'express';
import { z } from 'zod';
import userDAO from '#/daos/users/users.dao.js';
import { UserCreateSchema } from '#/models/users/users.model.js';
import authenRedisService from '#/services/authen/authen-redis.service.js';
import bcryptService from '#/services/authen/bcrypt.service.js';
import cookieService from '#/services/authen/cookie.service.js';
import jwtService from '#/services/authen/jwt.service.js';
import redisService from '#/services/redis.service.js';
import asyncHandler from '#/utils/asyncHandler.js';
import {
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
	
}

export default new AuthenController();
