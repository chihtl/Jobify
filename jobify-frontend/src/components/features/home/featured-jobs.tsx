'use client';

import { Badge, Button, Card, CardContent } from '@/components/ui';
import { useApi } from '@/hooks/use-api';
import { jobsApi } from '@/lib/api';
import { ANIMATION_VARIANTS } from '@/lib/constants';
import { JobPost } from '@/lib/types';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Clock, MapPin, Users } from 'lucide-react';

const FeaturedJobs = () => {
  const { data: jobsResponse, loading } = useApi(
    () => jobsApi.getJobs({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' }),
    [],
    { immediate: true }
  );

  const jobs = jobsResponse?.data || [];

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          {...ANIMATION_VARIANTS.fadeIn}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Việc làm nổi bật
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Những cơ hội việc làm tốt nhất từ các công ty hàng đầu
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={ANIMATION_VARIANTS.stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {jobs.map((job: JobPost) => (
            <motion.div
              key={job._id}
              variants={ANIMATION_VARIANTS.slideUp}
            >
              <Card
                hoverable
                className="h-full cursor-pointer group"
                onClick={() => window.location.href = `/jobs/${job._id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {job.title || 'Chưa có tiêu đề'}
                      </h3>

                      {/* Company Info */}
                      <div className="flex items-center text-gray-600 mb-2">
                        <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm truncate">
                          {job.companyId && typeof job.companyId === 'object' && job.companyId.name
                            ? job.companyId.name
                            : 'Công ty chưa cập nhật'}
                        </span>
                      </div>

                      {/* Location */}
                      {job.location && (
                        <div className="flex items-center text-gray-600 mb-3">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-sm truncate">{job.location}</span>
                        </div>
                      )}

                      {/* Job Type & Experience */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        {job.jobType && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span className="capitalize">
                              {job.jobType === 'full-time' ? 'Toàn thời gian' :
                                job.jobType === 'part-time' ? 'Bán thời gian' :
                                  job.jobType === 'contract' ? 'Hợp đồng' :
                                    job.jobType === 'freelance' ? 'Freelance' : job.jobType}
                            </span>
                          </div>
                        )}
                        {job.experienceLevel && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span className="capitalize">
                              {job.experienceLevel === 'entry' ? 'Mới tốt nghiệp' :
                                job.experienceLevel === 'mid' ? 'Mid-level' :
                                  job.experienceLevel === 'senior' ? 'Senior' :
                                    job.experienceLevel === 'lead' ? 'Lead' :
                                      String(job.experienceLevel)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Time Badge */}
                    <Badge variant="outline" className="ml-2 flex-shrink-0">
                      {job.createdAt ? formatRelativeTime(job.createdAt) : 'Mới đăng'}
                    </Badge>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Array.isArray(job.skillIds) && job.skillIds.length > 0 ? (
                      job.skillIds.slice(0, 3).map((skill: unknown, index: number) => {
                        // Debug logging
                        console.log('Skill item:', skill, 'Type:', typeof skill);

                        // Kiểm tra nếu skill là object có name (đã được populate)
                        if (typeof skill === 'object' && skill && 'name' in skill && skill.name) {
                          return (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {String(skill.name)}
                            </Badge>
                          );
                        }

                        // Nếu skill là string và có vẻ như là ID (24 ký tự hex), bỏ qua
                        if (typeof skill === 'string' && /^[a-f0-9]{24}$/i.test(skill)) {
                          console.log('Skipping skill ID:', skill);
                          return null;
                        }

                        // Nếu skill là string khác (có thể là tên skill), hiển thị
                        if (typeof skill === 'string' && skill.trim()) {
                          return (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill.trim()}
                            </Badge>
                          );
                        }

                        // Nếu skill là object nhưng không có name, bỏ qua
                        if (typeof skill === 'object' && skill && '_id' in skill) {
                          console.log('Skill object without name:', skill);
                          return null;
                        }

                        return null;
                      }).filter(Boolean) // Lọc bỏ null values
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Chưa có kỹ năng
                      </Badge>
                    )}
                  </div>

                  {/* Salary & Action */}
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-green-600">
                      {job.salaryMin || job.salaryMax ? (
                        <>
                          {formatCurrency(job.salaryMin || 0)}
                          {job.salaryMin && job.salaryMax && job.salaryMin !== job.salaryMax && (
                            <> - {formatCurrency(job.salaryMax)}</>
                          )}
                          {!job.salaryMin && job.salaryMax && '+'}
                        </>
                      ) : (
                        'Thỏa thuận'
                      )}
                    </div>

                    <Badge
                      variant={job.jobType === 'full-time' ? 'success' :
                        job.jobType === 'part-time' ? 'warning' :
                          job.jobType === 'contract' ? 'secondary' : 'outline'}
                    >
                      {job.jobType === 'full-time' ? 'Toàn thời gian' :
                        job.jobType === 'part-time' ? 'Bán thời gian' :
                          job.jobType === 'contract' ? 'Hợp đồng' :
                            job.jobType === 'freelance' ? 'Freelance' :
                              job.jobType || 'Không xác định'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            onClick={() => window.location.href = '/jobs'}
          >
            Xem tất cả việc làm
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;