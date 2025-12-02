"use client";

import { Avatar, Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import BookingModal from "@/components/features/bookings/booking-modal";
import { useAuth } from "@/contexts/auth-context";
import { bookingsApi } from "@/lib/api";
import { 
  X, 
  Users, 
  Star,
  MapPin,
  Mail,
  Phone,
  FileText,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useState, useEffect } from "react";

interface Candidate {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  resumeUrl?: string;
  score: number;
}

interface CandidatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    jobDetails: {
      title: string;
      company: string;
      description: string;
    };
    candidates: Candidate[];
    cached: boolean;
  } | null;
  loading: boolean;
}

export default function CandidatesModal({ 
  isOpen, 
  onClose, 
  data, 
  loading 
}: CandidatesModalProps) {
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

  // Track existing bookings
  const [existingBookings, setExistingBookings] = useState<Record<string, any>>({});

  // Check existing bookings when data changes
  useEffect(() => {
    if (data?.candidates && data.candidates.length > 0 && user) {
      checkExistingBookings();
    }
  }, [data?.candidates, user]);

  const checkExistingBookings = async () => {
    if (!data?.candidates || !user) return;
    
    try {
      const bookingChecks = await Promise.all(
        data.candidates.map((candidate) =>
          bookingsApi
            .checkExisting(user._id, candidate.userId)
            .then((response) => ({
              candidateId: candidate.userId,
              ...response.data,
            }))
            .catch(() => ({
              candidateId: candidate.userId,
              hasExistingBooking: false,
              booking: null,
            }))
        )
      );

      const bookingsMap: Record<string, any> = {};
      bookingChecks.forEach((check) => {
        bookingsMap[check.candidateId] = check;
      });

      setExistingBookings(bookingsMap);
    } catch (error) {
      console.error("Error checking existing bookings:", error);
    }
  };

  const handleBookingClick = (candidateId: string, candidateName: string) => {
    setBookingModal({
      isOpen: true,
      candidateId,
      candidateName,
      applicationId: undefined, // No specific application for AI candidates
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
      applicationId: undefined,
    });
  };

  if (!isOpen) return null;

  const formatScore = (score: number) => {
    return Math.round(score * 100);
  };

  const getScoreColor = (score: number) => {
    const percentage = score * 100;
    if (percentage >= 80) return "text-green-600 bg-green-50";
    if (percentage >= 60) return "text-blue-600 bg-blue-50";
    if (percentage >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="fixed inset-0 bg-white/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Ứng viên phù hợp với AI
              </h2>
              {data && (
                <p className="text-sm text-gray-600">
                  {data.jobDetails.title} - {data.jobDetails.company}
                  {data.cached && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Cached
                    </Badge>
                  )}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tìm kiếm ứng viên phù hợp...</p>
              </div>
            </div>
          ) : !data ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Không thể tải dữ liệu ứng viên</p>
              </div>
            </div>
          ) : data.candidates.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Không tìm thấy ứng viên phù hợp</p>
                <p className="text-sm text-gray-500 mt-2">
                  Hãy thử lại sau khi có thêm ứng viên tải CV lên hệ thống
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <h3 className="font-medium text-gray-900">Kết quả tìm kiếm</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Tìm thấy <span className="font-semibold">{data.candidates.length}</span> ứng viên 
                  phù hợp nhất với vị trí <span className="font-semibold">{data.jobDetails.title}</span>
                </p>
              </div>

              {/* Candidates List */}
              {data.candidates.map((candidate, index) => {
                const existingBooking = existingBookings[candidate.userId];
                
                return (
                  <Card key={candidate.userId} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Rank */}
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
                              #{index + 1}
                            </div>
                          </div>

                          {/* Avatar */}
                          <Avatar className="w-12 h-12 flex-shrink-0">
                            <img 
                              src={candidate.avatarUrl ? `${process.env.NEXT_PUBLIC_API_URL}${candidate.avatarUrl}` : undefined}
                              alt={candidate.name}
                            />
                          </Avatar>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {candidate.name}
                              </h4>
                              <Badge 
                                className={`text-xs px-2 py-1 ${getScoreColor(candidate.score)}`}
                              >
                                <Star className="w-3 h-3 mr-1" />
                                {formatScore(candidate.score)}%
                              </Badge>
                            </div>

                            {candidate.bio && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {candidate.bio}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                <span>{candidate.email}</span>
                              </div>
                              {candidate.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{candidate.phone}</span>
                                </div>
                              )}
                              {candidate.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{candidate.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 ml-4">
                          {candidate.resumeUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                window.open(`${process.env.NEXT_PUBLIC_API_URL}${candidate.resumeUrl}`, '_blank');
                              }}
                              className="text-xs"
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              Xem CV
                            </Button>
                          )}
                          
                          {/* Booking Button */}
                          {existingBooking?.hasExistingBooking ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-green-600 border-green-600 hover:bg-green-50"
                              disabled
                            >
                              <Users className="w-3 h-3 mr-1" />
                              Đã hẹn
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleBookingClick(candidate.userId, candidate.name)}
                              className="text-xs"
                            >
                              <Users className="w-3 h-3 mr-1" />
                              Liên hệ
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
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
}
