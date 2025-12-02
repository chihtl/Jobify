"use client";

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SkeletonCard,
} from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { API_BASE_URL, jobsApi } from "@/lib/api";
import { formatDate, formatRelativeTime, formatSalaryRange } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Eye,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
  AlertCircle,
  Users,
  Building2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface JobPost {
  _id: string;
  title: string;
  description: string;
  companyId: {
    _id: string;
    name: string;
    logoUrl?: string;
  };
  categoryId: {
    _id: string;
    name: string;
  };
  skillIds: Array<{
    _id: string;
    name: string;
  }>;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: string;
  experienceLevel: string;
  isActive: boolean;
  status: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

const JOB_STATUS_OPTIONS = [
  {
    value: "pending",
    label: "Chờ duyệt",
    color: "#f59e0b",
    bgColor: "#fef3c7",
    icon: Clock,
  },
  {
    value: "approved",
    label: "Đã duyệt",
    color: "#10b981",
    bgColor: "#d1fae5",
    icon: CheckCircle,
  },
  {
    value: "rejected",
    label: "Đã từ chối",
    color: "#ef4444",
    bgColor: "#fee2e2",
    icon: XCircle,
  },
];

const JOB_TYPE_OPTIONS = [
  { value: "full-time", label: "Toàn thời gian" },
  { value: "part-time", label: "Bán thời gian" },
  { value: "contract", label: "Hợp đồng" },
  { value: "freelance", label: "Freelance" },
];

const EXPERIENCE_LEVEL_OPTIONS = [
  { value: "entry", label: "Mới ra trường" },
  { value: "mid", label: "Trung cấp" },
  { value: "senior", label: "Cao cấp" },
  { value: "lead", label: "Trưởng nhóm" },
];

const ManageJobsPage = () => {
  const { user, userType, isLoading } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [experienceLevelFilter, setExperienceLevelFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // Handle authentication and authorization
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not logged in - redirect to login
        router.replace("/login?redirect=/manage-jobs");
      } else if (userType !== "admin" && userType !== "company") {
        // Logged in but wrong role - redirect to home
        router.replace("/");
      }
    }
  }, [isLoading, user, userType, router]);

  // Fetch jobs
  useEffect(() => {
    if (user && (userType === "admin" || userType === "company")) {
      fetchJobs();
    }
  }, [
    user,
    userType,
    currentPage,
    searchQuery,
    statusFilter,
    jobTypeFilter,
    experienceLevelFilter,
  ]);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const params: any = {
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        jobType: jobTypeFilter !== "all" ? jobTypeFilter : undefined,
        experienceLevel:
          experienceLevelFilter !== "all" ? experienceLevelFilter : undefined,
      };

      // Admin có thể filter theo status, Company thì không
      if (userType === "admin") {
        params.status = statusFilter !== "all" ? statusFilter : undefined;
      }

      let response;
      if (userType === "company") {
        // Company chỉ xem jobs của mình
        response = await jobsApi.getJobsByCompany(user?._id || "", params);
      } else {
        // Admin xem tất cả jobs
        response = await jobsApi.getJobsByAdmin(params);
      }

      if (response?.data) {
        setJobs(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalItems(response.data.pagination?.totalItems || 0);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Có lỗi xảy ra khi tải danh sách việc làm");
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (jobId: string, status: string) => {
    try {
      setUpdating(jobId);
      await jobsApi.updateJob(jobId, { status });

      // Update local state
      setJobs((prev) =>
        prev.map((job) =>
          job._id === jobId
            ? { ...job, status, updatedAt: new Date().toISOString() }
            : job
        )
      );

      toast.success("Đã cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Error updating job status:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    } finally {
      setUpdating(null);
    }
  };

  const toggleJobActive = async (jobId: string) => {
    try {
      setUpdating(jobId);
      await jobsApi.toggleJobActive(jobId);

      // Update local state
      setJobs((prev) =>
        prev.map((job) =>
          job._id === jobId
            ? {
                ...job,
                isActive: !job.isActive,
                updatedAt: new Date().toISOString(),
              }
            : job
        )
      );

      toast.success("Đã cập nhật trạng thái kích hoạt!");
    } catch (error) {
      console.error("Error toggling job active:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái kích hoạt");
    } finally {
      setUpdating(null);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa việc làm này?")) {
      return;
    }

    try {
      setUpdating(jobId);
      await jobsApi.deleteJob(jobId);

      // Remove from local state
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
      setTotalItems((prev) => prev - 1);

      toast.success("Đã xóa việc làm thành công!");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Có lỗi xảy ra khi xóa việc làm");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusOption = (status: string) => {
    return JOB_STATUS_OPTIONS.find((option) => option.value === status);
  };

  const getJobTypeLabel = (jobType: string) => {
    return (
      JOB_TYPE_OPTIONS.find((option) => option.value === jobType)?.label ||
      jobType
    );
  };

  const getExperienceLevelLabel = (level: string) => {
    return (
      EXPERIENCE_LEVEL_OPTIONS.find((option) => option.value === level)
        ?.label || level
    );
  };

  const getStatusStats = () => {
    return jobs.reduce(
      (acc: any, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        acc.active = acc.active || 0;
        acc.inactive = acc.inactive || 0;
        if (job.isActive) acc.active++;
        else acc.inactive++;
        return acc;
      },
      { total: jobs.length, active: 0, inactive: 0 }
    );
  };

  const statusStats = getStatusStats();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <SkeletonCard />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // After loading, if user is not authorized, render nothing while redirect happens
  if (!user || (userType !== "admin" && userType !== "company")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Quản lý việc làm
                </h1>
                <p className="text-gray-600 mt-1">
                  {userType === "admin"
                    ? "Quản lý tất cả việc làm trong hệ thống"
                    : "Quản lý các việc làm của công ty bạn"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={fetchJobs}
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Làm mới
                </Button>
                {userType === "company" && (
                  <Button
                    onClick={() => router.push("/create-job")}
                    className="flex items-center gap-2"
                  >
                    <Briefcase className="w-4 h-4" />
                    Đăng việc mới
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {totalItems}
              </div>
              <div className="text-sm text-blue-700">Tổng việc làm</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {statusStats.active || 0}
              </div>
              <div className="text-sm text-green-700">Đang hoạt động</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {statusStats.inactive || 0}
              </div>
              <div className="text-sm text-gray-700">Tạm dừng</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {statusStats.pending || 0}
              </div>
              <div className="text-sm text-yellow-700">Chờ duyệt</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {statusStats.approved || 0}
              </div>
              <div className="text-sm text-green-700">Đã duyệt</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {statusStats.rejected || 0}
              </div>
              <div className="text-sm text-red-700">Đã từ chối</div>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Bộ lọc
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm việc làm..."
                    value={searchQuery}
                    onChange={(value) => {
                      setSearchQuery(value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>

                {/* Status Filter - Only for Admin */}
                {userType === "admin" && (
                  <Select
                    value={statusFilter}
                    onChange={(value) => {
                      setStatusFilter(value);
                      setCurrentPage(1);
                    }}
                    options={[
                      { value: "all", label: "Tất cả trạng thái" },
                      ...JOB_STATUS_OPTIONS.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                      })),
                    ]}
                  />
                )}

                {/* Job Type Filter */}
                <Select
                  value={jobTypeFilter}
                  onChange={(value) => {
                    setJobTypeFilter(value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "Tất cả loại hình" },
                    ...JOB_TYPE_OPTIONS,
                  ]}
                />

                {/* Experience Level Filter */}
                <Select
                  value={experienceLevelFilter}
                  onChange={(value) => {
                    setExperienceLevelFilter(value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "Tất cả cấp độ" },
                    ...EXPERIENCE_LEVEL_OPTIONS,
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Jobs List */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Không tìm thấy việc làm nào
                </h3>
                <p className="text-gray-600">
                  {userType === "company"
                    ? "Hãy đăng việc làm đầu tiên của bạn"
                    : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                {jobs.map((job, index) => {
                  const statusOption = getStatusOption(job.status);
                  const StatusIcon = statusOption?.icon || AlertCircle;

                  return (
                    <motion.div
                      key={job._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            {/* Company Avatar */}
                            <Avatar
                              src={
                                job.companyId?.logoUrl
                                  ? `${API_BASE_URL}${job.companyId.logoUrl}`
                                  : undefined
                              }
                              name={job.companyId?.name || "Unknown Company"}
                              size="lg"
                              className="flex-shrink-0"
                            />

                            {/* Job Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {job.title || "Việc làm không có tiêu đề"}
                                    </h3>
                                    <Badge
                                      style={{
                                        backgroundColor:
                                          statusOption?.bgColor || "#f3f4f6",
                                        color: statusOption?.color || "#6b7280",
                                      }}
                                      className="flex items-center gap-1"
                                    >
                                      <StatusIcon className="w-3 h-3" />
                                      {statusOption?.label || job.status}
                                    </Badge>
                                    <Badge
                                      variant={
                                        job.isActive ? "default" : "secondary"
                                      }
                                    >
                                      {job.isActive ? "Hoạt động" : "Tạm dừng"}
                                    </Badge>
                                  </div>

                                  <div className="flex items-center gap-2 mb-2">
                                    <Building2 className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium text-gray-800">
                                      {job.companyId?.name || "Unknown Company"}
                                    </span>
                                  </div>

                                  <p className="text-gray-600 mb-3 line-clamp-2">
                                    {job.description || "Không có mô tả"}
                                  </p>

                                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                                    {job.location && (
                                      <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{job.location}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <Users className="w-4 h-4" />
                                      <span>
                                        {getJobTypeLabel(job.jobType)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Briefcase className="w-4 h-4" />
                                      <span>
                                        {getExperienceLevelLabel(
                                          job.experienceLevel
                                        )}
                                      </span>
                                    </div>
                                    {(job.salaryMin || job.salaryMax) && (
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="w-4 h-4" />
                                        <span>
                                          {formatSalaryRange(
                                            job.salaryMin,
                                            job.salaryMax
                                          )}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      <span>
                                        {formatRelativeTime(job.createdAt)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Skills */}
                                  {job.skillIds && job.skillIds.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                      {job.skillIds.slice(0, 5).map((skill) => (
                                        <Badge
                                          key={skill._id}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {skill.name}
                                        </Badge>
                                      ))}
                                      {job.skillIds.length > 5 && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          +{job.skillIds.length - 5} khác
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col items-end gap-3">
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        window.open(
                                          `/jobs/${job._id}`,
                                          "_blank"
                                        )
                                      }
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        router.push(`/jobs/${job._id}/edit`)
                                      }
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => deleteJob(job._id)}
                                      disabled={updating === job._id}
                                      className="text-red-600 border-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  {/* Status Actions - Only for Admin */}
                                  {userType === "admin" &&
                                    job.status === "pending" && (
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            updateJobStatus(job._id, "approved")
                                          }
                                          disabled={updating === job._id}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <CheckCircle className="w-4 h-4 mr-1" />
                                          Duyệt
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            updateJobStatus(job._id, "rejected")
                                          }
                                          disabled={updating === job._id}
                                          className="text-red-600 border-red-600 hover:bg-red-50"
                                        >
                                          <XCircle className="w-4 h-4 mr-1" />
                                          Từ chối
                                        </Button>
                                      </div>
                                    )}

                                  {/* Toggle Active */}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggleJobActive(job._id)}
                                    disabled={updating === job._id}
                                    className={
                                      job.isActive
                                        ? "text-orange-600 border-orange-600 hover:bg-orange-50"
                                        : "text-green-600 border-green-600 hover:bg-green-50"
                                    }
                                  >
                                    {job.isActive ? "Tạm dừng" : "Kích hoạt"}
                                  </Button>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage <= 1 || loading}
                  >
                    Trước
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "primary" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          disabled={loading}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage >= totalPages || loading}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageJobsPage;
