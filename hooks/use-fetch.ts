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
  /** Re-fetch automatically every X ms */
  pollInterval?: number;
  /** Automatically fetch when mounted */
  auto?: boolean;
  /** Enable simple session cache */
  cache?: boolean;
  /** Refetch when these dependencies change */
  deps?: any[];
  /** Transform response data */
  transform?: (data: any) => any;
  /** Custom error handler */
  onError?: (error: ServerError | Error) => void;
  /** Custom success handler */
  onSuccess?: (data: ServerResponse<any>) => void;
  /** Minimum loading duration in ms (for better UX) */
  minLoadingDuration?: number;
}

export function useFetch<T = any>(
  url: string | null,
  options: UseFetchOptions = {}
) {
  const {
    pollInterval,
    auto = true,
    cache = false,
    deps = [],
    transform,
    onError,
    onSuccess,
    minLoadingDuration = 400, // Default 400ms for better UX
    ...fetchOptions
  } = options;

  const [data, setData] = useState<ServerResponse<T> | null>(null);
  const [loading, setLoading] = useState<boolean>(auto);
  const [error, setError] = useState<ServerError | Error | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const loadingStartTimeRef = useRef<number>(0);

  /** Core fetch logic */
  const fetchData = useCallback(async () => {
    if (!url) return;

    // ✅ Return cached data instantly (optional)
    if (cache && typeof window !== "undefined") {
      const cached = sessionStorage.getItem(url);
      if (cached) {
        try {
          const parsedData = JSON.parse(cached);
          setData(parsedData);
        } catch (e) {
          // Invalid cache, continue with fetch
        }
      }
    }

    controllerRef.current?.abort();
    const ctrl = new AbortController();
    controllerRef.current = ctrl;

    loadingStartTimeRef.current = Date.now();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, {
        ...fetchOptions,
        signal: ctrl.signal,
        credentials: "include", // Important for cookies/sessions
        cache: "no-store",
      });

      let responseData;
      try {
        responseData = await res.json();
      } catch (parseError) {
        throw new Error("Invalid JSON response from server");
      }

      // Calculate remaining time to meet minimum loading duration
      const elapsed = Date.now() - loadingStartTimeRef.current;
      const remainingTime = Math.max(0, minLoadingDuration - elapsed);

      // Handle server error responses
      if (!res.ok || (responseData && responseData.success === false)) {
        const serverError: ServerError = {
          success: false,
          message: responseData?.message || `HTTP Error ${res.status}`,
          errors: responseData?.errors,
          code: responseData?.code,
          timestamp: responseData?.timestamp
        };

        // Wait for minimum loading duration before updating state
        await new Promise(resolve => setTimeout(resolve, remainingTime));
        
        setError(serverError);
        onError?.(serverError);
        return;
      }

      // Handle success response
      if (responseData && responseData.success === true) {
        const transformedData = transform ? transform(responseData) : responseData;
        
        // Wait for minimum loading duration before updating state
        await new Promise(resolve => setTimeout(resolve, remainingTime));
        
        setData(transformedData);
        
        if (cache && typeof window !== "undefined") {
          sessionStorage.setItem(url, JSON.stringify(transformedData));
        }
        
        onSuccess?.(transformedData);
      } else {
        // Handle unexpected response format
        const formatError: ServerError = {
          success: false,
          message: "Unexpected response format from server",
          errors: ["Server response missing success flag"]
        };
        
        // Wait for minimum loading duration before updating state
        await new Promise(resolve => setTimeout(resolve, remainingTime));
        
        setError(formatError);
        onError?.(formatError);
      }

    } catch (err: any) {
      if (err.name !== "AbortError") {
        const errorObj: Error = err instanceof Error ? err : new Error(err?.message || "Network request failed");
        
        // Calculate remaining time to meet minimum loading duration
        const elapsed = Date.now() - loadingStartTimeRef.current;
        const remainingTime = Math.max(0, minLoadingDuration - elapsed);
        
        // Wait for minimum loading duration before updating state
        await new Promise(resolve => setTimeout(resolve, remainingTime));
        
        setError(errorObj);
        onError?.(errorObj);
      }
    } finally {
      setLoading(false);
    }
  }, [url, cache, JSON.stringify(fetchOptions), transform, onError, onSuccess, minLoadingDuration]);

  /** Auto-fetch on mount or deps change */
  useEffect(() => {
    if (auto) fetchData();
    return () => controllerRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...deps]);

  /** Polling for live data */
  useEffect(() => {
    if (!pollInterval) return;
    pollRef.current = setInterval(fetchData, pollInterval);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pollInterval, fetchData]);

  /** Manual refetch */
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  /** Stop polling manually */
  const stopPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
  }, []);

  /** Start polling manually */
  const startPolling = useCallback(() => {
    if (pollInterval) {
      pollRef.current = setInterval(fetchData, pollInterval);
    }
  }, [pollInterval, fetchData]);

  /** Reset state */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    reset,
    startPolling,
    stopPolling,
    isError: !!error,
    isSuccess: !!data && data.success === true,
    isEmpty: !!data && (!data.data || (Array.isArray(data.data) && data.data.length === 0))
  };
}