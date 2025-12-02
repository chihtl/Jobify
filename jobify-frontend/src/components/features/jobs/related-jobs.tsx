'use client';

import { Card, CardContent, CardHeader, CardTitle, SkeletonJobCard } from '@/components/ui';
import { useApi } from '@/hooks/use-api';
import { jobsApi } from '@/lib/api';
import { useEffect } from 'react';
import JobCard from './job-card';

interface RelatedJobsProps {
  currentJobId: string;
  companyId?: string;
  categoryId?: string;
  skills?: string[];
  limit?: number;
}

const RelatedJobs = ({
  currentJobId,
  companyId,
  categoryId,
  skills = [],
  limit = 5
}: RelatedJobsProps) => {
  // Fetch related jobs by company
  const { data: companyJobs, loading: companyLoading } = useApi(
    () => companyId
      ? jobsApi.getJobs({
        companyId,
        limit: limit + 1, // +1 to account for current job
        page: 1
      })
      : Promise.resolve(null),
    [],
    { immediate: false }
  );

  // Fetch related jobs by category
  const { data: categoryJobs, loading: categoryLoading } = useApi(
    () => categoryId
      ? jobsApi.getJobs({
        categoryId,
        limit: limit + 1,
        page: 1
      })
      : Promise.resolve(null),
    [],
    { immediate: false }
  );

  // Fetch related jobs by skills
  const { data: skillJobs, loading: skillLoading } = useApi(
    () => skills.length > 0
      ? jobsApi.getJobs({
        skillIds: skills.slice(0, 3), // Limit to first 3 skills
        limit: limit + 1,
        page: 1
      })
      : Promise.resolve(null),
    [],
    { immediate: false }
  );

  useEffect(() => {
    // Trigger API calls when props change
  }, [companyId, categoryId, skills]);

  // Filter out current job and combine results
  const getUniqueRelatedJobs = () => {
    const allJobs = [
      ...(companyJobs?.data || []),
      ...(categoryJobs?.data || []),
      ...(skillJobs?.data || [])
    ];

    // Remove current job and duplicates
    const uniqueJobs = allJobs
      .filter(job => job._id !== currentJobId)
      .filter((job, index, self) =>
        index === self.findIndex(j => j._id === job._id)
      );

    // Prioritize: same company > same category > same skills
    const companyJobsFiltered = uniqueJobs.filter(job =>
      typeof job.companyId === 'object' && job.companyId._id === companyId
    );

    const categoryJobsFiltered = uniqueJobs.filter(job =>
      typeof job.categoryId === 'object' && job.categoryId._id === categoryId &&
      !(typeof job.companyId === 'object' && job.companyId._id === companyId)
    );

    const skillJobsFiltered = uniqueJobs.filter(job => {
      const jobSkills = Array.isArray(job.skillIds)
        ? job.skillIds.map(s => typeof s === 'object' ? s._id : s)
        : [];

      return skills.some(skillId => jobSkills.includes(skillId)) &&
        !(typeof job.companyId === 'object' && job.companyId._id === companyId) &&
        !(typeof job.categoryId === 'object' && job.categoryId._id === categoryId);
    });

    return [
      ...companyJobsFiltered,
      ...categoryJobsFiltered,
      ...skillJobsFiltered
    ].slice(0, limit);
  };

  const relatedJobs = getUniqueRelatedJobs();
  const loading = companyLoading || categoryLoading || skillLoading;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Việc làm liên quan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-32">
              <SkeletonJobCard className="h-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (relatedJobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Việc làm liên quan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-gray-600 text-sm">
              Không tìm thấy việc làm liên quan
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Việc làm liên quan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {relatedJobs.map((job) => (
          <div key={job._id} className="h-auto">
            <JobCard
              job={job}
              viewMode="list"
              compact
              showSaveButton={false}
              onClick={() => window.open(`/jobs/${job._id}`, '_blank')}
            />
          </div>
        ))}

        {relatedJobs.length >= limit && (
          <div className="text-center pt-4">
            <button
              onClick={() => {
                const params = new URLSearchParams();
                if (companyId) params.set('companyId', companyId);
                if (categoryId) params.set('categoryId', categoryId);
                if (skills.length > 0) params.set('skillIds', skills.join(','));

                window.open(`/jobs?${params.toString()}`, '_blank');
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Xem thêm việc làm tương tự →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RelatedJobs;