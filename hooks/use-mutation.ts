"use client";
import { useState, useCallback, useRef } from "react";

interface ServerError {
  success: false;
  message: string;
  errors?: Record<string, string> | string[];
  code?: string;
  timestamp?: string;
}

interface ServerResponse<TData> {
  success: true;
  message: string;
  data?: TData;
  meta?: any;
  timestamp?: string;
}

interface MutationOptions<TData, TVariables> extends RequestInit {
  onSuccess?: (data: ServerResponse<TData>) => void;
  onError?: (error: ServerError | Error) => void;
  onSettled?: () => void;
  /** Optional optimistic update before network response */
  optimisticUpdate?: (variables: TVariables) => void;
  /** Rollback optimistic update on error */
  rollbackOptimisticUpdate?: (variables: TVariables) => void;
  /** Minimum loading duration in ms (for better UX) */
  minLoadingDuration?: number;
}

export function useMutation<TData = any, TVariables = any>(
  url: string,
  options: MutationOptions<TData, TVariables> = {}
) {
  const { 
    onSuccess, 
    onError, 
    onSettled, 
    optimisticUpdate, 
    rollbackOptimisticUpdate,
    minLoadingDuration = 400, // Default 400ms for better UX
    ...fetchOptions 
  } = options;

  const [data, setData] = useState<ServerResponse<TData> | null>(null);
  const [error, setError] = useState<ServerError | Error | null>(null);
  const [loading, setLoading] = useState(false);
  const loadingStartTimeRef = useRef<number>(0);

  const mutate = useCallback(
    async (variables?: TVariables) => {
      try {
        loadingStartTimeRef.current = Date.now();
        setLoading(true);
        setError(null);
        setData(null);

        // Optimistic UI update (optional)
        if (optimisticUpdate && variables) {
          optimisticUpdate(variables);
        }

        const res = await fetch(url, {
          ...fetchOptions,
          method: fetchOptions.method || "POST",
          headers: {
            "Content-Type": "application/json",
            ...(fetchOptions.headers || {}),
          },
          credentials: "include", // Important for cookies/sessions
          body: variables ? JSON.stringify(variables) : fetchOptions.body,
        });

        let responseData;
        console.log(responseData);
        
        try {
          responseData = await res.json();
        } catch (parseError) {
          throw new Error("Invalid JSON response from server");
        }

        // Calculate remaining time to meet minimum loading duration
        const elapsed = Date.now() - loadingStartTimeRef.current;
        const remainingTime = Math.max(0, minLoadingDuration - elapsed);

        // Handle server error responses (success: false)
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

          // Rollback optimistic update if provided
          if (rollbackOptimisticUpdate && variables) {
            rollbackOptimisticUpdate(variables);
          }

          setError(serverError);
          onError?.(serverError);
          return;
        }

        // Handle success response
        if (responseData && responseData.success === true) {
          // Wait for minimum loading duration before updating state
          await new Promise(resolve => setTimeout(resolve, remainingTime));
          
          setData(responseData);
          onSuccess?.(responseData);
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
        const errorObj: Error = err instanceof Error ? err : new Error(err?.message || "Network request failed");
        
        // Calculate remaining time to meet minimum loading duration
        const elapsed = Date.now() - loadingStartTimeRef.current;
        const remainingTime = Math.max(0, minLoadingDuration - elapsed);
        
        // Wait for minimum loading duration before updating state
        await new Promise(resolve => setTimeout(resolve, remainingTime));

        // Rollback optimistic update if provided
        if (rollbackOptimisticUpdate && variables) {
          rollbackOptimisticUpdate(variables);
        }

        setError(errorObj);
        onError?.(errorObj);
      } finally {
        setLoading(false);
        onSettled?.();
      }
    },
    [url, JSON.stringify(fetchOptions), onSuccess, onError, onSettled, optimisticUpdate, rollbackOptimisticUpdate, minLoadingDuration]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { 
    mutate, 
    data, 
    error, 
    loading, 
    reset,
    isError: !!error,
    isSuccess: !!data && data.success === true
  };
}