"use client";

import { jobsApi } from "@/lib/api";
import { JobPost, JobSearchFilters } from "@/lib/types";
import { buildQueryString, parseQueryString } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { usePaginatedApi } from "./use-api";
import { useDebounce } from "./use-debounce";

export interface UseJobsOptions {
  limit?: number;
  autoLoad?: boolean;
}

export function useJobs(options: UseJobsOptions = {}) {
  const { limit = 10, autoLoad = true } = options;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse initial filters from URL
  const [filters, setFilters] = useState<JobSearchFilters>(() => {
    const urlParams = parseQueryString(searchParams.toString());
    console.log("urlParams", urlParams);
    const sortByParam = (urlParams.sortBy as string) || "createdAt";
    const sortBy: "createdAt" | "updatedAt" | "salaryMin" | "salaryMax" = [
      "createdAt",
      "updatedAt",
      "salaryMin",
      "salaryMax",
    ].includes(sortByParam)
      ? (sortByParam as any)
      : "createdAt";

    return {
      search: (urlParams.q as string) || "",
      categoryId: (urlParams.categoryId as string) || undefined,
      skillIds: Array.isArray(urlParams.skillIds)
        ? (urlParams.skillIds as string[])
        : urlParams.skillIds
        ? [urlParams.skillIds as string]
        : [],
      location: (urlParams.location as string) || "",
      minSalary: urlParams.minSalary ? Number(urlParams.minSalary) : undefined,
      maxSalary: urlParams.maxSalary ? Number(urlParams.maxSalary) : undefined,
      jobType: Array.isArray(urlParams.jobType)
        ? (urlParams.jobType as any)
        : urlParams.jobType
        ? [urlParams.jobType as any]
        : [],
      experienceLevel: Array.isArray(urlParams.experienceLevel)
        ? (urlParams.experienceLevel as any)
        : urlParams.experienceLevel
        ? [urlParams.experienceLevel as any]
        : [],
      companyId: (urlParams.companyId as string) || undefined,
      page: urlParams.page ? Number(urlParams.page) : 1,
      limit,
      sortBy,
      sortOrder: (urlParams.sortOrder as "asc" | "desc") || "desc",
    };
  });

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Debounce search query
  const debouncedQuery = useDebounce(filters.search || "", 300);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedQuery,
    }),
    [filters, debouncedQuery]
  );

  // Memoize API call function
  const apiCall = useCallback(
    (page: number, pageLimit: number) => {
      console.log("API call triggered", {
        page,
        pageLimit,
        filters: memoizedFilters,
      });
      return jobsApi.getJobs({
        ...memoizedFilters,
        page,
        limit: pageLimit,
      });
    },
    [memoizedFilters]
  );

  // API call with filters
  const {
    data: jobs,
    pagination,
    loading,
    error,
    refetch,
    loadMore,
    hasNextPage,
  } = usePaginatedApi<JobPost>(apiCall, limit, { immediate: autoLoad });

  // Update URL when filters change
  const updateURL = useCallback(
    (newFilters: JobSearchFilters) => {
      console.log("updateURL", newFilters);
      const queryString = buildQueryString({
        q: newFilters.search || undefined,
        categoryId: newFilters.categoryId || undefined,
        skillIds: newFilters.skillIds?.length ? newFilters.skillIds : undefined,
        location: newFilters.location || undefined,
        minSalary: newFilters.minSalary ?? undefined,
        maxSalary: newFilters.maxSalary ?? undefined,
        jobType: newFilters.jobType?.length ? newFilters.jobType : undefined,
        experienceLevel: newFilters.experienceLevel?.length
          ? newFilters.experienceLevel
          : undefined,
        companyId: newFilters.companyId || undefined,
        page:
          newFilters.page && newFilters.page !== 1
            ? newFilters.page
            : undefined,
        sortBy:
          newFilters.sortBy && newFilters.sortBy !== "createdAt"
            ? newFilters.sortBy
            : undefined,
        sortOrder:
          newFilters.sortOrder && newFilters.sortOrder !== "desc"
            ? newFilters.sortOrder
            : undefined,
      });

      const url = queryString ? `/jobs?${queryString}` : "/jobs";
      router.push(url, { scroll: false });
    },
    [router]
  );

  // Update filters and trigger search
  const updateFilters = useCallback(
    (newFilters: Partial<JobSearchFilters>) => {
      console.log("updateFilters", newFilters);
      const updatedFilters = { ...filters, ...newFilters, page: 1 };

      // Check if filters have actually changed to prevent unnecessary updates
      const hasChanged = Object.keys(newFilters).some((key) => {
        const newValue = newFilters[key as keyof JobSearchFilters];
        const oldValue = filters[key as keyof JobSearchFilters];

        if (Array.isArray(newValue) && Array.isArray(oldValue)) {
          return JSON.stringify(newValue) !== JSON.stringify(oldValue);
        }
        return newValue !== oldValue;
      });

      if (hasChanged) {
        setFilters(updatedFilters);
        updateURL(updatedFilters);
      }
    },
    [filters, updateURL]
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    console.log("resetFilters");
    const defaultFilters: JobSearchFilters = {
      search: "",
      categoryId: undefined,
      skillIds: [],
      location: "",
      minSalary: undefined,
      maxSalary: undefined,
      jobType: [],
      experienceLevel: [],
      companyId: undefined,
      page: 1,
      limit,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setFilters(defaultFilters);
    updateURL(defaultFilters);
  }, [limit, updateURL]);

  // Quick search function for search bar
  const search = useCallback(
    (search: string, location?: string) => {
      updateFilters({
        search,
        location: location || filters.location,
      });
    },
    [updateFilters, filters.location]
  );

  // Filter by category
  const filterByCategory = useCallback(
    (categoryId: string) => {
      console.log("filterByCategory", categoryId);
      updateFilters({ categoryId });
    },
    [updateFilters]
  );

  // Filter by company
  const filterByCompany = useCallback(
    (companyId: string) => {
      console.log("filterByCompany", companyId);
      updateFilters({ companyId });
    },
    [updateFilters]
  );

  // Add/remove skill filter
  const toggleSkillFilter = useCallback(
    (skillId: string) => {
      console.log("toggleSkillFilter", skillId);
      const currentSkills = filters.skillIds || [];
      const newSkills = currentSkills.includes(skillId)
        ? currentSkills.filter((id) => id !== skillId)
        : [...currentSkills, skillId];

      updateFilters({ skillIds: newSkills });
    },
    [filters.skillIds, updateFilters]
  );

  // Change sort
  const changeSort = useCallback(
    (
      sortBy: JobSearchFilters["sortBy"],
      sortOrder: JobSearchFilters["sortOrder"]
    ) => {
      console.log("changeSort", sortBy, sortOrder);
      updateFilters({ sortBy, sortOrder });
    },
    [updateFilters]
  );

  // Go to page
  const goToPage = useCallback(
    (page: number) => {
      console.log("goToPage", page);
      const updatedFilters = { ...filters, page };
      setFilters(updatedFilters);
      updateURL(updatedFilters);
    },
    [filters, updateURL]
  );

  // Select job for detail panel
  const selectJob = useCallback((jobId: string | null) => {
    console.log("selectJob", jobId);
    setSelectedJobId(jobId);
  }, []);

  // Get selected job
  const selectedJob: JobPost | null = selectedJobId
    ? jobs.find((job) => job._id === selectedJobId) || null
    : null;

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    filters.search ||
      filters.categoryId ||
      filters.skillIds?.length ||
      filters.location ||
      filters.minSalary ||
      filters.maxSalary ||
      filters.jobType?.length ||
      filters.experienceLevel?.length ||
      filters.companyId
  );

  return {
    // Data
    jobs,
    pagination,
    selectedJob,
    selectedJobId,

    // State
    filters,
    loading,
    error,
    hasActiveFilters,
    hasNextPage,

    // Actions
    updateFilters,
    resetFilters,
    search,
    filterByCategory,
    filterByCompany,
    toggleSkillFilter,
    changeSort,
    goToPage,
    loadMore,
    refetch,
    selectJob,
  };
}
