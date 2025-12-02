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
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Building2,
  Calendar,
  Clock,
  Download,
  Eye,
  FileText,
  RefreshCw,
  Search
} from 'lucide-react';
import { useState } from 'react';

interface ApplicationOverviewProps {
  applications: any[];
  loading: boolean;
  onRefresh: () => void;
}

const ApplicationOverview = ({ applications, loading, onRefresh }: ApplicationOverviewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    ...APPLICATION_STATUS_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))
  ];

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'job', label: 'Theo công việc' },
    { value: 'company', label: 'Theo công ty' },
  ];

  // Filter and sort applications
  const filteredApplications = applications
    .filter(app => {
      const job = app.jobPostId;
      const company = job?.companyId;
      const user = app.userId;

      const matchesSearch = !searchQuery ||
        job?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'job':
          return (a.jobPostId?.title || '').localeCompare(b.jobPostId?.title || '');
        case 'company':
          const companyA = a.jobPostId?.companyId?.name || '';
          const companyB = b.jobPostId?.companyId?.name || '';
          return companyA.localeCompare(companyB);
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
              Đơn ứng tuyển ({applications.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
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
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {statusStats.accepted || 0}
              </div>
              <div className="text-sm text-green-700">Đã chấp nhận</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {statusStats.rejected || 0}
              </div>
              <div className="text-sm text-red-700">Đã từ chối</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo ứng viên, công việc, công ty..."
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
            <p className="text-gray-600">
              {applications.length === 0
                ? 'Chưa có ứng viên nào gửi đơn ứng tuyển'
                : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application, index) => {
            const job = application.jobPostId;
            const company = job?.companyId;
            const user = application.userId;
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
                      {/* User Avatar */}
                      <Avatar
                        src={user?.avatarUrl}
                        name={user?.name}
                        size="lg"
                        className="flex-shrink-0"
                      />

                      {/* Application Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {user?.name}
                              </h3>
                              <Badge variant={statusOption?.variant || 'secondary'}>
                                {statusOption?.label || application.status}
                              </Badge>
                            </div>

                            <p className="text-gray-600 mb-2">
                              Ứng tuyển: <span className="font-medium">{job?.title}</span>
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                              <div className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                <span>{company?.name}</span>
                              </div>

                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Ứng tuyển {formatRelativeTime(application.createdAt)}</span>
                              </div>

                              {application.expectedSalary && (
                                <div className="flex items-center gap-1">
                                  <span>Lương mong muốn: {(application.expectedSalary / 1000000).toFixed(0)}M VNĐ</span>
                                </div>
                              )}
                            </div>

                            {/* Cover Letter Preview */}
                            {application.coverLetter && (
                              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                <h4 className="font-medium text-gray-900 mb-1 text-sm">
                                  Thư xin việc:
                                </h4>
                                <p className="text-sm text-gray-700 line-clamp-2">
                                  {application.coverLetter}
                                </p>
                              </div>
                            )}

                            {/* Contact Info */}
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center gap-4">
                                <span>📧 {user?.email}</span>
                                {user?.phone && <span>📞 {user?.phone}</span>}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/jobs/${job?._id}`, '_blank')}
                              className="flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              Xem tin
                            </Button>

                            {user?.resumeUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(user.resumeUrl, '_blank')}
                                className="flex items-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Tải CV
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Ứng tuyển: {formatDate(application.createdAt)}</span>
                            </div>
                            {application.reviewedAt && (
                              <>
                                <span>•</span>
                                <span>Xem xét: {formatDate(application.reviewedAt)}</span>
                              </>
                            )}
                            {application.availableDate && (
                              <>
                                <span>•</span>
                                <span>Có thể bắt đầu: {formatDate(application.availableDate)}</span>
                              </>
                            )}
                          </div>

                          {application.portfolioUrl && (
                            <div className="mt-2">
                              <a
                                href={application.portfolioUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                🔗 Portfolio: {application.portfolioUrl}
                              </a>
                            </div>
                          )}
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

export default ApplicationOverview;