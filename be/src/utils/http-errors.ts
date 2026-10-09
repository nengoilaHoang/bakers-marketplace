export class HttpError extends Error {
	constructor(
		readonly statusCode: number = 500,
		readonly message: string,
		readonly code?: string,
	) {
		super(message);
		this.name = new.target.name;
	}
}

export class BadRequestError extends HttpError {
	constructor(message = 'Bad request', code?: string) {
		super(400, message, code);
	}
}

export class UnauthorizedError extends HttpError {
	constructor(
		message: string,
		readonly code?: string,
	) {
		super(401, message, code);
	}
}

export class ForbiddenError extends HttpError {
	constructor(message = 'Forbidden', code?: string) {
		super(403, message, code);
	}
}

export class NotFoundError extends HttpError {
	constructor(message = 'Not found', code?: string) {
		super(404, message, code);
	}
}

export class ConflictError extends HttpError {
	constructor(message = 'Conflict', code?: string) {
		super(409, message, code);
	}
}

export class UnprocessableEntityError extends HttpError {
	constructor(message = 'Unprocessable entity', code?: string) {
		super(422, message, code);
	}
}

export class InternalServerError extends HttpError {
	constructor(message = 'Internal server error', code?: string) {
		super(500, message, code);
	}
}
