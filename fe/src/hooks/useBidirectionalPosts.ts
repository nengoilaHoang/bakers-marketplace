import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { getCurrentUser, getPostFeedPage } from '@/services/posts';
import type { Post, PostCursor } from '@/types/post';

type UseBidirectionalPostsOptions = {
  q: string;
  tag: string;
  enabled?: boolean;
};

type ScrollAnchor = {
  postId: string;
  top: number;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function toCursor(post: Post): PostCursor {
  return { createdAt: post.createdAt, id: post.id };
}

function mergeUniquePosts(
  newerPosts: Post[],
  currentPosts: Post[],
  olderPosts: Post[],
): Post[] {
  const ids = new Set<string>();

  return [...newerPosts, ...currentPosts, ...olderPosts].filter((post) => {
    if (ids.has(post.id)) {
      return false;
    }

    ids.add(post.id);
    return true;
  });
}

export function getFeedPostElementId(postId: string): string {
  return `feed-post-${postId}`;
}

export function useBidirectionalPosts({
  q,
  tag,
  enabled = true,
}: UseBidirectionalPostsOptions) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingNewer, setIsLoadingNewer] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [initialError, setInitialError] = useState<string | null>(null);
  const [newerError, setNewerError] = useState<string | null>(null);
  const [olderError, setOlderError] = useState<string | null>(null);
  const [hasMoreNewer, setHasMoreNewer] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const postsRef = useRef<Post[]>([]);
  const activeControllerRef = useRef<AbortController | null>(null);
  const isRequestingRef = useRef(false);
  const activeSearchKeyRef = useRef('');
  const pendingScrollAnchorRef = useRef<ScrollAnchor | null>(null);
  const topCanTriggerRef = useRef(false);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const searchKey = `${q}\u001f${tag}`;

  const commitPosts = useCallback(
    (update: (currentPosts: Post[]) => Post[]) => {
      setPosts((currentPosts) => {
        const nextPosts = update(currentPosts);
        postsRef.current = nextPosts;
        return nextPosts;
      });
    },
    [],
  );

  useEffect(() => {
    activeSearchKeyRef.current = searchKey;
    activeControllerRef.current?.abort();
    activeControllerRef.current = null;
    isRequestingRef.current = false;
    pendingScrollAnchorRef.current = null;
    topCanTriggerRef.current = false;
    postsRef.current = [];

    const controller = new AbortController();
    let isActive = true;
    activeControllerRef.current = controller;

    async function loadInitialPosts() {
      if (isRequestingRef.current) {
        return;
      }

      isRequestingRef.current = true;

      try {
        // Refresh the access token first when possible so viewer flags are correct.
        await getCurrentUser().catch(() => null);
        const page = await getPostFeedPage({
          direction: 'initial',
          search: { q, tag },
          signal: controller.signal,
        });

        if (!isActive || controller.signal.aborted) {
          return;
        }

        const initialPosts = mergeUniquePosts(
          page.newerPosts,
          [],
          page.olderPosts,
        );
        postsRef.current = initialPosts;
        setPosts(initialPosts);
        setHasMoreNewer(page.hasMoreNewer);
        setHasMoreOlder(page.hasMoreOlder);
        setInitialError(null);
      } catch (error) {
        if (isActive && !controller.signal.aborted && !isAbortError(error)) {
          setInitialError(getErrorMessage(error));
        }
      } finally {
        if (isActive) {
          setIsInitialLoading(false);
        }

        if (activeControllerRef.current === controller) {
          activeControllerRef.current = null;
          isRequestingRef.current = false;
        }
      }
    }

    // Defer both the reset and request so React Strict Mode can finish its
    // development-only setup/cleanup cycle without cascading effect renders.
    const requestTimer = window.setTimeout(() => {
      setPosts([]);
      setInitialError(null);
      setNewerError(null);
      setOlderError(null);
      setHasMoreNewer(false);
      setHasMoreOlder(false);
      setIsLoadingNewer(false);
      setIsLoadingOlder(false);
      setIsInitialLoading(true);

      if (enabled) {
        void loadInitialPosts();
      }
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(requestTimer);
      controller.abort();

      if (activeControllerRef.current === controller) {
        activeControllerRef.current = null;
        isRequestingRef.current = false;
      }
    };
  }, [attempt, enabled, q, searchKey, tag]);

  const loadNewer = useCallback(async () => {
    const currentPosts = postsRef.current;

    if (!enabled || currentPosts.length === 0 || isRequestingRef.current) {
      return;
    }

    const requestSearchKey = searchKey;
    const firstPost = currentPosts[0];
    const lastPost = currentPosts.at(-1);

    if (!lastPost) {
      return;
    }

    const controller = new AbortController();
    activeControllerRef.current = controller;
    isRequestingRef.current = true;
    setIsLoadingNewer(true);
    setNewerError(null);

    try {
      const page = await getPostFeedPage({
        direction: 'newer',
        newest: toCursor(firstPost),
        oldest: toCursor(lastPost),
        search: { q, tag },
        signal: controller.signal,
      });

      if (
        controller.signal.aborted ||
        activeSearchKeyRef.current !== requestSearchKey
      ) {
        return;
      }

      if (page.newerPosts.length > 0) {
        const anchor = document.getElementById(
          getFeedPostElementId(firstPost.id),
        );

        if (anchor) {
          pendingScrollAnchorRef.current = {
            postId: firstPost.id,
            top: anchor.getBoundingClientRect().top,
          };
        }
      }

      commitPosts((current) =>
        mergeUniquePosts(page.newerPosts, current, page.olderPosts),
      );
      setHasMoreNewer(page.hasMoreNewer);
      setHasMoreOlder(page.hasMoreOlder);
    } catch (error) {
      if (!controller.signal.aborted && !isAbortError(error)) {
        setNewerError(getErrorMessage(error));
      }
    } finally {
      if (activeControllerRef.current === controller) {
        activeControllerRef.current = null;
        isRequestingRef.current = false;
        setIsLoadingNewer(false);
      }
    }
  }, [commitPosts, enabled, q, searchKey, tag]);

  const loadOlder = useCallback(async () => {
    const currentPosts = postsRef.current;

    if (
      !enabled ||
      !hasMoreOlder ||
      currentPosts.length === 0 ||
      isRequestingRef.current
    ) {
      return;
    }

    const requestSearchKey = searchKey;
    const firstPost = currentPosts[0];
    const lastPost = currentPosts.at(-1);

    if (!lastPost) {
      return;
    }

    const controller = new AbortController();
    activeControllerRef.current = controller;
    isRequestingRef.current = true;
    setIsLoadingOlder(true);
    setOlderError(null);

    try {
      const page = await getPostFeedPage({
        direction: 'older',
        newest: toCursor(firstPost),
        oldest: toCursor(lastPost),
        search: { q, tag },
        signal: controller.signal,
      });

      if (
        controller.signal.aborted ||
        activeSearchKeyRef.current !== requestSearchKey
      ) {
        return;
      }

      commitPosts((current) =>
        mergeUniquePosts(page.newerPosts, current, page.olderPosts),
      );
      setHasMoreNewer(page.hasMoreNewer);
      setHasMoreOlder(page.hasMoreOlder);
    } catch (error) {
      if (!controller.signal.aborted && !isAbortError(error)) {
        setOlderError(getErrorMessage(error));
      }
    } finally {
      if (activeControllerRef.current === controller) {
        activeControllerRef.current = null;
        isRequestingRef.current = false;
        setIsLoadingOlder(false);
      }
    }
  }, [commitPosts, enabled, hasMoreOlder, q, searchKey, tag]);

  useLayoutEffect(() => {
    const pendingAnchor = pendingScrollAnchorRef.current;

    if (!pendingAnchor) {
      return;
    }

    pendingScrollAnchorRef.current = null;
    const anchor = document.getElementById(
      getFeedPostElementId(pendingAnchor.postId),
    );

    if (!anchor) {
      return;
    }

    const offset = anchor.getBoundingClientRect().top - pendingAnchor.top;

    if (offset !== 0) {
      window.scrollBy(0, offset);
    }
  }, [posts]);

  useEffect(() => {
    const sentinel = bottomSentinelRef.current;

    if (
      !sentinel ||
      isInitialLoading ||
      isLoadingOlder ||
      isLoadingNewer ||
      !hasMoreOlder ||
      olderError ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isRequestingRef.current) {
          void loadOlder();
        }
      },
      { rootMargin: '400px 0px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    hasMoreOlder,
    isInitialLoading,
    isLoadingNewer,
    isLoadingOlder,
    loadOlder,
    olderError,
  ]);

  useEffect(() => {
    const sentinel = topSentinelRef.current;

    if (
      !sentinel ||
      isInitialLoading ||
      posts.length === 0 ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          topCanTriggerRef.current = true;
          return;
        }

        if (
          topCanTriggerRef.current &&
          !isRequestingRef.current &&
          !newerError
        ) {
          topCanTriggerRef.current = false;
          void loadNewer();
        }
      },
      { rootMargin: '400px 0px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isInitialLoading, loadNewer, newerError, posts.length]);

  const retryInitial = useCallback(() => {
    setAttempt((currentAttempt) => currentAttempt + 1);
  }, []);

  const updatePost = useCallback(
    (postId: string, update: (post: Post) => Post) => {
      commitPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId ? update(post) : post,
        ),
      );
    },
    [commitPosts],
  );

  return {
    posts,
    isInitialLoading,
    isLoadingNewer,
    isLoadingOlder,
    initialError,
    newerError,
    olderError,
    hasMoreNewer,
    hasMoreOlder,
    topSentinelRef,
    bottomSentinelRef,
    loadNewer,
    loadOlder,
    retryInitial,
    updatePost,
  };
}
