import type { NextFunction, Request, Response } from 'express';
import jwtService from '#/services/authen/jwt.service.js';
import cookieService from '#/services/authen/cookie.service.js';
import { ForbiddenError, UnauthorizedError } from '#/utils/http-errors.js';
import { UserRole } from '#/models/users/users.model.js';
import { OptionalAuthenticatedRequest } from '#/types/request.types.js';

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
    const { id, role } =
      jwtService.getUserIdAndRoleFromAccessToken(accessToken);

    Object.assign(request, {
      user: {
        id,
        role,
      },
    });

    next();
  } catch (error) {
    next(error);
  }
}

/** Attaches userId when a valid access token is present; never rejects the request. */
export function optionalAuthenMiddleware(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  const accessToken = cookieService.getTokenFromRequest(request, 'access');

  if (accessToken) {
    try {
      const { id, role } =
        jwtService.getUserIdAndRoleFromAccessToken(accessToken);
      Object.assign(request, {
        user: {
          id,
          role,
        },
      });
    } catch {
      // Invalid or expired token: continue as an anonymous viewer
    }
  }

  next();
}

export function validateRole(allowedRoles: UserRole[]) {
  return (
    req: OptionalAuthenticatedRequest,
    _res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      throw new UnauthorizedError(
        'User is not authenticated',
        'USER_NOT_AUTHENTICATED',
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        'User does not have sufficient privileges to access this.',
        'USER_FORBIDDEN',
      );
    }

    next();
  };
}
