"use client";

import { Button, Input, Modal, Select, Textarea } from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { bookingsApi } from "@/lib/api";
import { useMutation } from "@/hooks/use-api";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  Users,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
  applicationId?: string;
  onBookingCreated?: () => void;
}

interface BookingFormData {
  title: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  type: string;
  location: string;
  meetingLink: string;
  notes: string;
}

const BOOKING_TYPES = [
  { value: "interview", label: "Phỏng vấn", icon: Users },
  { value: "meeting", label: "Họp mặt", icon: Users },
  { value: "phone_call", label: "Gọi điện thoại", icon: Phone },
  { value: "video_call", label: "Gọi video", icon: Video },
];

const DURATION_OPTIONS = [
  { value: 30, label: "30 phút" },
  { value: 45, label: "45 phút" },
  { value: 60, label: "1 giờ" },
  { value: 90, label: "1.5 giờ" },
  { value: 120, label: "2 giờ" },
];

const BookingModal = ({
  isOpen,
  onClose,
  candidateId,
  candidateName,
  applicationId,
  onBookingCreated,
}: BookingModalProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<BookingFormData>({
    title: "",
    description: "",
    scheduledDate: "",
    scheduledTime: "",
    duration: 60,
    type: "interview",
    location: "",
    meetingLink: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Partial<BookingFormData>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      setFormData({
        title: `Phỏng vấn với ${candidateName}`,
        description: `Phỏng vấn để tìm hiểu thêm về kinh nghiệm và kỹ năng của ${candidateName}`,
        scheduledDate: tomorrowStr,
        scheduledTime: "09:00",
        duration: 60,
        type: "interview",
        location: "",
        meetingLink: "",
        notes: "",
      });
      setErrors({});
    }
  }, [isOpen, candidateName]);

  const { mutate: createBooking, loading } = useMutation(
    (data: any) => bookingsApi.create(data),
    {
      onSuccess: () => {
        toast.success("Đã gửi lời mời thành công!");
        onBookingCreated?.();
        onClose();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Có lỗi xảy ra khi gửi lời mời"
        );
      },
    }
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<BookingFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Vui lòng nhập tiêu đề";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả";
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = "Vui lòng chọn ngày";
    }

    if (!formData.scheduledTime) {
      newErrors.scheduledTime = "Vui lòng chọn giờ";
    }

    // Validate date is in future
    if (formData.scheduledDate && formData.scheduledTime) {
      const scheduledDateTime = new Date(
        `${formData.scheduledDate}T${formData.scheduledTime}`
      );
      if (scheduledDateTime <= new Date()) {
        newErrors.scheduledDate =
          "Thời gian hẹn phải là thời điểm trong tương lai";
      }
    }

    // Validate location or meeting link based on type
    if (formData.type === "video_call" && !formData.meetingLink.trim()) {
      newErrors.meetingLink = "Vui lòng nhập link cuộc họp";
    }

    if (
      ["interview", "meeting"].includes(formData.type) &&
      !formData.location.trim() &&
      !formData.meetingLink.trim()
    ) {
      newErrors.location = "Vui lòng nhập địa điểm hoặc link cuộc họp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const scheduledDateTime = new Date(
      `${formData.scheduledDate}T${formData.scheduledTime}`
    );

    const bookingData = {
      companyId: user?._id,
      candidateId,
      applicationId,
      title: formData.title.trim(),
      description: formData.description.trim(),
      scheduledDate: scheduledDateTime.toISOString(),
      duration: formData.duration,
      type: formData.type,
      location: formData.location.trim() || undefined,
      meetingLink: formData.meetingLink.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    };

    createBooking(bookingData);
  };

  const handleInputChange = (
    field: keyof BookingFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const selectedType = BOOKING_TYPES.find(
    (type) => type.value === formData.type
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gửi lời mời gặp mặt"
      size="lg"
    >
      <div className="space-y-6">
        {/* Candidate Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <Users className="w-5 h-5" />
            <span className="font-medium">
              Gửi lời mời đến: {candidateName}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề *
            </label>
            <Input
              value={formData.title}
              onChange={(value) => handleInputChange("title", value)}
              placeholder="VD: Phỏng vấn vị trí Senior Developer"
              error={errors.title}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả *
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Mô tả chi tiết về cuộc gặp mặt..."
              rows={3}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Ngày *
              </label>
              <Input
                type="date"
                value={formData.scheduledDate}
                onChange={(value) =>
                  handleInputChange("scheduledDate", value)
                }
                min={new Date().toISOString().split("T")[0]}
                error={errors.scheduledDate}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Giờ *
              </label>
              <Input
                type="time"
                value={formData.scheduledTime}
                onChange={(value) =>
                  handleInputChange("scheduledTime", value)
                }
                error={errors.scheduledTime}
              />
            </div>
          </div>

          {/* Type and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại cuộc gặp
              </label>
              <Select
                value={formData.type}
                onChange={(value) => handleInputChange("type", value)}
                options={BOOKING_TYPES.map((type) => ({
                  value: type.value,
                  label: type.label,
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời lượng
              </label>
              <Select
                value={formData.duration.toString()}
                onChange={(value) =>
                  handleInputChange("duration", parseInt(value))
                }
                options={DURATION_OPTIONS.map((option) => ({
                  value: option.value.toString(),
                  label: option.label,
                }))}
              />
            </div>
          </div>

          {/* Location or Meeting Link */}
          {formData.type === "video_call" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Video className="w-4 h-4 inline mr-1" />
                Link cuộc họp *
              </label>
              <Input
                value={formData.meetingLink}
                onChange={(value) =>
                  handleInputChange("meetingLink", value)
                }
                placeholder="https://meet.google.com/..."
                error={errors.meetingLink}
              />
            </div>
          ) : formData.type === "phone_call" ? (
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">
                  Cuộc gọi điện thoại - Bạn sẽ liên hệ trực tiếp với ứng viên
                  qua số điện thoại
                </span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Địa điểm {!formData.meetingLink && "*"}
              </label>
              <Input
                value={formData.location}
                onChange={(value) => handleInputChange("location", value)}
                placeholder="VD: Văn phòng công ty, Tầng 5, Tòa nhà ABC"
                error={errors.location}
              />

              {/* Optional meeting link for in-person meetings */}
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Video className="w-4 h-4 inline mr-1" />
                  Link cuộc họp (tùy chọn)
                </label>
              <Input
                value={formData.meetingLink}
                onChange={(value) =>
                  handleInputChange("meetingLink", value)
                }
                placeholder="https://meet.google.com/... (backup option)"
              />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú thêm
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Thông tin bổ sung cho ứng viên..."
              rows={2}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Gửi lời mời
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BookingModal;
