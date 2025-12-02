'use client';

import { Select } from '@/components/ui';
import { ArrowUpDown } from 'lucide-react';

interface CandidatesSortControlsProps {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

const CandidatesSortControls = ({
  sortBy = 'createdAt',
  sortOrder = 'desc',
  onSortChange
}: CandidatesSortControlsProps) => {
  const sortOptions = [
    { value: 'createdAt-desc', label: 'Mới nhất' },
    { value: 'createdAt-asc', label: 'Cũ nhất' },
    { value: 'updatedAt-desc', label: 'Cập nhật gần đây' },
    { value: 'name-asc', label: 'Tên A-Z' },
    { value: 'name-desc', label: 'Tên Z-A' },
  ];

  const currentValue = `${sortBy}-${sortOrder}`;

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-');
    onSortChange(newSortBy, newSortOrder as 'asc' | 'desc');
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <ArrowUpDown className="w-4 h-4" />
        <span>Sắp xếp:</span>
      </div>
      
      <Select
        value={currentValue}
        onChange={handleSortChange}
        options={sortOptions}
        className="w-48"
      />
    </div>
  );
};

export default CandidatesSortControls;
