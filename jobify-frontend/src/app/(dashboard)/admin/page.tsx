'use client';

import AdminStats from '@/components/features/admin/admin-stats';
import ApplicationOverview from '@/components/features/admin/application-overview';
import JobApprovalList from '@/components/features/admin/job-approval-list';
import SystemReports from '@/components/features/admin/system-reports';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select
} from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useApi, useMutation } from '@/hooks/use-api';
import { adminsApi, applicationApi, jobsApi } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Briefcase,
  FileText,
  RefreshCw,
  Search,
  Shield,
  TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user, userType } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('overview');
  const [pendingJobsFilter, setPendingJobsFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (user && userType !== 'admin') {
      router.push('/');
      toast.error('Chỉ có quản trị viên mới có thể truy cập trang này');
    }
  }, [user, userType, router]);

  // Fetch system stats
  const {
    data: systemStats,
    loading: statsLoading,
    refetch: refetchStats
  } = useApi(
    () => adminsApi.getSystemStats(),
    [],
    { immediate: true }
  );

  // Fetch pending jobs for approval
  const {
    data: pendingJobs,
    loading: jobsLoading,
    refetch: refetchJobs
  } = useApi(
    () => jobsApi.getJobs({ status: 'pending', limit: 50 }),
    [],
    { immediate: true }
  );

  // Fetch recent applications
  const {
    data: recentApplications,
    loading: applicationsLoading,
    refetch: refetchApplications
  } = useApi(
    () => applicationApi.getApplications({ limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }),
    [],
    { immediate: true }
  );

  // Job approval mutations
  const { mutate: approveJob, loading: approvingJob } = useMutation(
    (jobId: string) => jobsApi.updateJob(jobId, { isActive: true, status: 'approved' }),
    {
      onSuccess: () => {
        toast.success('Đã phê duyệt tin tuyển dụng');
        refetchJobs();
        refetchStats();
      },
      onError: () => {
        toast.error('Có lỗi xảy ra khi phê duyệt');
      }
    }
  );

  const { mutate: rejectJob, loading: rejectingJob } = useMutation(
    (data: { jobId: string, reason?: string }) =>
      jobsApi.updateJob(data.jobId, { isActive: false, status: 'rejected', rejectionReason: data.reason }),
    {
      onSuccess: () => {
        toast.success('Đã từ chối tin tuyển dụng');
        refetchJobs();
        refetchStats();
      },
      onError: () => {
        toast.error('Có lỗi xảy ra khi từ chối');
      }
    }
  );

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: TrendingUp },
    { id: 'jobs', label: 'Phê duyệt việc làm', icon: Briefcase },
    { id: 'applications', label: 'Đơn ứng tuyển', icon: FileText },
    { id: 'reports', label: 'Báo cáo', icon: Shield },
  ];

  const handleJobApproval = (jobId: string, action: 'approve' | 'reject', reason?: string) => {
    if (action === 'approve') {
      approveJob(jobId);
    } else {
      rejectJob({ jobId, reason });
    }
  };

  const filteredJobs = pendingJobs?.data?.filter((job: unknown) => {
    const jobData = job as { title?: string; companyId?: { name?: string }; expiresAt?: string };
    const matchesSearch = !searchQuery ||
      jobData.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobData.companyId?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = pendingJobsFilter === 'all' ||
      (pendingJobsFilter === 'urgent' && new Date(jobData.expiresAt || '').getTime() < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getTime());

    return matchesSearch && matchesFilter;
  }) || [];

  if (!user || userType !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Chỉ dành cho quản trị viên
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn cần quyền quản trị viên để truy cập trang này.
          </p>
          <Button onClick={() => router.push('/login?type=admin')}>
            Đăng nhập Admin
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Quản lý hệ thống Jobify
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    refetchStats();
                    refetchJobs();
                    refetchApplications();
                  }}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Làm mới
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.id === 'jobs' && pendingJobs?.data?.length > 0 && (
                      <Badge variant="danger" size="sm">
                        {pendingJobs.data.length}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* System Stats */}
                <AdminStats stats={systemStats} loading={statsLoading} />

                {/* Quick Actions & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Thao tác nhanh</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button
                        onClick={() => setActiveTab('jobs')}
                        className="w-full justify-start"
                        variant={pendingJobs?.data?.length > 0 ? 'primary' : 'outline'}
                      >
                        <Briefcase className="w-4 h-4 mr-2" />
                        Phê duyệt việc làm ({pendingJobs?.data?.length || 0} chờ xử lý)
                      </Button>

                      <Button
                        onClick={() => setActiveTab('applications')}
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Xem đơn ứng tuyển mới
                      </Button>

                      <Button
                        onClick={() => setActiveTab('reports')}
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Xem báo cáo hệ thống
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Hoạt động gần đây</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {applicationsLoading ? (
                        <div className="space-y-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-4 bg-gray-200 rounded mb-2" />
                              <div className="h-3 bg-gray-100 rounded w-2/3" />
                            </div>
                          ))}
                        </div>
                      ) : recentApplications?.data?.length > 0 ? (
                        <div className="space-y-3">
                          {recentApplications.data.slice(0, 5).map((application: unknown) => {
                            const appData = application as {
                              _id: string;
                              userId?: { name?: string };
                              jobPostId?: { title?: string };
                              createdAt?: string
                            };
                            return (
                              <div key={appData._id} className="text-sm">
                                <p className="text-gray-900">
                                  <span className="font-medium">
                                    {appData.userId?.name}
                                  </span>
                                  {' '}đã ứng tuyển{' '}
                                  <span className="font-medium">
                                    {appData.jobPostId?.title}
                                  </span>
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {formatRelativeTime(appData.createdAt || '')}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Chưa có hoạt động nào</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Jobs Approval Tab */}
            {activeTab === 'jobs' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Phê duyệt việc làm</h2>
                    <p className="text-gray-600 mt-1">
                      {pendingJobs?.data?.length > 0
                        ? `Có ${pendingJobs.data.length} tin tuyển dụng đang chờ phê duyệt`
                        : 'Không có tin tuyển dụng nào cần phê duyệt'
                      }
                    </p>
                  </div>
                </div>

                {/* Filters */}
                {pendingJobs?.data?.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            placeholder="Tìm kiếm tin tuyển dụng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <Select
                          value={pendingJobsFilter}
                          onChange={setPendingJobsFilter}
                          options={[
                            { value: 'all', label: 'Tất cả' },
                            { value: 'urgent', label: 'Sắp hết hạn (< 7 ngày)' }
                          ]}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Job List */}
                <JobApprovalList
                  jobs={filteredJobs}
                  loading={jobsLoading}
                  onApprove={(jobId) => handleJobApproval(jobId, 'approve')}
                  onReject={(jobId, reason) => handleJobApproval(jobId, 'reject', reason)}
                  approving={approvingJob}
                  rejecting={rejectingJob}
                />
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <ApplicationOverview
                applications={recentApplications?.data || []}
                loading={applicationsLoading}
                onRefresh={refetchApplications}
              />
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <SystemReports
                stats={systemStats}
                loading={statsLoading}
                onRefresh={refetchStats}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;