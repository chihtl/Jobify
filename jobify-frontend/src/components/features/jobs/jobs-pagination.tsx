'use client';

import { Button } from '@/components/ui';
import { PaginationMeta } from '@/lib/types';
import { ChevronLeft, ChevronRight, Loader2, MoreHorizontal } from 'lucide-react';

interface JobsPaginationProps {
  pagination: PaginationMeta | null;
  hasNextPage: boolean;
  loading: boolean;
  onPageChange: (page: number) => void;
  onLoadMore: () => void;
  mode?: 'pagination' | 'loadmore';
}

const JobsPagination = ({
  pagination,
  hasNextPage,
  loading,
  onPageChange,
  onLoadMore,
  mode = 'pagination'
}: JobsPaginationProps) => {
  if (!pagination) return null;

  const { currentPage, totalPages, totalItems } = pagination;

  // Load more mode
  if (mode === 'loadmore') {
    return (
      <div className="text-center py-8">
        {hasNextPage ? (
          <Button
            onClick={onLoadMore}
            disabled={loading}
            variant="outline"
            size="lg"
            className="min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tải...
              </>
            ) : (
              'Tải thêm việc làm'
            )}
          </Button>
        ) : (
          <p className="text-gray-600">
            Đã hiển thị tất cả {totalItems.toLocaleString()} việc làm
          </p>
        )}
      </div>
    );
  }

  // Pagination mode
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pages = generatePageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
      {/* Info */}
      <div className="text-sm text-gray-600">
        Hiển thị {((currentPage - 1) * 12 + 1).toLocaleString()} - {Math.min(currentPage * 12, totalItems).toLocaleString()}
        {' '}trong số {totalItems.toLocaleString()} việc làm
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="p-2"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pages.map((page, index) => {
            if (page === '...') {
              return (
                <div
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-gray-400"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </div>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <Button
                key={pageNumber}
                variant={isActive ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNumber)}
                disabled={loading}
                className={`min-w-[2.5rem] ${isActive
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="p-2"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Mobile: Page info */}
      <div className="sm:hidden text-sm text-gray-600">
        Trang {currentPage} / {totalPages}
      </div>
    </div>
  );
};

export default JobsPagination;