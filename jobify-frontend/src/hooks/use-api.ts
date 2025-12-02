'use client';

import { PaginatedResponse, UseApiResult, UsePaginatedApiResult } from '@/lib/types';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

// Generic API hook
export function useApi<T>(
  apiCall: () => Promise<{ data: T }>,
  dependencies: any[] = [],
  options: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
    showErrorToast?: boolean;
  } = {}
): UseApiResult<T> {
  const {
    immediate = true,
    onSuccess,
    onError,
    showErrorToast = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiCall();
      const result = response.data;

      setData(result);

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
      setError(errorMessage);

      if (showErrorToast) {
        toast.error(errorMessage);
      }

      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

// Paginated API hook
export function usePaginatedApi<T>(
  apiCall: (page: number, limit: number) => Promise<{ data: PaginatedResponse<T> }>,
  limit: number = 12,
  options: {
    immediate?: boolean;
    onSuccess?: (data: PaginatedResponse<T>) => void;
    onError?: (error: Error) => void;
    showErrorToast?: boolean;
  } = {}
): UsePaginatedApiResult<T> {

  const {
    immediate = true,
    onSuccess,
    onError,
    showErrorToast = true,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<T>['pagination'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const execute = useCallback(async (page: number = 1, reset: boolean = true) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiCall(page, limit);
      const result = response.data;

      if (reset || page === 1) {
        setData(result.data);
      } else {
        setData(prev => [...prev, ...result.data]);
      }

      setPagination(result.pagination);
      setCurrentPage(page);

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
      setError(errorMessage);

      if (showErrorToast) {
        toast.error(errorMessage);
      }

      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, limit, onSuccess, onError, showErrorToast]);

  const loadMore = useCallback(async () => {
    if (pagination && pagination.hasNextPage) {
      return execute(currentPage + 1, false);
    }
  }, [execute, currentPage, pagination]);

  const refetch = useCallback(() => {
    return execute(1, true);
  }, [execute]);

  useEffect(() => {
    if (immediate) {
      execute(1, true);
    }
  }, [execute, immediate]);

  return {
    data,
    pagination,
    loading,
    error,
    loadMore,
    refetch,
    hasNextPage: pagination?.hasNextPage || false,
  };
}

// Mutation hook for POST/PUT/DELETE operations
export function useMutation<TData, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<{ data: TData }>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: any, variables: TVariables) => void;
    onMutate?: (variables: TVariables) => void;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
  } = {}
) {
  const {
    onSuccess,
    onError,
    onMutate,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Thành công!',
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    try {
      setLoading(true);
      setError(null);

      if (onMutate) {
        onMutate(variables);
      }

      const response = await mutationFn(variables);
      const result = response.data;

      if (showSuccessToast) {
        toast.success(successMessage);
      }

      if (onSuccess) {
        onSuccess(result, variables);
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
      setError(errorMessage);

      if (showErrorToast) {
        toast.error(errorMessage);
      }

      if (onError) {
        onError(err, variables);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, onSuccess, onError, onMutate, showSuccessToast, showErrorToast, successMessage]);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    loading,
    error,
    reset,
  };
}