import { useCallback, useEffect, useRef, useState } from 'react';

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'Không thể tải dữ liệu. Vui lòng thử lại.';
}

// Tải dữ liệu cho một trang quản trị. `key` đổi (bộ lọc, trang, id) thì tải lại.
// `load` có thể đổi giữa các lần render; hook luôn gọi bản mới nhất.
// `enabled` = false: chờ (ví dụ router chưa có query), chưa gọi API.
export function useAdminData<T>(
  load: (signal: AbortSignal) => Promise<T>,
  key: string,
  enabled = true,
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const loadRef = useRef(load);

  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();

    async function run() {
      try {
        const result = await loadRef.current(controller.signal);

        if (!controller.signal.aborted) {
          setData(result);
          setError(null);
        }
      } catch (requestError) {
        if (!controller.signal.aborted) setError(getErrorMessage(requestError));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    // Để StrictMode chạy xong vòng effect của môi trường dev trước khi gọi API.
    const requestTimer = window.setTimeout(() => void run(), 0);

    return () => {
      window.clearTimeout(requestTimer);
      controller.abort();
    };
  }, [key, attempt, enabled]);

  // Tải lại ngầm (giữ dữ liệu cũ trên màn hình), dùng sau một thao tác.
  const reload = useCallback(() => setAttempt((current) => current + 1), []);

  return { data, isLoading, error, reload, setData };
}
