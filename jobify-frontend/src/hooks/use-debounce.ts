'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Debounce value hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Debounce callback hook
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): [T, () => void] {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [debouncedCallback, cancel];
}

// Advanced debounce hook with leading and trailing options
export function useAdvancedDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  } = {}
): [T, () => void, () => void] {
  const { leading = false, trailing = true, maxWait } = options;

  const timeoutRef = useRef<NodeJS.Timeout>();
  const maxTimeoutRef = useRef<NodeJS.Timeout>();
  const lastCallTimeRef = useRef<number>();
  const lastInvokeTimeRef = useRef<number>(0);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const invokeFunc = useCallback((...args: Parameters<T>) => {
    const result = callbackRef.current(...args);
    lastInvokeTimeRef.current = Date.now();
    return result;
  }, []);

  const leadingEdge = useCallback((...args: Parameters<T>) => {
    lastInvokeTimeRef.current = Date.now();
    timeoutRef.current = setTimeout(() => timerExpired(...args), delay);
    return leading ? invokeFunc(...args) : undefined;
  }, [delay, leading, invokeFunc]);

  const remainingWait = useCallback((time: number) => {
    const timeSinceLastCall = time - (lastCallTimeRef.current || 0);
    const timeSinceLastInvoke = time - lastInvokeTimeRef.current;
    const timeWaiting = delay - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }, [delay, maxWait]);

  const shouldInvoke = useCallback((time: number) => {
    const timeSinceLastCall = time - (lastCallTimeRef.current || 0);
    const timeSinceLastInvoke = time - lastInvokeTimeRef.current;

    return (
      lastCallTimeRef.current === undefined ||
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }, [delay, maxWait]);

  const timerExpired = useCallback((...args: Parameters<T>) => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(...args);
    }
    const remaining = remainingWait(time);
    timeoutRef.current = setTimeout(() => timerExpired(...args), remaining);
  }, [shouldInvoke, remainingWait]);

  const trailingEdge = useCallback((...args: Parameters<T>) => {
    timeoutRef.current = undefined;

    if (trailing && lastCallTimeRef.current) {
      return invokeFunc(...args);
    }
    lastCallTimeRef.current = undefined;
    return undefined;
  }, [trailing, invokeFunc]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
    }
    lastInvokeTimeRef.current = 0;
    lastCallTimeRef.current = undefined;
    timeoutRef.current = undefined;
    maxTimeoutRef.current = undefined;
  }, []);

  const flush = useCallback((...args: Parameters<T>) => {
    return timeoutRef.current ? trailingEdge(...args) : undefined;
  }, [trailingEdge]);

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      const time = Date.now();
      const isInvoking = shouldInvoke(time);

      lastCallTimeRef.current = time;

      if (isInvoking) {
        if (!timeoutRef.current) {
          return leadingEdge(...args);
        }
        if (maxWait) {
          timeoutRef.current = setTimeout(() => timerExpired(...args), delay);
          maxTimeoutRef.current = setTimeout(() => timerExpired(...args), maxWait);
          return leading ? invokeFunc(...args) : undefined;
        }
      }

      if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => timerExpired(...args), delay);
      }
      return undefined;
    }) as T,
    [delay, shouldInvoke, leadingEdge, timerExpired, maxWait, leading, invokeFunc]
  );

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return [debouncedCallback, cancel, flush];
}