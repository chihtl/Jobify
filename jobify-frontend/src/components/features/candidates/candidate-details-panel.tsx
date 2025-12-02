"use client";

import { Avatar, Badge, Button, Card } from "@/components/ui";
import BookingModal from "@/components/features/bookings/booking-modal";
import { useAuth } from "@/contexts/auth-context";
import { API_BASE_URL, bookingsApi } from "@/lib/api";
import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Calendar,
  Download,
  Mail,
  MapPin,
  Phone,
  User as UserIcon,
  Users,
  X,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useState, useEffect } from "react";

interface CandidateDetailsPanelProps {
  candidate: User;
  onClose?: () => void;
  isMobile?: boolean;
  className?: string;
}

const CandidateDetailsPanel = ({
  candidate,
  onClose,
  isMobile = false,
  className,
}: CandidateDetailsPanelProps) => {
  const { user } = useAuth();
  
  // Booking modal state
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    candidateId: string;
    candidateName: string;
    applicationId?: string;
  }>({
    isOpen: false,
    candidateId: "",
    candidateName: "",
    applicationId: undefined,
  });

  // Track existing booking
  const [existingBooking, setExistingBooking] = useState<any>(null);
  const [checkingBooking, setCheckingBooking] = useState(false);

  // Check existing booking when component mounts or candidate changes
  useEffect(() => {
    if (candidate && user) {
      checkExistingBooking();
    }
  }, [candidate, user]);

  const checkExistingBooking = async () => {
    if (!candidate || !user) return;
    
    try {
      setCheckingBooking(true);
      const response = await bookingsApi.checkExisting(user._id, candidate._id);
      setExistingBooking(response.data);
    } catch (error) {
      console.error("Error checking existing booking:", error);
      setExistingBooking(null);
    } finally {
      setCheckingBooking(false);
    }
  };

  const handleBookingClick = () => {
    setBookingModal({
      isOpen: true,
      candidateId: candidate._id,
      candidateName: candidate.name,
      applicationId: undefined, // No specific application for candidate details
    });
  };

  const handleBookingCreated = () => {
    // Refresh booking status after creating a new one
    checkExistingBooking();
  };

  const closeBookingModal = () => {
    setBookingModal({
      isOpen: false,
      candidateId: "",
      candidateName: "",
      applicationId: undefined,
    });
  };
  const formatDate = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return "";
    }
  };

  const formatMonthYear = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
      });
    } catch {
      return dateStr;
    }
  };

  const handleDownloadResume = () => {
    if (candidate.resumeUrl) {
      const url = `${API_BASE_URL}${candidate.resumeUrl}`;
      window.open(url, "_blank");
    }
  };

  return (
    <Card className={cn("h-full overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Thông tin ứng viên
        </h2>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Profile Section */}
          <div className="text-center">
            <Avatar
              src={
                candidate.avatarUrl
                  ? `${API_BASE_URL}${candidate.avatarUrl}`
                  : undefined
              }
              name={candidate.name}
              size="2xl"
              className="mx-auto mb-4"
            />

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {candidate.name}
            </h3>

            {candidate.bio && (
              <p className="text-gray-600 text-sm leading-relaxed">
                {candidate.bio}
              </p>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Thông tin liên hệ
            </h4>

            <div className="space-y-2 text-sm">
              {candidate.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <a
                    href={`mailto:${candidate.email}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {candidate.email}
                  </a>
                </div>
              )}

              {candidate.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <a
                    href={`tel:${candidate.phone}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {candidate.phone}
                  </a>
                </div>
              )}

              {candidate.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{candidate.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {candidate.skillIds && candidate.skillIds.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Kỹ năng</h4>
              <div className="flex flex-wrap gap-2">
                {candidate.skillIds.map((skillId, index) => (
                  <Badge key={skillId} variant="secondary">
                    Skill {index + 1}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {candidate.experiences && candidate.experiences.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Kinh nghiệm làm việc
              </h4>

              <div className="space-y-4">
                {candidate.experiences.map((exp, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-gray-200 pl-4 pb-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900">
                          {exp.title}
                        </h5>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                      </div>
                      {exp.current && (
                        <Badge variant="outline" className="text-xs">
                          Hiện tại
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {formatMonthYear(exp.startDate)} -{" "}
                          {exp.current
                            ? "Hiện tại"
                            : exp.endDate
                            ? formatMonthYear(exp.endDate)
                            : "Không xác định"}
                        </span>
                      </div>

                      {exp.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{exp.location}</span>
                        </div>
                      )}
                    </div>

                    {exp.description && (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resume Download */}
          {candidate.resumeUrl && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">CV/Resume</h4>
              <Button
                onClick={handleDownloadResume}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Tải xuống CV
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Profile Stats */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Thông tin hồ sơ</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">
                  {candidate.experiences?.length || 0}
                </div>
                <div className="text-gray-600">Kinh nghiệm</div>
              </div>

              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">
                  {candidate.skillIds?.length || 0}
                </div>
                <div className="text-gray-600">Kỹ năng</div>
              </div>
            </div>

            <div className="text-xs text-gray-500 text-center">
              Cập nhật {formatDate(candidate.updatedAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-3">
          {/* Booking Button */}
          {checkingBooking ? (
            <Button className="flex-1" disabled>
              <Users className="w-4 h-4 mr-2" />
              Đang kiểm tra...
            </Button>
          ) : existingBooking?.hasExistingBooking ? (
            <Button 
              className="flex-1 text-green-600 border-green-600 hover:bg-green-50" 
              variant="outline"
              disabled
            >
              <Users className="w-4 h-4 mr-2" />
              Đã hẹn
            </Button>
          ) : (
            <Button 
              className="flex-1" 
              onClick={handleBookingClick}
            >
              <Users className="w-4 h-4 mr-2" />
              Liên hệ
            </Button>
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
    </Card>
  );
};

export default CandidateDetailsPanel;
