"use client";

import JobCard from "@/components/features/jobs/job-card";
import JobDetailsPanel from "@/components/features/jobs/job-details-panel";
import JobFilters from "@/components/features/jobs/job-filters";
import JobSearchBar from "@/components/features/jobs/job-search-bar";
import JobsPagination from "@/components/features/jobs/jobs-pagination";
import JobsSortControls from "@/components/features/jobs/jobs-sort-controls";
import CVAnalysisModal from "@/components/features/ai/cv-analysis-modal";
import { Button, SkeletonList } from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { useSidebar } from "@/contexts/ui-context";
import { useJobs } from "@/hooks/use-jobs";
import { useUserJobActions } from "@/hooks/use-user-job-actions";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { useApi, useMutation } from "@/hooks/use-api";
import { usersApi, aiApi } from "@/lib/api";
import { JobPost } from "@/lib/types";

function JobsPageContent() {
  const [showFilters, setShowFilters] = useState(true);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const { isOpen: sidebarOpen } = useSidebar();
  const { user: authUser } = useAuth();
  const router = useRouter();
  const { savedIds, appliedIds, actionLoading, toggleSave, applyToJob } =
    useUserJobActions({ autoLoad: true });
  const {
    jobs,
    pagination,
    selectedJob,
    selectedJobId,
    filters,
    loading,
    error,
    hasActiveFilters,
    hasNextPage,
    updateFilters,
    resetFilters,
    search,
    changeSort,
    goToPage,
    loadMore,
    selectJob,
  } = useJobs();

  const handleJobSelect = (jobId: string) => {
    selectJob(jobId);
    if (window.innerWidth < 1024) {
      setShowDetailsPanel(true);
    }
  };

  // Fetch current user data from API
  const {
    data: user,
    loading: userLoading,
    refetch: refetchUser,
  } = useApi(
    () =>
      authUser
        ? usersApi.getUserById(authUser._id)
        : Promise.resolve({ data: null }),
    [],
    { immediate: true }
  );

  // AI CV Analysis mutation hook
  const { mutate: analyzeCv, loading: cvAnalysisLoading } = useMutation(
    (job: JobPost) => {
      if (!user || !(user as any).resumeUrl) {
        return Promise.reject(new Error('Missing required data'));
      }
      return aiApi.optimizeCV({
        userId: user._id,
        resumeUrl: (user as any).resumeUrl,
        jobId: job._id,
      });
    },
    {
      onSuccess: (data) => {
        setAnalysisData(data?.data);
        if (data.fallback) {
          toast.warning("AI tạm thời quá tải. Hiển thị kết quả cơ bản.");
        } else if (data.cached) {
          toast.success("Đã tải kết quả phân tích trước đó!");
        } else {
          toast.success("Đã phân tích CV thành công!");
        }
      },
      onError: (error) => {
        setShowAnalysisModal(false);
      },
    }
  );

  const handleOptimizeCV = async (job: JobPost) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
      router.push("/login");
      return;
    }

    if (!(user as any).resumeUrl) {
      toast.error("Vui lòng tải lên CV trước khi sử dụng tính năng này");
      return;
    }

    // Set selected job for analysis and open modal
    setShowAnalysisModal(true);
    setAnalysisData(null);
    
    // Trigger the API call using useApi hook
    await analyzeCv(job);
  };

  const closeDetailsPanel = () => {
    setShowDetailsPanel(false);
    selectJob(null);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Có lỗi xảy ra
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section with Purple Gradient and Background Image */}
      <div className="relative bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-900 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 opacity-30 bg-center bg-cover"
          style={{
            backgroundImage: `url('/images/search-job-img.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-purple-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        ></div>

        {/* People Icon - Top Left */}
        <div className="absolute top-8 left-[200px] hidden lg:block z-10">
          <img
            src="/images/people-icon-1.png"
            alt="Person"
            className="w-[180px] h-[140px] object-contain drop-shadow-2xl"
          />
        </div>

        {/* People Icon - Bottom Right */}
        <div className="absolute top-[150px] right-[-50px] hidden lg:block z-20">
          <img
            src="/images/people-icon-2.png"
            alt="Person"
            className="w-[385px] h-[380px] object-contain drop-shadow-2xl"
          />
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          {/* Center Content */}
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Tìm việc làm
            </h1>
            <p className="text-purple-100 text-lg">
              {pagination
                ? `${pagination.totalItems.toLocaleString()} việc làm đang tuyển`
                : "Đang tìm kiếm..."}
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <JobSearchBar
              value={filters.search || ""}
              location={filters.location || ""}
              onSearch={search}
              loading={loading}
            />
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center justify-center gap-2 lg:hidden mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Bộ lọc
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-white rounded-full"></span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <motion.aside
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block w-full lg:w-80 flex-shrink-0`}
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="sticky top-24">
              <JobFilters
                filters={filters}
                onUpdateFilters={updateFilters}
                onResetFilters={resetFilters}
                hasActiveFilters={hasActiveFilters}
                loading={loading}
              />
            </div>
          </motion.aside>

          {/* Center Content - Job List */}
          <main className="flex-1 min-w-0">
            <div className="space-y-4">
              {/* Sort Controls */}
              <div className="flex items-center justify-between">
                <JobsSortControls
                  sortBy={filters.sortBy}
                  sortOrder={filters.sortOrder}
                  onSortChange={changeSort}
                />
              </div>

              {/* Job List */}
              {loading && jobs.length === 0 ? (
                <SkeletonList count={6} />
              ) : jobs.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Không tìm thấy việc làm
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Thử thay đổi điều kiện tìm kiếm hoặc bộ lọc
                  </p>
                  {hasActiveFilters && (
                    <Button onClick={resetFilters} variant="outline">
                      Xóa tất cả bộ lọc
                    </Button>
                  )}
                </div>
              ) : (
                <div className={`space-y-4`}>
                  {jobs.map((job, index) => (
                    <motion.div
                      key={job._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <JobCard
                        job={job}
                        isSelected={selectedJobId === job._id}
                        onClick={() => handleJobSelect(job._id)}
                        saved={savedIds.has(job._id)}
                        applied={appliedIds.has(job._id)}
                        saving={!!actionLoading[job._id]}
                        applying={!!actionLoading[job._id]}
                        onToggleSave={() => toggleSave(job._id)}
                        onApply={() => applyToJob(job._id)}
                        onOptimizeCV={() => handleOptimizeCV(job)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Load More / Pagination */}
              {jobs.length > 0 && (
                <JobsPagination
                  pagination={pagination}
                  hasNextPage={hasNextPage}
                  loading={loading}
                  onPageChange={goToPage}
                  onLoadMore={loadMore}
                />
              )}
            </div>
          </main>

          {/* Right Panel - Job Details */}
          <motion.aside
            className={`${
              selectedJob && !showDetailsPanel ? "hidden lg:block" : "hidden"
            } w-96 flex-shrink-0`}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {selectedJob && (
              <div className="sticky top-24">
                <JobDetailsPanel
                  job={selectedJob}
                  onClose={closeDetailsPanel}
                  saved={savedIds.has(selectedJob._id)}
                  applied={appliedIds.has(selectedJob._id)}
                  saving={!!actionLoading[selectedJob._id]}
                  applying={!!actionLoading[selectedJob._id]}
                  onToggleSave={() => toggleSave(selectedJob._id)}
                  onApply={() => applyToJob(selectedJob._id)}
                />
              </div>
            )}
          </motion.aside>
        </div>
      </div>

      {/* Mobile Job Details Modal */}
      {showDetailsPanel && selectedJob && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black "
            onClick={closeDetailsPanel}
          />
          <div className="relative h-full">
            <motion.div
              className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3 }}
            >
              <JobDetailsPanel
                job={selectedJob}
                onClose={closeDetailsPanel}
                isMobile
                saved={savedIds.has(selectedJob._id)}
                applied={appliedIds.has(selectedJob._id)}
                saving={!!actionLoading[selectedJob._id]}
                applying={!!actionLoading[selectedJob._id]}
                onToggleSave={() => toggleSave(selectedJob._id)}
                onApply={() => applyToJob(selectedJob._id)}
              />
            </motion.div>
          </div>
        </div>
      )}

      {/* CV Analysis Modal */}
      <CVAnalysisModal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        data={analysisData}
        loading={cvAnalysisLoading}
      />
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-6">
            <SkeletonList count={6} />
          </div>
        </div>
      }
    >
      <JobsPageContent />
    </Suspense>
  );
}
