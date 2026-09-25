import { ApiError } from "@/lib/api";
import {
  getStorefrontActiveRelease,
  getStorefrontRelease,
} from "@/services/storefront";
import { StorefrontRelease } from "@/types/storefront";
import { useEffect, useState } from "react";

const useStorefront = (storeId: string, releaseId?: string) => {
  const [release, setRelease] = useState<StorefrontRelease | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadStorefront = async () => {
      let data: StorefrontRelease;
      if (!releaseId) {
        data = await getStorefrontActiveRelease(storeId, controller.signal);
      } else {
        data = await getStorefrontRelease(
          storeId,
          releaseId,
          controller.signal,
        );
      }
      try {
        if (data) {
          setRelease(() => data);
        } else {
          setRelease(() => null);
        }
      } catch (e) {
        if (e instanceof Error) {
          if (e.name === "AbortError" || controller.signal.aborted) {
            console.log("Request was aborted");
          } else if (e instanceof ApiError) {
            console.error("Error loading storefront:", e.message, "Status code:", e.status);
          } else {
            console.error("Error loading storefront:", e.message);
          }
        }
      }
    };

    const timeoutId = setTimeout(() => {
      loadStorefront();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [storeId, releaseId]);

  const isLoading = release === null;
  return { release, setRelease, isLoading };
};

export default useStorefront;
