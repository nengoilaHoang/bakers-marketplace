/**
 * Lỗi mang theo mã HTTP, để controller trả đúng status thay vì
 * luôn luôn 500.
 */
export class HttpError extends Error {
	public readonly status: number;

	constructor(status: number, message: string) {
		super(message);
		this.status = status;
		this.name = 'HttpError';
	}
}

export class NotFoundError extends HttpError {
	constructor(message = 'Resource not found') {
		super(404, message);
		this.name = 'NotFoundError';
	}
}

export class BadRequestError extends HttpError {
	constructor(message = 'Invalid request') {
		super(400, message);
		this.name = 'BadRequestError';
	}
}

export class ConflictError extends HttpError {
	constructor(message = 'Resource already exists') {
		super(409, message);
		this.name = 'ConflictError';
	}
}
