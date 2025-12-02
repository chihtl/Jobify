'use client';

import { Select } from '@/components/ui';
import { JobSearchFilters } from '@/lib/types';

interface JobsSortControlsProps {
  sortBy?: JobSearchFilters['sortBy'];
  sortOrder?: JobSearchFilters['sortOrder'];
  onSortChange: (sortBy: JobSearchFilters['sortBy'], sortOrder: JobSearchFilters['sortOrder']) => void;
}

const JobsSortControls = ({
  sortBy = 'createdAt',
  sortOrder = 'desc',
  onSortChange
}: JobsSortControlsProps) => {
  const sortOptions = [
    { value: 'createdAt-desc', label: 'Mới nhất' },
    { value: 'createdAt-asc', label: 'Cũ nhất' },
    { value: 'salaryMin-desc', label: 'Lương cao nhất' },
    { value: 'salaryMin-asc', label: 'Lương thấp nhất' },
    { value: 'updatedAt-desc', label: 'Cập nhật gần đây' },
  ];

  const currentValue = `${sortBy}-${sortOrder}`;

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-') as [JobSearchFilters['sortBy'], JobSearchFilters['sortOrder']];
    onSortChange(newSortBy, newSortOrder);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 font-medium">Sắp xếp:</span>
      <div className="w-48">
        <Select
          value={currentValue}
          onChange={handleSortChange}
          options={sortOptions}
        />
      </div>
    </div>
  );
};

export default JobsSortControls;