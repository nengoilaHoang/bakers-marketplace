import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '#/utils/http-errors.js';

export function errorMiddleware(
	error: unknown,
	req: Request,
	res: Response,
	_next: NextFunction,
): void {
	if (error instanceof ZodError) {
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
		res.status(Number(error.code)).json({ message: error.message });
		return;
	}

	console.error('[ERROR]', error);

	res.status(500).json({ message: 'Internal server error' });
}
