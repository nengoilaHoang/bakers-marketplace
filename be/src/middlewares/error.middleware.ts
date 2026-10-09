import { HttpError, UnauthorizedError } from '#/utils/http-errors.js';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function errorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof HttpError) {
    console.error(`[ERROR] ${error.statusCode} - ${error.message}`);
  }
  if (error instanceof UnauthorizedError) {
    res.status(401).json({
      message: error.message,
      code: error.code,
    });

    return;
  }
  if (error instanceof ZodError) {
    console.error('[ERROR] Validation failed', error.issues);
    res.status(400).json({
      message: 'Validation failed',
      errors: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });

    return;
  }

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  console.error('[ERROR]', error);

  res.status(500).json({ message: 'Internal server error' });
}
