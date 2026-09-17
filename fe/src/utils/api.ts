type QueryValue = string | number | boolean | null | undefined;

type ApiRequestOptions = RequestInit & {
  query?: Record<string, QueryValue>;
};

type ErrorResponse = {
  message?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getApiBaseUrl(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!configuredUrl) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_API_URL. Hãy cấu hình URL API trong file env của frontend.",
    );
  }

  try {
    const url = new URL(configuredUrl);

    // Avoid accidental duplicate slashes in values such as ...:4000//api.
    url.pathname = url.pathname.replace(/\/{2,}/g, "/").replace(/\/$/, "");
    url.search = "";
    url.hash = "";

    return url;
  } catch {
    throw new Error("NEXT_PUBLIC_API_URL phải là một URL hợp lệ.");
  }
}

export function createApiUrl(
  path: string,
  query?: Record<string, QueryValue>,
): string {
  const url = getApiBaseUrl();
  const endpoint = path.replace(/^\/+/, "");

  url.pathname = `${url.pathname}/${endpoint}`.replace(/\/{2,}/g, "/");

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ErrorResponse;
    return body.message || `API trả về lỗi ${response.status}.`;
  } catch {
    return `API trả về lỗi ${response.status}.`;
  }
}

export async function apiRequest<T>(
  path: string,
  { query, headers, ...requestInit }: ApiRequestOptions = {},
): Promise<T> {
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }

  const response = await fetch(createApiUrl(path, query), {
    ...requestInit,
    credentials: requestInit.credentials ?? "include",
    headers: requestHeaders,
  });

  if (!response.ok) {
    throw new ApiError(await getErrorMessage(response), response.status);
  }

  return (await response.json()) as T;
}
