'use client';

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SkeletonCard
} from '@/components/ui';
import { APPLICATION_STATUS_OPTIONS } from '@/lib/constants';
import { formatDate, formatRelativeTime, formatSalaryRange } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  DollarSign,
  Eye,
  FileText,
  MapPin,
  RotateCcw,
  Search,
  Users
} from 'lucide-react';
import { useState } from 'react';

interface ApplicationHistoryProps {
  applications: any[];
  loading: boolean;
  onRefresh: () => void;
}

const ApplicationHistory = ({ applications, loading, onRefresh }: ApplicationHistoryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Debug log
  console.log('ApplicationHistory received applications:', applications);

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    ...APPLICATION_STATUS_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))
  ];

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'company', label: 'Theo công ty' },
    { value: 'status', label: 'Theo trạng thái' },
  ];

  // Filter and sort applications
  const filteredApplications = applications
    .filter(app => {
      const job = app.jobPostId;
      const company = job?.companyId;

      const matchesSearch = !searchQuery ||
        job?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'company':
          const companyA = a.jobPostId?.companyId?.name || '';
          const companyB = b.jobPostId?.companyId?.name || '';
          return companyA.localeCompare(companyB);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const getStatusStats = () => {
    return applications.reduce((acc: any, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
  };

  const statusStats = getStatusStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Lịch sử ứng tuyển ({applications.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {applications.length}
              </div>
              <div className="text-sm text-blue-700">Tổng đơn</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {statusStats.pending || 0}
              </div>
              <div className="text-sm text-yellow-700">Đang chờ</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {statusStats.reviewed || 0}
              </div>
              <div className="text-sm text-blue-700">Đã xem</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {statusStats.accepted || 0}
              </div>
              <div className="text-sm text-green-700">Được chấp nhận</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo vị trí, công ty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
              />
            </div>

            {/* Sort */}
            <div className="w-full md:w-48">
              <Select
                value={sortBy}
                onChange={setSortBy}
                options={sortOptions}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {applications.length === 0 ? 'Chưa có đơn ứng tuyển' : 'Không tìm thấy kết quả'}
            </h3>
            <p className="text-gray-600 mb-6">
              {applications.length === 0
                ? 'Bắt đầu tìm kiếm và ứng tuyển công việc mơ ước'
                : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              }
            </p>
            {applications.length === 0 && (
              <Button onClick={() => window.location.href = '/jobs'}>
                Tìm việc làm
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application, index) => {
            const job = application.jobPostId;
            const company = job?.companyId;
            const statusOption = APPLICATION_STATUS_OPTIONS.find(
              opt => opt.value === application.status
            );

            return (
              <motion.div
                key={application._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Company Avatar */}
                      <Avatar
                        src={company?.logoUrl}
                        name={company?.name}
                        size="lg"
                        className="flex-shrink-0"
                      />

                      {/* Job Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {job?.title}
                            </h3>
                            <p className="text-gray-600 mb-2">
                              {company?.name}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                              {job?.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{job.location}</span>
                                </div>
                              )}

                              {(job?.salaryMin || job?.salaryMax) && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  <span>{formatSalaryRange(job.salaryMin, job.salaryMax)}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Ứng tuyển {formatRelativeTime(application.createdAt)}</span>
                              </div>

                              {job?.jobType && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span className="capitalize">{job.jobType.replace('-', ' ')}</span>
                                </div>
                              )}

                              {job?.experienceLevel && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  <span className="capitalize">{job.experienceLevel}</span>
                                </div>
                              )}
                            </div>

                            {/* Cover Letter Preview */}
                            {application.message && (
                              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                <p className="text-sm text-gray-700 line-clamp-2">
                                  {application.message}
                                </p>
                              </div>
                            )}

                            {/* Job Description Preview */}
                            {job?.description && (
                              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                                <p className="text-sm text-gray-700 line-clamp-3">
                                  {job.description}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Status & Actions */}
                          <div className="flex flex-col items-end gap-3">
                            <Badge
                              style={{
                                backgroundColor: statusOption?.bgColor || '#f3f4f6',
                                color: statusOption?.color || '#6b7280'
                              }}
                            >
                              {statusOption?.label || application.status}
                            </Badge>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/jobs/${job?._id}`, '_blank')}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>Ứng tuyển: {formatDate(application.createdAt)}</span>
                            {application.reviewedAt && (
                              <>
                                <span>•</span>
                                <span>Xem xét: {formatDate(application.reviewedAt)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApplicationHistory;