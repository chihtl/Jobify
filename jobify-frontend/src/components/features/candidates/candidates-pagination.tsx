"use client";

import { Button } from "@/components/ui";
import { PaginationMeta } from "@/lib/types";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface CandidatesPaginationProps {
  pagination: PaginationMeta | null;
  hasNextPage: boolean;
  loading: boolean;
  onPageChange: (page: number) => void;
  onLoadMore: () => void;
}

const CandidatesPagination = ({
  pagination,
  hasNextPage,
  loading,
  onPageChange,
  onLoadMore,
}: CandidatesPaginationProps) => {
  if (!pagination) return null;

  const { currentPage, totalPages, totalItems } = pagination;

  // Ensure values are numbers and handle edge cases
  const safePage = Math.max(1, Number(currentPage) || 1);
  const safeTotal = Math.max(1, Number(totalPages) || 1);
  
  // Debug log for troubleshooting
  console.log('Pagination Debug:', { 
    currentPage: safePage, 
    totalPages: safeTotal, 
    isFirstPage: safePage <= 1,
    isLastPage: safePage >= safeTotal,
    loading 
  });

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (safeTotal <= maxVisible) {
      for (let i = 1; i <= safeTotal; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (safePage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, safePage - 1);
      const end = Math.min(safeTotal - 1, safePage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (safePage < safeTotal - 2) {
        pages.push("...");
      }

      if (safeTotal > 1) {
        pages.push(safeTotal);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
      {/* Results Info */}
      <div className="text-sm text-gray-600">
        Hiển thị {(safePage - 1) * 10 + 1} -{" "}
        {Math.min(safePage * 10, totalItems)} trong tổng số{" "}
        {totalItems.toLocaleString()} ứng viên
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onPageChange(safePage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          disabled={safePage <= 1 || loading}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Trước
        </Button>

        {/* Page Numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <div key={index}>
              {page === "..." ? (
                <span className="px-3 py-2 text-gray-400">...</span>
              ) : (
                <Button
                  variant={safePage === page ? "primary" : "outline"}
                  size="sm"
                  onClick={() => {
                    onPageChange(page as number);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={loading}
                  className="min-w-[2.5rem]"
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Page Info */}
        <div className="sm:hidden px-3 py-2 text-sm text-gray-600">
          {safePage} / {safeTotal}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onPageChange(safePage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          disabled={safePage >= safeTotal || loading}
          className="flex items-center gap-1"
        >
          Sau
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CandidatesPagination;
