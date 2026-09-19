import type {
	Request,
	Response,
	NextFunction,
} from 'express';

import { ZodError } from 'zod';

import { HttpError } from '#/errors/http.error.js';

/**
 * Middleware cuối cùng của chuỗi: đổi lỗi ném ra từ controller
 * thành response JSON với đúng mã HTTP.
 */
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
		res.status(error.status).json({ message: error.message });

		return;
	}

	console.error('[ERROR]', error);

	res.status(500).json({ message: 'Internal server error' });
}
