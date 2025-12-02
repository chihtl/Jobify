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
import BookingModal from "@/components/features/bookings/booking-modal";
import { useAuth } from "@/contexts/auth-context";
import { API_BASE_URL, applicationsApi, bookingsApi } from "@/lib/api";
import { APPLICATION_STATUS_OPTIONS } from "@/lib/constants";
import { formatDate, formatRelativeTime, formatSalaryRange } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Clock3,
  DollarSign,
  Eye,
  FileText,
  Filter,
  Mail,
  MapPin,
  Phone,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Application {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    resumeUrl?: string;
  };
  jobPostId: {
    _id: string;
    title: string;
    description: string;
    location: string;
    salaryMin?: number;
    salaryMax?: number;
    jobType: string;
    experienceLevel: string;
    companyId: {
      _id: string;
      name: string;
      logoUrl?: string;
    };
    categoryId: {
      _id: string;
      name: string;
    };
  };
  status: string;
  message?: string;
  resumeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const ApplicationsPage = () => {
  const { user, userType, isLoading } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Booking modal state
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    candidateId: string;
    candidateName: string;
    applicationId: string;
  }>({
    isOpen: false,
    candidateId: "",
    candidateName: "",
    applicationId: "",
  });

  // Track existing bookings
  const [existingBookings, setExistingBookings] = useState<Record<string, any>>(
    {}
  );

  // Redirect if not logged in or not company user
  useEffect(() => {
    if (!isLoading && (!user || userType !== "company")) {
      router.push("/login?redirect=/applications");
    }
  }, [user, userType, isLoading, router]);

  // Fetch applications for the company
  useEffect(() => {
    if (user && userType === "company") {
      fetchApplications();
    }
  }, [user, userType]);

  // Check existing bookings for applications
  useEffect(() => {
    if (applications.length > 0) {
      checkExistingBookings();
    }
  }, [applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationsApi.getApplicationsByCompanyDetailed(
        user._id
      );
      if (response?.data) {
        setApplications(response.data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      await applicationsApi.updateApplicationStatus(applicationId, newStatus);
      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId
            ? { ...app, status: newStatus, updatedAt: new Date().toISOString() }
            : app
        )
      );
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  const checkExistingBookings = async () => {
    try {
      const bookingChecks = await Promise.all(
        applications.map((app) =>
          bookingsApi
            .checkExisting(user._id, app.userId._id)
            .then((response) => ({
              applicationId: app._id,
              candidateId: app.userId._id,
              ...response.data,
            }))
            .catch(() => ({
              applicationId: app._id,
              candidateId: app.userId._id,
              hasBooking: false,
              booking: null,
            }))
        )
      );

      const bookingsMap: Record<string, any> = {};
      bookingChecks.forEach((check) => {
        const key = `${check.candidateId}-${check.applicationId}`;
        bookingsMap[key] = check;
      });

      setExistingBookings(bookingsMap);
    } catch (error) {
      console.error("Error checking existing bookings:", error);
    }
  };

  const handleBookingClick = (
    candidateId: string,
    candidateName: string,
    applicationId: string
  ) => {
    setBookingModal({
      isOpen: true,
      candidateId,
      candidateName,
      applicationId,
    });
  };

  const handleBookingCreated = () => {
    // Refresh bookings after creating a new one
    checkExistingBookings();
  };

  const closeBookingModal = () => {
    setBookingModal({
      isOpen: false,
      candidateId: "",
      candidateName: "",
      applicationId: "",
    });
  };

  // Filter and sort applications
  const filteredApplications = applications
    .filter((app) => {
      const matchesSearch =
        !searchQuery ||
        app.userId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.jobPostId.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.userId.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || app.status === statusFilter;
      const matchesCompany =
        companyFilter === "all" ||
        app.jobPostId.companyId._id === companyFilter;

      return matchesSearch && matchesStatus && matchesCompany;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "name":
          return a.userId.name.localeCompare(b.userId.name);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const getStatusStats = () => {
    return applications.reduce(
      (acc: any, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      },
      { total: applications.length }
    );
  };

  const statusStats = getStatusStats();

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

  if (!user || userType !== "company") {
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
                  Quản lý ứng tuyển
                </h1>
                <p className="text-gray-600 mt-1">
                  Quản lý các đơn ứng tuyển vào công ty của bạn
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={fetchApplications}
                  className="flex items-center gap-2"
                >
                  <Clock3 className="w-4 h-4" />
                  Làm mới
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {statusStats.total || 0}
              </div>
              <div className="text-sm text-blue-700">Tổng đơn</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {statusStats.pending || 0}
              </div>
              <div className="text-sm text-yellow-700">Chờ xử lý</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {statusStats.reviewed || 0}
              </div>
              <div className="text-sm text-blue-700">Đã xem</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {statusStats.accepted || 0}
              </div>
              <div className="text-sm text-green-700">Chấp nhận</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {statusStats.rejected || 0}
              </div>
              <div className="text-sm text-red-700">Từ chối</div>
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
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email, vị trí..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Status Filter */}
                <div className="w-full md:w-48">
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                      { value: "all", label: "Tất cả trạng thái" },
                      ...APPLICATION_STATUS_OPTIONS.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                      })),
                    ]}
                  />
                </div>

                {/* Sort */}
                <div className="w-full md:w-48">
                  <Select
                    value={sortBy}
                    onChange={setSortBy}
                    options={[
                      { value: "newest", label: "Mới nhất" },
                      { value: "oldest", label: "Cũ nhất" },
                      { value: "name", label: "Theo tên" },
                      { value: "status", label: "Theo trạng thái" },
                    ]}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications List */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {applications.length === 0
                    ? "Chưa có đơn ứng tuyển"
                    : "Không tìm thấy kết quả"}
                </h3>
                <p className="text-gray-600">
                  {applications.length === 0
                    ? "Các ứng viên sẽ xuất hiện ở đây khi họ ứng tuyển vào công việc của bạn"
                    : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application, index) => {
                const statusOption = APPLICATION_STATUS_OPTIONS.find(
                  (opt) => opt.value === application.status
                );

                // Check if booking exists for this application
                const bookingKey = `${application.userId._id}-${application._id}`;
                const existingBooking = existingBookings[bookingKey];

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
                            src={application.userId.avatarUrl}
                            name={application.userId.name}
                            size="lg"
                            className="flex-shrink-0"
                          />

                          {/* Application Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {application.userId.name}
                                  </h3>
                                  <Badge
                                    style={{
                                      backgroundColor:
                                        statusOption?.bgColor || "#f3f4f6",
                                      color: statusOption?.color || "#6b7280",
                                    }}
                                  >
                                    {statusOption?.label || application.status}
                                  </Badge>
                                </div>

                                <h4 className="text-md font-medium text-gray-800 mb-2">
                                  {application.jobPostId.title}
                                </h4>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    <span>{application.userId.email}</span>
                                  </div>
                                  {application.userId.phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="w-4 h-4" />
                                      <span>{application.userId.phone}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>
                                      {application.jobPostId.location}
                                    </span>
                                  </div>
                                  {(application.jobPostId.salaryMin ||
                                    application.jobPostId.salaryMax) && (
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="w-4 h-4" />
                                      <span>
                                        {formatSalaryRange(
                                          application.jobPostId.salaryMin,
                                          application.jobPostId.salaryMax
                                        )}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                      Ứng tuyển{" "}
                                      {formatRelativeTime(
                                        application.createdAt
                                      )}
                                    </span>
                                  </div>
                                </div>

                                {/* Cover Letter */}
                                {application.message && (
                                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                    <p className="text-sm text-gray-700 line-clamp-3">
                                      {application.message}
                                    </p>
                                  </div>
                                )}

                                {/* Resume */}
                                {(application.resumeUrl ||
                                  application.userId.resumeUrl) && (
                                  <div className="flex items-center gap-2 mb-3">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <a
                                      href={`${API_BASE_URL}${
                                        application.resumeUrl ||
                                        application.userId.resumeUrl
                                      }`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:underline"
                                    >
                                      Xem CV của ứng viên
                                    </a>
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
                                        `/jobs/${application.jobPostId._id}`,
                                        "_blank"
                                      )
                                    }
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>

                                  {/* Booking Button */}
                                  {existingBooking?.hasExistingBooking ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-green-600 border-green-600 hover:bg-green-50"
                                      disabled
                                    >
                                      <Users className="w-4 h-4 mr-1" />
                                      Đã hẹn
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleBookingClick(
                                          application.userId._id,
                                          application.userId.name,
                                          application._id
                                        )
                                      }
                                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                    >
                                      <Users className="w-4 h-4 mr-1" />
                                      Liên hệ
                                    </Button>
                                  )}
                                </div>

                                {/* Status Actions */}
                                {application.status === "pending" && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        updateApplicationStatus(
                                          application._id,
                                          "reviewed"
                                        )
                                      }
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      Đã xem
                                    </Button>
                                  </div>
                                )}

                                {application.status === "reviewed" && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        updateApplicationStatus(
                                          application._id,
                                          "accepted"
                                        )
                                      }
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Chấp nhận
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        updateApplicationStatus(
                                          application._id,
                                          "rejected"
                                        )
                                      }
                                      className="text-red-600 border-red-600 hover:bg-red-50"
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Từ chối
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Timeline */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>
                                  Ứng tuyển: {formatDate(application.createdAt)}
                                </span>
                                {application.updatedAt !==
                                  application.createdAt && (
                                  <>
                                    <span>•</span>
                                    <span>
                                      Cập nhật:{" "}
                                      {formatDate(application.updatedAt)}
                                    </span>
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
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModal.isOpen}
        onClose={closeBookingModal}
        candidateId={bookingModal.candidateId}
        candidateName={bookingModal.candidateName}
        applicationId={bookingModal.applicationId}
        onBookingCreated={handleBookingCreated}
      />
    </div>
  );
};

export default ApplicationsPage;
