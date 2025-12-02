"use client";

import CandidateCard from "@/components/features/candidates/candidate-card";
import CandidateDetailsPanel from "@/components/features/candidates/candidate-details-panel";
import CandidateFilters from "@/components/features/candidates/candidate-filters";
import CandidateSearchBar from "@/components/features/candidates/candidate-search-bar";
import CandidatesPagination from "@/components/features/candidates/candidates-pagination";
import CandidatesSortControls from "@/components/features/candidates/candidates-sort-controls";
import { Button, SkeletonList } from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { useSidebar } from "@/contexts/ui-context";
import { useCandidates } from "@/hooks/use-candidates";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

function CandidatesPageContent() {
  const [showFilters, setShowFilters] = useState(true);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const { isOpen: sidebarOpen } = useSidebar();
  const { user: authUser, userType } = useAuth();
  const router = useRouter();
  
  // Redirect non-company users
  if (userType !== 'company') {
    router.push('/jobs');
    return null;
  }

  const {
    candidates,
    pagination,
    selectedCandidate,
    selectedCandidateId,
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
    selectCandidate,
  } = useCandidates();

  const handleCandidateSelect = (candidateId: string) => {
    selectCandidate(candidateId);
    if (window.innerWidth < 1024) {
      setShowDetailsPanel(true);
    }
  };

  const closeDetailsPanel = () => {
    setShowDetailsPanel(false);
    selectCandidate(null);
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
              Tìm ứng viên
            </h1>
            <p className="text-purple-100 text-lg">
              {pagination
                ? `${pagination.totalItems.toLocaleString()} ứng viên tiềm năng`
                : "Đang tìm kiếm..."}
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <CandidateSearchBar
              value={filters.query || ""}
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
              <CandidateFilters
                filters={filters}
                onUpdateFilters={updateFilters}
                onResetFilters={resetFilters}
                hasActiveFilters={hasActiveFilters}
                loading={loading}
              />
            </div>
          </motion.aside>

          {/* Center Content - Candidate List */}
          <main className="flex-1 min-w-0">
            <div className="space-y-4">
              {/* Candidate List */}
              {loading && candidates.length === 0 ? (
                <SkeletonList count={6} />
              ) : candidates.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Không tìm thấy ứng viên
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Thử thay đổi điều kiện tìm kiếm hoặc bộ lọc
                  </p>
                </div>
              ) : (
                <div className={`space-y-4`}>
                  {candidates.map((candidate, index) => (
                    <motion.div
                      key={candidate._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <CandidateCard
                        candidate={candidate}
                        isSelected={selectedCandidateId === candidate._id}
                        onClick={() => handleCandidateSelect(candidate._id)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Load More / Pagination */}
              {candidates.length > 0 && (
                <CandidatesPagination
                  pagination={pagination}
                  hasNextPage={hasNextPage}
                  loading={loading}
                  onPageChange={goToPage}
                  onLoadMore={loadMore}
                />
              )}
            </div>
          </main>

          {/* Right Panel - Candidate Details */}
          <motion.aside
            className={`${
              selectedCandidate && !showDetailsPanel ? "hidden lg:block" : "hidden"
            } w-96 flex-shrink-0`}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {selectedCandidate && (
              <div className="sticky top-24">
                <CandidateDetailsPanel
                  candidate={selectedCandidate}
                  onClose={closeDetailsPanel}
                />
              </div>
            )}
          </motion.aside>
        </div>
      </div>

      {/* Mobile Candidate Details Modal */}
      {showDetailsPanel && selectedCandidate && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
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
              <CandidateDetailsPanel
                candidate={selectedCandidate}
                onClose={closeDetailsPanel}
                isMobile
              />
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CandidatesPage() {
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
      <CandidatesPageContent />
    </Suspense>
  );
}
