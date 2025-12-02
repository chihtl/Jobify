'use client';

import ApplicationHistory from '@/components/features/profile/application-history';
import ProfileEdit from '@/components/features/profile/profile-edit';
import ResumeUpload from '@/components/features/profile/resume-upload';
import SavedJobsList from '@/components/features/profile/saved-jobs-list';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SkeletonCard
} from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useApi, useMutation } from '@/hooks/use-api';
import { API_BASE_URL, applicationsApi, usersApi } from '@/lib/api';
import { APPLICATION_STATUS_OPTIONS } from '@/lib/constants';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  Heart,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Settings,
  User,
  XCircle
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user: authUser, userType, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize activeTab from query params or default to 'overview'
  const [activeTab, setActiveTab] = useState(() => {
    const tabFromQuery = searchParams.get('tab');
    const validTabs = ['overview', 'applications', 'saved', 'settings'];
    return validTabs.includes(tabFromQuery || '') ? tabFromQuery : 'overview';
  });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/login?redirect=/profile');
    }
  }, [authUser, authLoading, router]);

  // Sync activeTab with query params when URL changes
  useEffect(() => {
    const tabFromQuery = searchParams.get('tab');
    const validTabs = ['overview', 'applications', 'saved', 'settings'];
    if (validTabs.includes(tabFromQuery || '')) {
      setActiveTab(tabFromQuery!);
    }
  }, [searchParams]);

  // Fetch current user data from API
  const {
    data: user,
    loading: userLoading,
    refetch: refetchUser
  } = useApi(
    () => authUser ? usersApi.getUserById(authUser._id) : Promise.resolve({ data: null }),
    [],
    { immediate: false }
  );

  useEffect(() => {
    if (authUser) {
      refetchUser();
    }
  }, [authUser, refetchUser]);

  // Fetch user applications
  const { mutate: fetchApplications, loading: applicationsLoading, } = useMutation(
    (userId: string) => applicationsApi.getApplicationsByUserSimple(userId),
    {
      onSuccess: (data) => {
        setApplications(data)
        console.log('Applications fetched successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to fetch applications:', error);
      },
    }
  );

  useEffect(() => {
    if (user) {
      fetchApplications(user._id);
    }
  }, [user]);

  const refetchApplications = () => {
    if (user) {
      fetchApplications(user._id);
    }
  }

  const applicationStats = useMemo(() => {
    if (!applications) return { total: 0, pending: 0, accepted: 0, rejected: 0 };

    const stats = applications.reduce((acc: any, app: any) => {
      acc.total++;
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, { total: 0, pending: 0, reviewed: 0, accepted: 0, rejected: 0 });

    return stats;
  }, [applications])

  // Debug log
  console.log('Profile page applications data:', applications);

  const isLoading = authLoading || userLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <SkeletonCard />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <div className="lg:col-span-2">
                <SkeletonCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: User },
    { id: 'applications', label: 'Ứng tuyển', icon: Briefcase },
    { id: 'saved', label: 'Đã lưu', icon: Heart },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Update URL with new tab parameter
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('tab', tabId);
    router.push(`/profile?${newSearchParams.toString()}`, { scroll: false });
  };

  const handleProfileUpdate = () => {
    setShowEditProfile(false);
    // Refetch user data after profile update
    refetchUser();
  };

  const handleResumeUpdate = () => {
    setShowResumeUpload(false);
    toast.success('Cập nhật CV thành công!');
    // Refetch user data after resume update
    refetchUser();
  };

  // Calculate profile completion
  const getProfileCompletion = () => {
    if (!user) return { percentage: 0, items: [] };

    const items = [
      {
        id: 'basic_info',
        label: 'Thông tin cơ bản',
        completed: !!(user.name && user.email && user.phone && user.location && user.bio),
        weight: 25
      },
      {
        id: 'email_verified',
        label: 'Email xác thực',
        completed: true, // Assuming email is always verified if user exists
        weight: 25
      },
      {
        id: 'resume',
        label: 'CV đã tải lên',
        completed: !!user.resumeUrl,
        weight: 25
      },
      {
        id: 'avatar',
        label: 'Ảnh đại diện',
        completed: !!user.avatarUrl,
        weight: 25
      }
    ];

    const completedWeight = items
      .filter(item => item.completed)
      .reduce((sum, item) => sum + item.weight, 0);

    return {
      percentage: completedWeight,
      items
    };
  };

  const profileCompletion = getProfileCompletion();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Profile Photo */}
              <div className="relative">
                <Avatar
                  src={user.avatarUrl ? `${API_BASE_URL}${user.avatarUrl}` : undefined}
                  name={user.name}
                  size="xl"
                  className="border-4 border-white shadow-lg"
                />
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="absolute bottom-0 right-0 w-7 cursor-pointer h-7 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {user.name}
                    </h1>
                    <div className="space-y-1 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      {user.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{user.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Tham gia {formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowEditProfile(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Chỉnh sửa
                    </Button>
                    {user.resumeUrl && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(`${API_BASE_URL}${user.resumeUrl}`, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Tải CV
                      </Button>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {applicationStats.total}
                    </div>
                    <div className="text-sm text-blue-700">Đơn ứng tuyển</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {applicationStats.accepted || 0}
                    </div>
                    <div className="text-sm text-green-700">Được chấp nhận</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {applicationStats.pending || 0}
                    </div>
                    <div className="text-sm text-yellow-700">Đang chờ</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      0
                    </div>
                    <div className="text-sm text-gray-700">Đã lưu</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Profile Completion */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Hoàn thiện hồ sơ
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Tổng quan</span>
                          <span className="text-sm font-medium">{profileCompletion.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${profileCompletion.percentage}%` }} 
                          />
                        </div>

                        <div className="space-y-2 text-sm">
                          {profileCompletion.items.map((item) => (
                            <div 
                              key={item.id}
                              className={`flex items-center gap-2 ${
                                item.completed ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {item.completed ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              <span>{item.label}</span>
                            </div>
                          ))}
                        </div>

                        <Button
                          size="sm"
                          onClick={() => setShowEditProfile(true)}
                          className="w-full"
                        >
                          Hoàn thiện hồ sơ
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Resume Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        CV của tôi
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {user.resumeUrl ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <FileText className="w-8 h-8 text-blue-600" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900">CV hiện tại</p>
                              <p className="text-sm text-gray-500">
                                Cập nhật {formatRelativeTime(user.updatedAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`${API_BASE_URL}${user.resumeUrl}`, '_blank')}
                              className="flex-1"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Xem
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowResumeUpload(true)}
                              className="flex-1"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Cập nhật
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <h3 className="font-medium text-gray-900 mb-1">
                            Chưa có CV
                          </h3>
                          <p className="text-sm text-gray-500 mb-4">
                            Tải lên CV để tăng cơ hội được tuyển dụng
                          </p>
                          <Button
                            onClick={() => setShowResumeUpload(true)}
                            size="sm"
                          >
                            Tải lên CV
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Bio Section */}
                  {user.bio && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Giới thiệu
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recent Applications */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="w-5 h-5" />
                          Ứng tuyển gần đây
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab('applications')}
                        >
                          Xem tất cả
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {applicationsLoading ? (
                        <div className="space-y-4">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-20 bg-gray-200 rounded-lg" />
                            </div>
                          ))}
                        </div>
                      ) : applications?.length > 0 ? (
                        <div className="space-y-4">
                          {applications.slice(0, 3).map((application: any) => {
                            const job = application.jobPostId;
                            const company = job?.companyId;
                            const statusOption = APPLICATION_STATUS_OPTIONS.find(
                              opt => opt.value === application.status
                            );

                            return (
                              <div
                                key={application._id}
                                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <Avatar
                                  src={company?.logoUrl}
                                  name={company?.name}
                                  size="md"
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 truncate">
                                    {job?.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 truncate">
                                    {company?.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                      {formatRelativeTime(application.createdAt)}
                                    </span>
                                  </div>
                                </div>
                                <Badge
                                  style={{
                                    backgroundColor: statusOption?.bgColor || '#f3f4f6',
                                    color: statusOption?.color || '#6b7280'
                                  }}
                                >
                                  {statusOption?.label || application.status}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <h3 className="font-medium text-gray-900 mb-1">
                            Chưa có đơn ứng tuyển
                          </h3>
                          <p className="text-sm text-gray-500 mb-4">
                            Bắt đầu tìm kiếm và ứng tuyển công việc mơ ước
                          </p>
                          <Button
                            onClick={() => router.push('/jobs')}
                            size="sm"
                          >
                            Tìm việc làm
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'applications' && (
              <ApplicationHistory
                applications={applications || []}
                loading={applicationsLoading}
                onRefresh={refetchApplications}
              />
            )}

            {activeTab === 'saved' && (
              <SavedJobsList userId={user._id} />
            )}

            {activeTab === 'settings' && (
              <Card>
                <CardHeader>
                  <CardTitle>Cài đặt tài khoản</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <Settings className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="font-medium text-gray-900 mb-1">
                        Đang phát triển
                      </h3>
                      <p className="text-sm text-gray-500">
                        Tính năng cài đặt sẽ được cập nhật sớm
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <ProfileEdit
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        user={user}
        onSuccess={handleProfileUpdate}
      />

      <ResumeUpload
        isOpen={showResumeUpload}
        onClose={() => setShowResumeUpload(false)}
        user={user}
        onSuccess={handleResumeUpdate}
      />
    </div>
  );
};

export default ProfilePage;