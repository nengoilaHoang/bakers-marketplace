import { useRouter } from 'next/router';
import { useCallback } from 'react';

type QueryPatch = Record<string, string | number | undefined>;

// Bộ lọc của trang danh sách nằm trên URL (?status=…&page=…), nên link tới
// một danh sách đã lọc được và F5 không mất bộ lọc.
export function useUrlFilters() {
  const router = useRouter();

  const update = useCallback(
    (patch: QueryPatch) => {
      const next: QueryPatch = { ...(router.query as QueryPatch), ...patch };

      // Đổi bộ lọc thì quay về trang đầu.
      if (!('page' in patch)) delete next.page;

      for (const key of Object.keys(next)) {
        if (next[key] === undefined || next[key] === '') delete next[key];
      }

      void router.replace({ pathname: router.pathname, query: next }, undefined, {
        shallow: true,
        scroll: false,
      });
    },
    [router],
  );

  return { query: router.query, isReady: router.isReady, update };
}

export function readString(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' && value ? value : undefined;
}

export function readEnum<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
): T | undefined {
  const text = readString(value);
  return allowed.find((item) => item === text);
}

export function readPage(value: string | string[] | undefined): number {
  const page = Number(readString(value));
  return Number.isInteger(page) && page > 0 ? page : 1;
}
