const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

type QueryPrimitive = string | number | boolean;
type QueryValue =
	| QueryPrimitive
	| readonly (QueryPrimitive | null | undefined)[]
	| null
	| undefined;

export class ApiError extends Error {
	public readonly status: number;
	public readonly details: unknown;

	constructor(status: number, message: string, details?: unknown) {
		super(message);
		this.status = status;
		this.details = details;
	}
}

export default async function request<T>(
	path: string,
	init?: RequestInit,
	query?: Record<string, QueryValue>,
): Promise<T> {
	const url = new URL(`${BASE_URL}${path}`);
	if (query) {
		for (const [key, value] of Object.entries(query)) {
			const values = Array.isArray(value) ? value : [value];

			for (const item of values) {
				if (item !== undefined && item !== null) {
					url.searchParams.append(key, String(item));
				}
			}
		}
	}

	// Get only the part after the domain name, e.g. "/api/products" instead of "http://localhost:4000/api/products"
	const relativeUrl = url.pathname + url.search;

	const res = await fetch(relativeUrl, {
		headers: { 'Content-Type': 'application/json' },
		credentials: init?.credentials ?? 'include',
		...init,
	});

	if (res.status === 204) {
		return undefined as T;
	}

	const body = await res.json().catch(() => null);

	if (!res.ok) {
		throw new ApiError(
			res.status,
			body?.message ?? `Request failed (${res.status})`,
			body?.errors,
		);
	}

	return {
		...body,
		data: normalizeNumbers(body?.data),
	} as T;
}

/**
 * Driver `pg` trả cột NUMERIC dưới dạng chuỗi ("85000.00") để không mất
 * độ chính xác. Chuyển các trường tiền tệ về number để hiển thị.
 */
const NUMERIC_FIELDS = new Set(['unitPrice', 'unitCost']);

function normalizeNumbers(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map(normalizeNumbers);
	}

	if (value !== null && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value as Record<string, unknown>).map(([key, val]) => [
				key,
				NUMERIC_FIELDS.has(key) && typeof val === 'string'
					? Number(val)
					: normalizeNumbers(val),
			]),
		);
	}

	return value;
}
