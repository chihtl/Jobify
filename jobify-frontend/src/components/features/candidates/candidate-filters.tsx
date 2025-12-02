'use client';

import { Button, Card, MultiSelect } from '@/components/ui';
import { useApi } from '@/hooks/use-api';
import { skillsApi } from '@/lib/api';
import { CandidateSearchFilters } from '@/hooks/use-candidates';
import { Skill } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  RotateCcw, 
  Briefcase,
  Building2,
  MapPin,
  Search
} from 'lucide-react';
import { useCallback, useMemo, useState, useEffect, memo } from 'react';

interface CandidateFiltersProps {
  filters: CandidateSearchFilters;
  onUpdateFilters: (filters: Partial<CandidateSearchFilters>) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  loading?: boolean;
}

// Memoized FilterSection component to prevent re-creation
const FilterSection = memo(({ 
  id, 
  title, 
  icon: Icon, 
  children,
  isExpanded,
  onToggle
}: { 
  id: string; 
  title: string; 
  icon: any; 
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}) => {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
});

FilterSection.displayName = 'FilterSection';

const CandidateFilters = ({
  filters,
  onUpdateFilters,
  onResetFilters,
  hasActiveFilters,
  loading = false
}: CandidateFiltersProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'skills',
    'experience',
    'location',
  ]);

  // Local state for filters (before applying)
  const [localFilters, setLocalFilters] = useState<Partial<CandidateSearchFilters>>(() => ({
    skillIds: filters.skillIds || [],
    experienceTitle: filters.experienceTitle || '',
    experienceCompany: filters.experienceCompany || '',
    location: filters.location || '',
  }));

  // Track if there are pending changes
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // Only sync on component mount - no automatic syncing during typing
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    console.log('useEffect triggered - isInitialized:', isInitialized, 'filters:', filters);
    if (!isInitialized) {
      console.log('Initializing local filters');
      setLocalFilters({
        skillIds: filters.skillIds || [],
        experienceTitle: filters.experienceTitle || '',
        experienceCompany: filters.experienceCompany || '',
        location: filters.location || '',
      });
      setIsInitialized(true);
    }
  }, [filters, isInitialized]);

  // Debug render
  console.log('CandidateFilters render - localFilters:', localFilters, 'hasPendingChanges:', hasPendingChanges);

  // Fetch skills for the multi-select
  const { data: skills } = useApi(
    () => skillsApi.getSkillsSimple(),
    [],
    { immediate: true }
  );

  // Memoize skill options
  const skillOptions = useMemo(() =>
    skills?.map((skill: Skill) => ({
      value: skill._id,
      label: skill.name
    })) || [],
    [skills]
  );

  // Memoize handlers
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  }, []);

  const isSectionExpanded = useCallback((section: string) => {
    return expandedSections.includes(section);
  }, [expandedSections]);

  // Update local state handlers
  const handleSkillsChange = useCallback((skillIds: string[]) => {
    console.log('handleSkillsChange called with:', skillIds);
    setLocalFilters(prev => ({ ...prev, skillIds }));
    setHasPendingChanges(true);
  }, []);

  const handleExperienceTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('handleExperienceTitleChange called with:', value);
    setLocalFilters(prev => ({ ...prev, experienceTitle: value }));
    setHasPendingChanges(true);
  }, []);

  const handleExperienceCompanyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('handleExperienceCompanyChange called with:', value);
    setLocalFilters(prev => ({ ...prev, experienceCompany: value }));
    setHasPendingChanges(true);
  }, []);

  const handleLocationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('handleLocationChange called with:', value);
    setLocalFilters(prev => ({ ...prev, location: value }));
    setHasPendingChanges(true);
  }, []);

  // Apply filters to trigger API call
  const handleApplyFilters = useCallback(() => {
    const filtersToApply: Partial<CandidateSearchFilters> = {
      // Always include all filter fields, even if empty, to properly clear them
      skillIds: localFilters.skillIds || [],
      experienceTitle: localFilters.experienceTitle?.trim() || '',
      experienceCompany: localFilters.experienceCompany?.trim() || '',
      location: localFilters.location?.trim() || '',
    };

    onUpdateFilters(filtersToApply);
    setHasPendingChanges(false);
  }, [localFilters, onUpdateFilters]);

  // Reset local filters
  const handleResetFilters = useCallback(() => {
    const resetState = {
      skillIds: [],
      experienceTitle: '',
      experienceCompany: '',
      location: '',
    };
    setLocalFilters(resetState);
    setHasPendingChanges(false);
    
    // First update filters with empty values to ensure API gets called with cleared filters
    onUpdateFilters(resetState);
    
    // Then call reset to ensure parent state is also reset
    onResetFilters();
  }, [onResetFilters, onUpdateFilters]);

  return (
    <Card className="sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          )}
          {hasPendingChanges && (
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
          )}
        </div>
        
        {(hasActiveFilters || hasPendingChanges) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-blue-600 hover:text-blue-700 p-1"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filter Sections */}
      <div className={cn('divide-y divide-gray-200', loading && 'opacity-50 pointer-events-none')}>
        {/* Skills Filter */}
        <FilterSection 
          id="skills" 
          title="Kỹ năng" 
          icon={Filter}
          isExpanded={isSectionExpanded('skills')}
          onToggle={toggleSection}
        >
          <MultiSelect
            placeholder="Chọn kỹ năng..."
            options={skillOptions}
            value={localFilters.skillIds || []}
            onChange={handleSkillsChange}
            searchable={true}
            maxDisplayed={3}
          />
        </FilterSection>

        {/* Experience Filter */}
        <FilterSection 
          id="experience" 
          title="Kinh nghiệm" 
          icon={Briefcase}
          isExpanded={isSectionExpanded('experience')}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vị trí công việc
              </label>
              <input
                key="experience-title-input"
                type="text"
                placeholder="VD: Senior Developer"
                value={localFilters.experienceTitle || ''}
                onChange={handleExperienceTitleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Công ty
              </label>
              <input
                key="experience-company-input"
                type="text"
                placeholder="VD: Google, Microsoft"
                value={localFilters.experienceCompany || ''}
                onChange={handleExperienceCompanyChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </FilterSection>

        {/* Location Filter */}
        <FilterSection 
          id="location" 
          title="Địa điểm" 
          icon={MapPin}
          isExpanded={isSectionExpanded('location')}
          onToggle={toggleSection}
        >
          <input
            key="location-input"
            type="text"
            placeholder="VD: Hà Nội, TP.HCM"
            value={localFilters.location || ''}
            onChange={handleLocationChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </FilterSection>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* Apply Button */}
        <Button
          onClick={handleApplyFilters}
          className="w-full"
          disabled={loading || !hasPendingChanges}
        >
          <Search className="w-4 h-4 mr-2" />
          {loading ? 'Đang tìm kiếm...' : 'Áp dụng bộ lọc'}
        </Button>

        {/* Reset Button */}
        {(hasActiveFilters || hasPendingChanges) && (
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="w-full"
            disabled={loading}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Xóa tất cả bộ lọc
          </Button>
        )}
      </div>
    </Card>
  );
};

export default CandidateFilters;
