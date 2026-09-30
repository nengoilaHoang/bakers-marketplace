import type { NextFunction, Request, Response } from 'express';
import jwtService from '#/services/authen/jwt.service.js';
import cookieService from '#/services/authen/cookie.service.js';
import { UnauthorizedError } from '#/utils/http-errors.js';

export function authenMiddleware(
	request: Request,
	_response: Response,
	next: NextFunction,
): void {
	try {
		const accessToken = cookieService.getTokenFromRequest(request, 'access');

		if (!accessToken) {
			throw new UnauthorizedError(
				'Access token is required',
				'ACCESS_TOKEN_REQUIRED',
			);
		}

		Object.assign(request, {
			userId: jwtService.getUserIdFromAccessToken(accessToken),
		});

		next();
	} catch (error) {
		next(error);
	}
}
