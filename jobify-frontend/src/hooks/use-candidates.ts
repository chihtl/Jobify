import { useCallback, useEffect, useState } from 'react';
import { usersApi } from '@/lib/api';
import { User, PaginationMeta } from '@/lib/types';
import { toast } from 'sonner';

export interface CandidateSearchFilters {
  query?: string;
  skillIds?: string[];
  experienceTitle?: string;
  experienceCompany?: string;
  location?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface UseCandidatesOptions {
  initialFilters?: Partial<CandidateSearchFilters>;
  autoLoad?: boolean;
}

export function useCandidates(options: UseCandidatesOptions = {}) {
  const { initialFilters = {}, autoLoad = true } = options;

  // State
  const [candidates, setCandidates] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<User | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<CandidateSearchFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters,
  });

  // Computed values
  const hasActiveFilters = Boolean(
    filters.query ||
    filters.skillIds?.length ||
    filters.experienceTitle ||
    filters.experienceCompany ||
    filters.location
  );

  const hasNextPage = pagination ? pagination.hasNextPage : false;

  // Load candidates
  const loadCandidates = useCallback(
    async (newFilters?: Partial<CandidateSearchFilters>, append = false) => {
      try {
        setLoading(true);
        setError(null);

        const searchFilters = { ...filters, ...newFilters };
        const response = await usersApi.searchCandidates(searchFilters);

        if (response.data) {
          const newCandidates = response.data.data || [];
          setCandidates(prev => append ? [...prev, ...newCandidates] : newCandidates);
          setPagination(response.data.pagination);
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách ứng viên';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<CandidateSearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    loadCandidates(updatedFilters);
  }, [filters, loadCandidates]);

  // Reset filters
  const resetFilters = useCallback(() => {
    const defaultFilters: CandidateSearchFilters = {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    setFilters(defaultFilters);
    loadCandidates(defaultFilters);
  }, [loadCandidates]);

  // Search
  const search = useCallback((query: string, location?: string) => {
    updateFilters({ query, location });
  }, [updateFilters]);

  // Change sort
  const changeSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    updateFilters({ sortBy: sortBy as any, sortOrder });
  }, [updateFilters]);

  // Go to page
  const goToPage = useCallback((page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    loadCandidates(newFilters);
  }, [filters, loadCandidates]);

  // Load more (for infinite scroll)
  const loadMore = useCallback(() => {
    if (hasNextPage && !loading) {
      const nextPage = (filters.page || 1) + 1;
      const newFilters = { ...filters, page: nextPage };
      setFilters(newFilters);
      loadCandidates(newFilters, true);
    }
  }, [hasNextPage, loading, filters, loadCandidates]);

  // Select candidate
  const selectCandidate = useCallback((candidateId: string | null) => {
    setSelectedCandidateId(candidateId);
    if (candidateId) {
      const candidate = candidates.find(c => c._id === candidateId);
      setSelectedCandidate(candidate || null);
    } else {
      setSelectedCandidate(null);
    }
  }, [candidates]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadCandidates();
    }
  }, []); // Only run on mount

  // Update selected candidate when candidates list changes
  useEffect(() => {
    if (selectedCandidateId) {
      const candidate = candidates.find(c => c._id === selectedCandidateId);
      setSelectedCandidate(candidate || null);
    }
  }, [candidates, selectedCandidateId]);

  return {
    // Data
    candidates,
    pagination,
    selectedCandidate,
    selectedCandidateId,
    
    // State
    loading,
    error,
    filters,
    
    // Computed
    hasActiveFilters,
    hasNextPage,
    
    // Actions
    updateFilters,
    resetFilters,
    search,
    changeSort,
    goToPage,
    loadMore,
    selectCandidate,
    loadCandidates,
  };
}
