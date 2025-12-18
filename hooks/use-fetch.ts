"use client";
import { useEffect, useState, useCallback, useRef } from "react";

interface ServerError {
  success: false;
  message: string;
  errors?: Record<string, string> | string[];
  code?: string;
  timestamp?: string;
}

interface ServerResponse<T> {
  success: true;
  message: string;
  data?: T;
  meta?: any;
  timestamp?: string;
}

interface UseFetchOptions extends Omit<RequestInit, "cache"> {
  pollInterval?: number;
  auto?: boolean;
  cache?: boolean;
  cacheTTL?: number;
  deps?: any[];
  transform?: (data: any) => any;
  onError?: (error: ServerError | Error) => void;
  onSuccess?: (data: ServerResponse<any>) => void;
  minLoadingDuration?: number;
  forceRefresh?: boolean;
  /** Bypass client cache for specific requests */
  bypassCache?: boolean;
}

interface CacheEntry {
  data: ServerResponse<any>;
  timestamp: number;
  ttl: number;
  etag?: string;
  lastModified?: string;
}

export function useFetch<T = any>(
  url: string | null,
  options: UseFetchOptions = {}
) {
  const {
    pollInterval,
    auto = true,
    cache = false,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    deps = [],
    transform,
    onError,
    onSuccess,
    minLoadingDuration = 400,
    forceRefresh = false,
    bypassCache = false,
    ...fetchOptions
  } = options;

  const [data, setData] = useState<ServerResponse<T> | null>(null);
  const [loading, setLoading] = useState<boolean>(auto);
  const [error, setError] = useState<ServerError | Error | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const loadingStartTimeRef = useRef<number>(0);
  const isInitialMount = useRef(true);

  /** Enhanced cache storage with versioning */
  const cacheVersion = "v1";

  const getCacheKey = (url: string): string => {
    // Include method and body for POST/PUT requests
    const method = fetchOptions.method || "GET";
    const bodyHash = fetchOptions.body
      ? `:${btoa(JSON.stringify(fetchOptions.body)).slice(0, 20)}`
      : "";
    return `fetch-cache:${cacheVersion}:${method}:${url}${bodyHash}`;
  };

  /** Store cache in IndexedDB for larger data (optional) */
  const getCachedData = (url: string): CacheEntry | null => {
    if (!cache || typeof window === "undefined" || bypassCache || forceRefresh) {
      return null;
    }

    try {
      const cacheKey = getCacheKey(url);
      const cached = sessionStorage.getItem(cacheKey);

      if (!cached) return null;

      const entry: CacheEntry = JSON.parse(cached);
      const now = Date.now();

      // Check TTL
      if (now - entry.timestamp > entry.ttl) {
        sessionStorage.removeItem(cacheKey);
        return null;
      }

      return entry;
    } catch (error) {
      console.warn("Failed to parse cache:", error);
      return null;
    }
  };

  const saveToCache = (url: string, data: ServerResponse<any>, headers?: Headers) => {
    if (!cache || typeof window === "undefined" || bypassCache) return;

    try {
      const cacheKey = getCacheKey(url);
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        ttl: cacheTTL,
        etag: headers?.get("ETag") || undefined,
        lastModified: headers?.get("Last-Modified") || undefined
      };

      sessionStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (error) {
      // Clear some cache if storage is full
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        clearOldCache(50); // Clear 50% of oldest cache
        // Retry once
        try {
          const cacheKey = getCacheKey(url);
          const entry: CacheEntry = {
            data,
            timestamp: Date.now(),
            ttl: cacheTTL
          };
          sessionStorage.setItem(cacheKey, JSON.stringify(entry));
        } catch (retryError) {
          console.warn("Cache storage full, cannot save:", retryError);
        }
      }
    }
  };

  /** Clear old cache entries */
  const clearOldCache = (percentage: number = 50) => {
    if (typeof window === "undefined") return;

    try {
      const entries: Array<{ key: string; entry: CacheEntry }> = [];

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith("fetch-cache:")) {
          const value = sessionStorage.getItem(key);
          if (value) {
            try {
              const entry = JSON.parse(value);
              entries.push({ key, entry });
            } catch (e) {
              sessionStorage.removeItem(key);
            }
          }
        }
      }

      // Sort by timestamp (oldest first)
      entries.sort((a, b) => a.entry.timestamp - b.entry.timestamp);

      // Remove oldest percentage
      const toRemove = Math.ceil(entries.length * (percentage / 100));
      for (let i = 0; i < toRemove; i++) {
        sessionStorage.removeItem(entries[i].key);
      }
    } catch (error) {
      console.warn("Failed to clear old cache:", error);
    }
  };

  const clearCache = (url: string) => {
    if (typeof window === "undefined") return;
    const cacheKey = getCacheKey(url);
    sessionStorage.removeItem(cacheKey);
  };

  /** Core fetch with client-side cache */
  const fetchData = useCallback(async () => {
    if (!url) return;

    // 1. Check cache first (only for GET requests)
    const isGetRequest = !fetchOptions.method || fetchOptions.method === "GET";

    if (cache && !bypassCache && !forceRefresh && isGetRequest && isInitialMount.current && auto) {
      const cached = getCachedData(url);
      if (cached) {
        console.log("📦 Serving from cache:", url);
        setData(cached.data);
        setLoading(false);
        onSuccess?.(cached.data);
        isInitialMount.current = false;

        // Refresh in background for fresh data
        fetchFreshData(true); // Pass true for background fetch
        return;
      }
    }

    isInitialMount.current = false;
    await fetchFreshData();
  }, [url, cache, bypassCache, forceRefresh, JSON.stringify(fetchOptions), transform, onError, onSuccess, minLoadingDuration]);

  const fetchFreshData = async (isBackgroundFetch: boolean = false) => {
    if (!url) return;

    if (!isBackgroundFetch) {
      controllerRef.current?.abort();
      const ctrl = new AbortController();
      controllerRef.current = ctrl;

      loadingStartTimeRef.current = Date.now();
      setLoading(true);
      setError(null);
    }

    try {
      // Prepare headers
      const headers = new Headers(fetchOptions.headers);

      // Add conditional request headers if we have cached data
      if (cache && !bypassCache && !forceRefresh) {
        const cached = getCachedData(url);
        if (cached?.etag) {
          headers.set("If-None-Match", cached.etag);
        }
        if (cached?.lastModified) {
          headers.set("If-Modified-Since", cached.lastModified);
        }
      }

      const res = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: !isBackgroundFetch ? controllerRef.current?.signal : undefined,
        credentials: "include",
        // Server has cache-control: no-store, so we must respect it
        cache: "no-store",
      });

      // Handle 304 Not Modified (from conditional request)
      if (res.status === 304 && cache && !bypassCache) {
        console.log("✅ Server returned 304 - data unchanged");
        const cached = getCachedData(url);
        if (cached && !isBackgroundFetch) {
          const elapsed = Date.now() - loadingStartTimeRef.current;
          const remainingTime = Math.max(0, minLoadingDuration - elapsed);
          await new Promise(resolve => setTimeout(resolve, remainingTime));

          setData(cached.data);
          onSuccess?.(cached.data);
        }
        return;
      }

      let responseData;
      try {
        responseData = await res.json();
      } catch (parseError) {
        throw new Error("Invalid JSON response from server");
      }

      if (!isBackgroundFetch) {
        const elapsed = Date.now() - loadingStartTimeRef.current;
        const remainingTime = Math.max(0, minLoadingDuration - elapsed);

        if (!res.ok || (responseData && responseData.success === false)) {
          const serverError: ServerError = {
            success: false,
            message: responseData?.message || `HTTP Error ${res.status}`,
            errors: responseData?.errors,
            code: responseData?.code,
            timestamp: responseData?.timestamp
          };

          await new Promise(resolve => setTimeout(resolve, remainingTime));
          setError(serverError);
          onError?.(serverError);
          return;
        }

        if (responseData && responseData.success === true) {
          const transformedData = transform ? transform(responseData) : responseData;

          await new Promise(resolve => setTimeout(resolve, remainingTime));
          setData(transformedData);

          // Save to cache with response headers
          if (cache && !bypassCache) {
            saveToCache(url, transformedData, res.headers);
          }

          onSuccess?.(transformedData);
        } else {
          const formatError: ServerError = {
            success: false,
            message: "Unexpected response format from server",
            errors: ["Server response missing success flag"]
          };

          await new Promise(resolve => setTimeout(resolve, remainingTime));
          setError(formatError);
          onError?.(formatError);
        }
      } else {
        // Background fetch - just update cache
        if (res.ok && responseData && responseData.success === true && cache && !bypassCache) {
          const transformedData = transform ? transform(responseData) : responseData;
          saveToCache(url, transformedData, res.headers);
        }
      }

    } catch (err: any) {
      if (!isBackgroundFetch && err.name !== "AbortError") {
        const errorObj: Error = err instanceof Error ? err : new Error(err?.message || "Network request failed");

        const elapsed = Date.now() - loadingStartTimeRef.current;
        const remainingTime = Math.max(0, minLoadingDuration - elapsed);

        await new Promise(resolve => setTimeout(resolve, remainingTime));
        setError(errorObj);
        onError?.(errorObj);
      }
    } finally {
      if (!isBackgroundFetch) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (auto) fetchData();
    return () => controllerRef.current?.abort();
  }, [url, ...deps]);

  useEffect(() => {
    if (!pollInterval) return;
    pollRef.current = setInterval(() => fetchFreshData(true), pollInterval);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pollInterval, fetchFreshData]);

  const refetch = useCallback((force: boolean = false) => {
    if (force) {
      clearCache(url!);
      fetchFreshData();
    } else {
      fetchData();
    }
  }, [url, fetchData, fetchFreshData]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
  }, []);

  const startPolling = useCallback(() => {
    if (pollInterval) {
      pollRef.current = setInterval(() => fetchFreshData(true), pollInterval);
    }
  }, [pollInterval, fetchFreshData]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    if (url) clearCache(url);
  }, [url]);

  const clearAllCache = useCallback(() => {
    if (typeof window === "undefined") return;
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith("fetch-cache:")) {
        sessionStorage.removeItem(key);
      }
    });
  }, []);

  /** Prefetch data for future use */
  const prefetch = useCallback(() => {
    if (!url || !cache) return;
    fetchFreshData(true);
  }, [url, cache, fetchFreshData]);

  return {
    data,
    loading,
    error,
    refetch,
    reset,
    startPolling,
    stopPolling,
    clearAllCache,
    clearCache: () => url && clearCache(url),
    prefetch,
    isError: !!error,
    isSuccess: !!data && data.success === true,
    isEmpty: !!data && (!data.data || (Array.isArray(data.data) && data.data.length === 0)),
    isCached: cache && !!getCachedData(url!)
  };
}