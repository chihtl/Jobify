'use client';

import { Button } from '@/components/ui';
import { ArrowRight, Loader2, MapPin, Search } from 'lucide-react';
import { useState } from 'react';

interface JobSearchBarProps {
  value: string;
  location: string;
  onSearch: (query: string, location?: string) => void;
  loading?: boolean;
}

const JobSearchBar = ({ value, location, onSearch, loading = false }: JobSearchBarProps) => {
  const [query, setQuery] = useState(value);
  const [locationValue, setLocationValue] = useState(location);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, locationValue);
  };

  const handleQuickSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    onSearch(searchTerm, locationValue);
  };

  const popularSearches = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack',
    'React Developer',
    'Node.js',
    'Product Manager',
    'UI/UX Designer',
    'DevOps Engineer',
  ];

  return (
    <div className="space-y-4">
      {/* Main Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex flex-col md:flex-row gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden !z-[30]">
          {/* Job Title/Company Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Vị trí, công ty, kỹ năng..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-14 pr-4 py-4 bg-white border-0 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 transition-all duration-200"
            />
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-gray-200"></div>

          {/* Location Search */}
          <div className="md:w-72 relative">
            <MapPin className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Địa điểm"
              value={locationValue}
              onChange={(e) => setLocationValue(e.target.value)}
              className="w-full pl-14 pr-4 py-4 bg-white border-0 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 transition-all duration-200"
            />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 md:rounded-none md:rounded-r-2xl"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Tìm kiếm</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Popular Searches */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-sm text-white font-medium">Tìm kiếm phổ biến:</span>
        {popularSearches.map((term) => (
          <button
            key={term}
            onClick={() => handleQuickSearch(term)}
            className="px-4 py-1.5 text-sm text-white bg-transparent hover:bg-white/20 rounded-full transition-all duration-200 border border-white/30 hover:border-white/50"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
};

export default JobSearchBar;