import { useEffect, useState } from 'react';

import { getPosts } from '@/services/posts';
import type { Post } from '@/types/post';

export function useLatestPosts(limit = 3) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPosts() {
      try {
        const page = await getPosts({ signal: controller.signal });

        if (!controller.signal.aborted) {
          setPosts(page.posts.slice(0, limit));
        }
      } catch {
        if (!controller.signal.aborted) {
          setHasError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    // Lets React StrictMode finish its development-only effect cycle first.
    const requestTimer = window.setTimeout(() => void loadPosts(), 0);

    return () => {
      window.clearTimeout(requestTimer);
      controller.abort();
    };
  }, [limit]);

  return { posts, isLoading, hasError };
}
