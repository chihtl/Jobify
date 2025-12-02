'use client';

import { Button } from '@/components/ui';
import { MapPin, Search } from 'lucide-react';
import { useState } from 'react';

interface CandidateSearchBarProps {
  value: string;
  location: string;
  onSearch: (query: string, location?: string) => void;
  loading?: boolean;
}

const CandidateSearchBar = ({ 
  value, 
  location, 
  onSearch, 
  loading = false 
}: CandidateSearchBarProps) => {
  const [query, setQuery] = useState(value);
  const [searchLocation, setSearchLocation] = useState(location);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, searchLocation);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="bg-white rounded-xl shadow-lg p-2 flex flex-col lg:flex-row lg:items-center gap-2">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm ứng viên theo mô tả..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 bg-transparent border-0 focus:outline-none focus:ring-0 text-lg"
          />
        </div>

        {/* Location Input */}
        <div className="lg:w-80 relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Địa điểm"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 bg-transparent border-0 lg:border-l border-gray-200 focus:outline-none focus:ring-0 text-lg"
          />
        </div>

        {/* Search Button */}
        <Button
          type="submit"
          size="lg"
          loading={loading}
          disabled={loading}
          className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Tìm kiếm
        </Button>
      </div>
    </form>
  );
};

export default CandidateSearchBar;
