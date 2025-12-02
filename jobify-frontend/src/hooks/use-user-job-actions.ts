'use client';

import { useAuth } from '@/contexts/auth-context';
import { applicationsApi, savedJobsApi } from '@/lib/api';
import { SUCCESS_MESSAGES } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export interface UseUserJobActionsOptions {
  autoLoad?: boolean;
}

export function useUserJobActions(options: UseUserJobActionsOptions = {}) {
  const { autoLoad = true } = options;
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [loadingApplied, setLoadingApplied] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const userId = (user as any)?._id as string | undefined;

  const markActionLoading = useCallback((jobId: string, isLoading: boolean) => {
    setActionLoading((prev) => ({ ...prev, [jobId]: isLoading }));
  }, []);

  const fetchSaved = useCallback(async () => {
    if (!isAuthenticated || !userId) return;
    try {
      setLoadingSaved(true);
      const resp = await savedJobsApi.getSavedJobIds(userId);
      const raw = (resp as { data?: unknown })?.data;
      const ids: string[] = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as { data?: unknown[] })?.data)
          ? (raw as { data: unknown[] }).data
          : Array.isArray((raw as { ids?: unknown[] })?.ids)
            ? (raw as { ids: unknown[] }).ids
            : Array.isArray((raw as { savedJobIds?: unknown[] })?.savedJobIds)
              ? (raw as { savedJobIds: unknown[] }).savedJobIds
              : Array.isArray((raw as { data?: { savedJobIds?: unknown[] } })?.data?.savedJobIds)
                ? (raw as { data: { savedJobIds: unknown[] } }).data.savedJobIds
                : [];
      setSavedIds(new Set(ids));
    } catch (e) {
      // silent; errors are globally toasted in interceptor
    } finally {
      setLoadingSaved(false);
    }
  }, [isAuthenticated, userId]);

  const fetchApplied = useCallback(async () => {
    if (!isAuthenticated || !userId) return;
    try {
      setLoadingApplied(true);
      console.log('Fetching applied jobs for user:', userId);

      // Sử dụng API mới đơn giản hơn
      try {
        const resp = await applicationsApi.getApplicationsByUserSimple(userId);
        console.log('Simple applications API response:', resp);

        if (resp?.data && Array.isArray(resp.data)) {
          const applications = resp.data;
          const jobIds = applications.map(app => {
            // jobPostId có thể là object hoặc string
            if (typeof app.jobPostId === 'object' && app.jobPostId?._id) {
              return app.jobPostId._id;
            }
            return app.jobPostId;
          }).filter(Boolean);
          console.log('Extracted job IDs from simple API:', jobIds);
          setAppliedIds(new Set(jobIds));
          return;
        }
      } catch (simpleApiError) {
        console.warn('Simple API failed, trying original API:', simpleApiError);
      }

      // Fallback: thử gọi API getApplicationsByUser gốc
      try {
        const resp = await applicationsApi.getApplicationsByUser(userId, { limit: 100 });
        console.log('Original applications API response:', resp);

        const raw = (resp as { data?: unknown })?.data;
        const items: unknown[] = Array.isArray((raw as { data?: unknown[] })?.data) ? (raw as { data?: unknown[] }).data : Array.isArray(raw) ? raw : [];
        console.log('Parsed items:', items);

        if (items && items.length > 0) {
          const ids = items
            .map((a) => (a as { jobPostId?: unknown })?.jobPostId)
            .map((jp) => (typeof jp === 'object' && jp && '_id' in jp ? (jp as { _id: string })._id : jp))
            .filter(Boolean);

          console.log('Extracted job IDs from original API:', ids);
          setAppliedIds(new Set(ids as string[]));
          return;
        }
      } catch (apiError) {
        console.warn('Original API also failed:', apiError);
      }

      console.log('Both APIs failed, no applied jobs data available');

    } catch (e) {
      console.error('Error fetching applied jobs:', e);
      // silent
    } finally {
      setLoadingApplied(false);
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    if (autoLoad && isAuthenticated) {
      fetchSaved();
      fetchApplied();
    }
  }, [autoLoad, isAuthenticated, fetchSaved, fetchApplied]);

  const requireAuth = useCallback(() => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thực hiện hành động này');
      router.push('/auth/login?next=/jobs');
      return false;
    }
    return true;
  }, [isAuthenticated, router]);

  const isJobSaved = useCallback((jobId: string) => savedIds.has(jobId), [savedIds]);
  const isJobApplied = useCallback((jobId: string) => appliedIds.has(jobId), [appliedIds]);

  const toggleSave = useCallback(async (jobId: string) => {
    if (!requireAuth() || !userId) return false;
    const currentlySaved = savedIds.has(jobId);
    markActionLoading(jobId, true);
    try {
      if (currentlySaved) {
        await savedJobsApi.unsaveJob(userId, jobId);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
        toast.success(SUCCESS_MESSAGES.JOB_UNSAVED);
        return false;
      } else {
        await savedJobsApi.saveJob({ userId, jobPostId: jobId });
        setSavedIds((prev) => new Set(prev).add(jobId));
        toast.success(SUCCESS_MESSAGES.JOB_SAVED);
        return true;
      }
    } catch (e) {
      // revert optimistic change if any (we changed only after success)
      return currentlySaved;
    } finally {
      markActionLoading(jobId, false);
    }
  }, [requireAuth, userId, savedIds, markActionLoading]);

  const applyToJob = useCallback(async (jobId: string) => {
    if (!requireAuth() || !userId) return false;

    // Kiểm tra xem đã ứng tuyển chưa
    if (appliedIds.has(jobId)) {
      toast.info('Bạn đã ứng tuyển công việc này rồi');
      return true;
    }

    markActionLoading(jobId, true);
    try {
      // Kiểm tra xem đã ứng tuyển chưa trước khi tạo
      try {
        const checkResponse = await applicationsApi.checkExistingApplication(userId, jobId);
        if (checkResponse?.data?.hasApplied) {
          toast.info('Bạn đã ứng tuyển công việc này rồi');
          setAppliedIds((prev) => new Set(prev).add(jobId));
          return true;
        }
      } catch (checkError) {
        // Nếu không thể kiểm tra, tiếp tục với việc tạo application
        console.warn('Không thể kiểm tra application hiện tại:', checkError);
      }

      // Tạo application mới
      await applicationsApi.applyForJob({ userId, jobPostId: jobId });
      setAppliedIds((prev) => new Set(prev).add(jobId));
      toast.success(SUCCESS_MESSAGES.APPLICATION_SUBMITTED);
      return true;
    } catch (error: unknown) {
      // Xử lý lỗi 409 Conflict (đã ứng tuyển rồi)
      if ((error as { response?: { status?: number } })?.response?.status === 409) {
        toast.info('Bạn đã ứng tuyển công việc này rồi');
        // Cập nhật state để tránh gọi API lại
        setAppliedIds((prev) => new Set(prev).add(jobId));
        return true;
      }

      // Xử lý các lỗi khác
      toast.error('Có lỗi xảy ra khi ứng tuyển. Vui lòng thử lại.');
      return false;
    } finally {
      markActionLoading(jobId, false);
    }
  }, [requireAuth, userId, appliedIds, markActionLoading]);

  const value = useMemo(() => ({
    // state
    savedIds,
    appliedIds,
    loadingSaved,
    loadingApplied,
    actionLoading,
    // selectors
    isJobSaved,
    isJobApplied,
    // actions
    fetchSaved,
    fetchApplied,
    toggleSave,
    applyToJob,
  }), [savedIds, appliedIds, loadingSaved, loadingApplied, actionLoading, isJobSaved, isJobApplied, fetchSaved, fetchApplied, toggleSave, applyToJob]);

  return value;
}

export default useUserJobActions;
