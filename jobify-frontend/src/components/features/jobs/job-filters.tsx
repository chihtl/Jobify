'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  MultiSelect,
  Select,
  Slider
} from '@/components/ui';
import { useApi } from '@/hooks/use-api';
import { categoriesApi, skillsApi } from '@/lib/api';
import {
  EXPERIENCE_LEVEL_OPTIONS,
  JOB_TYPE_OPTIONS,
  SALARY_RANGES
} from '@/lib/constants';
import { Category, ExperienceLevel, JobSearchFilters, JobType, Skill } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

interface JobFiltersProps {
  filters: JobSearchFilters;
  onUpdateFilters: (filters: Partial<JobSearchFilters>) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  loading?: boolean;
}

const JobFilters = ({
  filters,
  onUpdateFilters,
  onResetFilters,
  hasActiveFilters,
  loading = false
}: JobFiltersProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'category',
    'skills',
    'salary',
  ]);

  // Fetch categories and skills - chỉ fetch 1 lần
  const { data: categories } = useApi(
    () => categoriesApi.getCategoriesSimple(),
    [],
    { immediate: true }
  );

  const { data: skills } = useApi(
    () => skillsApi.getSkillsSimple(),
    [],
    { immediate: true }
  );

  // Memoize options để tránh re-render
  const categoryOptions = useMemo(() =>
    categories?.map((cat: Category) => ({
      value: cat._id,
      label: cat.name
    })) || [],
    [categories]
  );

  const skillOptions = useMemo(() =>
    skills?.map((skill: Skill) => ({
      value: skill._id,
      label: skill.name
    })) || [],
    [skills]
  );



  // Memoize handlers để tránh re-render
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

  const handleSalaryChange = useCallback((values: [number, number]) => {
    onUpdateFilters({
      minSalary: values[0] || undefined,
      maxSalary: values[1] || undefined,
    });
  }, [onUpdateFilters]);

  const handlePredefinedSalary = useCallback((range: { min: number; max: number | null; label: string }) => {
    onUpdateFilters({
      minSalary: range.min,
      maxSalary: range.max || undefined,
    });
  }, [onUpdateFilters]);

  const handleCategoryChange = useCallback((value: string) => {
    onUpdateFilters({ categoryId: value || undefined });
  }, [onUpdateFilters]);

  const handleSkillsChange = useCallback((value: string[]) => {
    onUpdateFilters({ skillIds: value });
  }, [onUpdateFilters]);

  const handleJobTypeChange = useCallback((jobType: JobType | null) => {
    onUpdateFilters({ jobType: jobType ? [jobType] : [] });
  }, [onUpdateFilters]);

  const handleExperienceLevelChange = useCallback((level: ExperienceLevel | null) => {
    onUpdateFilters({ experienceLevel: level ? [level] : [] });
  }, [onUpdateFilters]);

  const handleCompanyFilterRemove = useCallback(() => {
    onUpdateFilters({ companyId: undefined });
  }, [onUpdateFilters]);

  return (
    <Card className="sticky top-24 overflow-visible job-filters-container rounded-2xl">
      <CardHeader className="px-6 py-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-lg font-bold text-gray-900">
            Bộ lọc tìm kiếm
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-0">
        <div className="space-y-0">
          {/* Category Filter */}
          <div className="py-4 relative z-40">
            <button
              onClick={() => toggleSection('category')}
              className="w-full flex items-center justify-between mb-3"
            >
              <span className="font-semibold text-gray-900">Ngành nghề</span>
              {isSectionExpanded('category') ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {isSectionExpanded('category') && (
              <Select
                placeholder="Chọn ngành nghề"
                value={filters.categoryId || ''}
                onChange={handleCategoryChange}
                options={categoryOptions}
              />
            )}
          </div>

          {/* Skills Filter */}
          <div className="py-4 relative z-30">
            <button
              onClick={() => toggleSection('skills')}
              className="w-full flex items-center justify-between mb-3"
            >
              <span className="font-semibold text-gray-900">Kỹ năng</span>
              {isSectionExpanded('skills') ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {isSectionExpanded('skills') && (
              <MultiSelect
                placeholder="Chọn kỹ năng"
                options={skillOptions}
                value={filters.skillIds || []}
                onChange={handleSkillsChange}
                maxDisplayed={2}
                searchable
              />
            )}
          </div>

          {/* Salary Range Filter */}
          <div className="py-4 relative z-20">
            <button
              onClick={() => toggleSection('salary')}
              className="w-full flex items-center justify-between mb-3"
            >
              <span className="font-semibold text-gray-900">Mức lương</span>
              {isSectionExpanded('salary') ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {isSectionExpanded('salary') && (
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="salary"
                    checked={!filters.minSalary && !filters.maxSalary}
                    onChange={() => handlePredefinedSalary({ min: 0, max: null, label: 'Tất cả mức lương' })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Tất cả mức lương</span>
                </label>
                {SALARY_RANGES.map((range, index) => {
                  const isSelected = filters.minSalary === range.min &&
                    filters.maxSalary === range.max;

                  return (
                    <label key={index} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="salary"
                        checked={isSelected}
                        onChange={() => handlePredefinedSalary(range)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{range.label}</span>
                    </label>
                  );
                })}

                {/* Custom Salary Slider */}
                <div className="pt-3 mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Tùy chỉnh mức lương
                  </p>
                  <Slider
                    min={0}
                    max={200000000}
                    step={1000000}
                    value={[
                      filters.minSalary || 0,
                      filters.maxSalary || 200000000
                    ]}
                    onChange={handleSalaryChange}
                    formatLabel={(value) => formatCurrency(value).replace('₫', '').trim() + 'đ'}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Job Type Filter */}
          <div className="py-4 relative z-10">
            <button
              onClick={() => toggleSection('jobType')}
              className="w-full flex items-center justify-between mb-3"
            >
              <span className="font-semibold text-gray-900">Loại hình công việc</span>
              {isSectionExpanded('jobType') ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {isSectionExpanded('jobType') && (
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="jobType"
                    checked={!filters.jobType || filters.jobType.length === 0}
                    onChange={() => handleJobTypeChange(null)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Tất cả loại hình</span>
                </label>
                {JOB_TYPE_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="jobType"
                      checked={filters.jobType?.includes(option.value) || false}
                      onChange={() => handleJobTypeChange(option.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option.icon} {option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Experience Level Filter */}
          <div className="py-4 relative z-0">
            <button
              onClick={() => toggleSection('experience')}
              className="w-full flex items-center justify-between mb-3"
            >
              <span className="font-semibold text-gray-900">Kinh nghiệm</span>
              {isSectionExpanded('experience') ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {isSectionExpanded('experience') && (
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="experienceLevel"
                    checked={!filters.experienceLevel || filters.experienceLevel.length === 0}
                    onChange={() => handleExperienceLevelChange(null)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Tất cả kinh nghiệm</span>
                </label>
                {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="experienceLevel"
                      checked={filters.experienceLevel?.includes(option.value) || false}
                      onChange={() => handleExperienceLevelChange(option.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option.icon} {option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

export default JobFilters;