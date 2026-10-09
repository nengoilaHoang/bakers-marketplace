import { UserRole } from '#/models/users/users.model.js';
import { Request } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';

interface AuthUser {
  id: string;
  role: UserRole;
}

export interface AuthenticatedRequest<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Query,
  Locals extends Record<string, any> = Record<string, any>,
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  user: AuthUser;
}

export interface OptionalAuthenticatedRequest<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Query,
  Locals extends Record<string, any> = Record<string, any>,
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  user?: AuthUser;
}
