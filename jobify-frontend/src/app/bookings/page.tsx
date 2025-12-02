"use client";

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SkeletonCard,
} from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { API_BASE_URL, bookingsApi } from "@/lib/api";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  RefreshCw,
  Video,
  XCircle,
  Users,
  Building2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Booking {
  _id: string;
  companyId: {
    _id: string;
    name: string;
    logoUrl?: string;
  };
  candidateId: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  title: string;
  description: string;
  scheduledDate: string;
  duration: number;
  location?: string;
  meetingLink?: string;
  type: string;
  status: string;
  notes?: string;
  candidateResponse?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const BOOKING_STATUS_OPTIONS = [
  { 
    value: "pending", 
    label: "Chờ phản hồi", 
    color: "#f59e0b", 
    bgColor: "#fef3c7",
    icon: Clock 
  },
  { 
    value: "accepted", 
    label: "Đã chấp nhận", 
    color: "#10b981", 
    bgColor: "#d1fae5",
    icon: CheckCircle 
  },
  { 
    value: "rejected", 
    label: "Đã từ chối", 
    color: "#ef4444", 
    bgColor: "#fee2e2",
    icon: XCircle 
  },
  { 
    value: "completed", 
    label: "Đã hoàn thành", 
    color: "#6366f1", 
    bgColor: "#e0e7ff",
    icon: CheckCircle 
  },
  { 
    value: "cancelled", 
    label: "Đã hủy", 
    color: "#6b7280", 
    bgColor: "#f3f4f6",
    icon: XCircle 
  },
];

const BOOKING_TYPE_OPTIONS = [
  { value: "interview", label: "Phỏng vấn", icon: Users },
  { value: "meeting", label: "Họp mặt", icon: Users },
  { value: "phone_call", label: "Gọi điện thoại", icon: Phone },
  { value: "video_call", label: "Gọi video", icon: Video },
];

const BookingsPage = () => {
  const { user, userType, isLoading } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Redirect if not logged in or not user
  useEffect(() => {
    if (!isLoading && (!user || userType !== "user")) {
      router.push("/login?redirect=/bookings");
    }
  }, [user, userType, isLoading, router]);

  // Fetch bookings for the user
  useEffect(() => {
    if (user && userType === "user") {
      fetchBookings();
    }
  }, [user, userType]);

  const fetchBookings = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const response = await bookingsApi.getByCandidate(user._id);
      if (response?.data?.data) {
        setBookings(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Có lỗi xảy ra khi tải danh sách lời mời");
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string, response?: string) => {
    try {
      setUpdating(bookingId);
      const updateData: any = { status };
      
      if (response) {
        updateData.candidateResponse = response;
      }
      
      await bookingsApi.update(bookingId, updateData);
      
      // Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? { 
                ...booking, 
                status, 
                candidateResponse: response || booking.candidateResponse,
                respondedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString() 
              }
            : booking
        )
      );
      
      toast.success("Đã cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusOption = (status: string) => {
    return BOOKING_STATUS_OPTIONS.find(option => option.value === status);
  };

  const getTypeOption = (type: string) => {
    return BOOKING_TYPE_OPTIONS.find(option => option.value === type);
  };

  const formatDuration = (minutes: number | undefined | null) => {
    if (!minutes || minutes <= 0) return "Chưa xác định";
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const getStatusStats = () => {
    return bookings.reduce(
      (acc: any, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      },
      { total: bookings.length }
    );
  };

  const statusStats = getStatusStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <SkeletonCard />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || userType !== "user") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Lời mời liên hệ
                </h1>
                <p className="text-gray-600 mt-1">
                  Quản lý các lời mời phỏng vấn và gặp mặt từ các công ty
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={fetchBookings}
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {statusStats.total || 0}
              </div>
              <div className="text-sm text-blue-700">Tổng lời mời</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {statusStats.pending || 0}
              </div>
              <div className="text-sm text-yellow-700">Chờ phản hồi</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {statusStats.accepted || 0}
              </div>
              <div className="text-sm text-green-700">Đã chấp nhận</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {statusStats.rejected || 0}
              </div>
              <div className="text-sm text-red-700">Đã từ chối</div>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                {statusStats.completed || 0}
              </div>
              <div className="text-sm text-indigo-700">Đã hoàn thành</div>
            </div>
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Chưa có lời mời nào
                </h3>
                <p className="text-gray-600">
                  Các lời mời phỏng vấn và gặp mặt từ công ty sẽ xuất hiện ở đây
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking, index) => {
                const statusOption = getStatusOption(booking.status);
                const typeOption = getTypeOption(booking.type);
                const StatusIcon = statusOption?.icon || AlertCircle;
                const TypeIcon = typeOption?.icon || Users;

                return (
                  <motion.div
                    key={booking._id}
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
                              booking.companyId?.logoUrl
                                ? `${API_BASE_URL}${booking.companyId.logoUrl}`
                                : undefined
                            }
                            name={booking.companyId?.name || "Unknown Company"}
                            size="lg"
                            className="flex-shrink-0"
                          />

                          {/* Booking Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {booking.title || "Lời mời không có tiêu đề"}
                                  </h3>
                                  <Badge
                                    style={{
                                      backgroundColor: statusOption?.bgColor || "#f3f4f6",
                                      color: statusOption?.color || "#6b7280",
                                    }}
                                    className="flex items-center gap-1"
                                  >
                                    <StatusIcon className="w-3 h-3" />
                                    {statusOption?.label || booking.status}
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                  <Building2 className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium text-gray-800">
                                    {booking.companyId?.name || "Unknown Company"}
                                  </span>
                                </div>

                                <p className="text-gray-600 mb-3 line-clamp-2">
                                  {booking.description || "Không có mô tả"}
                                </p>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                      {booking.scheduledDate ? formatDate(booking.scheduledDate) : "Chưa xác định"} lúc{" "}
                                      {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleTimeString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }) : "Chưa xác định"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatDuration(booking.duration)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <TypeIcon className="w-4 h-4" />
                                    <span>{typeOption?.label || booking.type || "Chưa xác định"}</span>
                                  </div>
                                </div>

                                {/* Location/Meeting Link */}
                                {booking.location && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{booking.location}</span>
                                  </div>
                                )}

                                {booking.meetingLink && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <Video className="w-4 h-4" />
                                    <a
                                      href={booking.meetingLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      Tham gia cuộc họp
                                    </a>
                                  </div>
                                )}

                                {/* Notes */}
                                {booking.notes && (
                                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                    <p className="text-sm text-gray-700">
                                      <strong>Ghi chú:</strong> {booking.notes}
                                    </p>
                                  </div>
                                )}

                                {/* Candidate Response */}
                                {booking.candidateResponse && (
                                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                                    <p className="text-sm text-blue-800">
                                      <strong>Phản hồi của bạn:</strong> {booking.candidateResponse}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col items-end gap-3">
                                {booking.status === "pending" && (
                                  <div className="flex flex-col gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => updateBookingStatus(booking._id, "accepted", "Tôi đồng ý tham gia cuộc hẹn này.")}
                                      disabled={updating === booking._id}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Chấp nhận
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateBookingStatus(booking._id, "rejected", "Tôi không thể tham gia cuộc hẹn này.")}
                                      disabled={updating === booking._id}
                                      className="text-red-600 border-red-600 hover:bg-red-50"
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Từ chối
                                    </Button>
                                  </div>
                                )}

                                {booking.status === "accepted" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateBookingStatus(booking._id, "completed")}
                                    disabled={updating === booking._id}
                                    className="text-indigo-600 border-indigo-600 hover:bg-indigo-50"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Đánh dấu hoàn thành
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Timeline */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>
                                  Nhận lời mời: {booking.createdAt ? formatRelativeTime(booking.createdAt) : "Chưa xác định"}
                                </span>
                                {booking.respondedAt && (
                                  <>
                                    <span>•</span>
                                    <span>
                                      Phản hồi: {formatRelativeTime(booking.respondedAt)}
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
    </div>
  );
};

export default BookingsPage;
