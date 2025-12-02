'use client';

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  Modal,
  ModalContent,
  SkeletonCard
} from '@/components/ui';
import { EXPERIENCE_LEVEL_OPTIONS, JOB_TYPE_OPTIONS } from '@/lib/constants';
import { formatDate, formatRelativeTime, formatSalaryRange } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Briefcase,
  Building2,
  Calendar,
  Check,
  Clock,
  DollarSign,
  Eye,
  MapPin,
  Users,
  X
} from 'lucide-react';
import { useState } from 'react';

interface JobApprovalListProps {
  jobs: any[];
  loading: boolean;
  onApprove: (jobId: string) => void;
  onReject: (jobId: string, reason?: string) => void;
  approving: boolean;
  rejecting: boolean;
}

const JobApprovalList = ({
  jobs,
  loading,
  onApprove,
  onReject,
  approving,
  rejecting
}: JobApprovalListProps) => {
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleReject = () => {
    if (selectedJob) {
      onReject(selectedJob._id, rejectReason);
      setShowRejectModal(false);
      setSelectedJob(null);
      setRejectReason('');
    }
  };

  const getUrgencyLevel = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 3) return { level: 'high', label: 'Rất khẩn', color: 'red' };
    if (daysLeft <= 7) return { level: 'medium', label: 'Khẩn', color: 'yellow' };
    return { level: 'low', label: 'Bình thường', color: 'green' };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <Briefcase className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Không có tin tuyển dụng nào cần phê duyệt
          </h3>
          <p className="text-gray-600 mb-4">
            Tất cả tin tuyển dụng đã được xử lý hoặc chưa có tin nào được gửi để duyệt.
          </p>
          <div className="text-sm text-gray-500">
            <p>• Tin tuyển dụng mới sẽ có trạng thái "Chờ duyệt"</p>
            <p>• Admin cần phê duyệt trước khi tin được hiển thị công khai</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {jobs.map((job, index) => {
          const jobData = job as {
            _id: string;
            title: string;
            description?: string;
            companyId: {
              name?: string;
              logoUrl?: string;
              employeeCount?: string;
              industry?: string;
              websiteUrl?: string;
            };
            categoryId: { name?: string };
            skillIds: Array<{ _id: string; name: string }>;
            jobType: string;
            experienceLevel: string;
            expiresAt: string;
            createdAt: string;
            salaryMin?: number;
            salaryMax?: number;
            location?: string;
          };

          const company = jobData.companyId;
          const category = jobData.categoryId;
          const skills = Array.isArray(jobData.skillIds)
            ? jobData.skillIds.filter((skill) => typeof skill === 'object')
            : [];

          const jobTypeOption = JOB_TYPE_OPTIONS.find(option => option.value === jobData.jobType);
          const experienceOption = EXPERIENCE_LEVEL_OPTIONS.find(option => option.value === jobData.experienceLevel);
          const urgency = getUrgencyLevel(jobData.expiresAt);

          return (
            <motion.div
              key={jobData._id}
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
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {jobData.title}
                            </h3>
                            <Badge variant={urgency.color as 'outline' | 'secondary' | 'default' | 'success' | 'warning' | 'danger' | 'info'} size="sm">
                              {urgency.label}
                            </Badge>
                          </div>

                          <p className="text-gray-600 mb-2">
                            {company?.name}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                            {jobData.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{jobData.location}</span>
                              </div>
                            )}

                            {(jobData.salaryMin || jobData.salaryMax) && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span>{formatSalaryRange(jobData.salaryMin, jobData.salaryMax)}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Hết hạn {formatDate(jobData.expiresAt)}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>Đăng {formatRelativeTime(jobData.createdAt)}</span>
                            </div>
                          </div>

                          {/* Job Type & Experience */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {jobTypeOption && (
                              <Badge variant="outline" size="sm">
                                {jobTypeOption.icon} {jobTypeOption.label}
                              </Badge>
                            )}

                            {experienceOption && (
                              <Badge variant="outline" size="sm">
                                {experienceOption.icon} {experienceOption.label}
                              </Badge>
                            )}
                          </div>

                          {/* Skills */}
                          {skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {skills.slice(0, 5).map((skill) => (
                                <Badge key={skill._id} variant="secondary" size="sm">
                                  {skill.name}
                                </Badge>
                              ))}
                              {skills.length > 5 && (
                                <Badge variant="outline" size="sm">
                                  +{skills.length - 5} more
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Description Preview */}
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {jobData.description?.replace(/<[^>]*>/g, '').substring(0, 200)}...
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => setSelectedJob(jobData)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Xem chi tiết
                          </Button>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => onApprove(jobData._id)}
                              disabled={approving || rejecting}
                              loading={approving}
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4" />
                              Phê duyệt
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedJob(jobData);
                                setShowRejectModal(true);
                              }}
                              disabled={approving || rejecting}
                              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                              Từ chối
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Company Info */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {company?.employeeCount || 'Chưa có thông tin'} nhân viên
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {company?.industry || 'Chưa có thông tin'}
                            </span>
                          </div>

                          {company?.websiteUrl && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">
                                <a
                                  href={company.websiteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  Website
                                </a>
                              </span>
                            </div>
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

      {/* Job Detail Modal */}
      {selectedJob && !showRejectModal && (
        <Modal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          size="xl"
          title={selectedJob.title}
        >
          <ModalContent>
            <div className="space-y-6">
              {/* Company Header */}
              <div className="flex items-center gap-4">
                <Avatar
                  src={selectedJob.companyId?.logoUrl}
                  name={selectedJob.companyId?.name}
                  size="lg"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedJob.companyId?.name}
                  </h3>
                  <p className="text-gray-600">
                    {selectedJob.companyId?.location}
                  </p>
                </div>
              </div>

              {/* Job Description */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Mô tả công việc</h4>
                <div
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: selectedJob.description }}
                />
              </div>

              {/* Requirements */}
              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Yêu cầu ứng viên</h4>
                  <ul className="space-y-2">
                    {selectedJob.requirements.map((req: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Quyền lợi</h4>
                  <ul className="space-y-2">
                    {selectedJob.benefits.map((benefit: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setSelectedJob(null)}
                >
                  Đóng
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(true);
                  }}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Từ chối
                </Button>

                <Button
                  onClick={() => {
                    onApprove(selectedJob._id);
                    setSelectedJob(null);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Phê duyệt
                </Button>
              </div>
            </div>
          </ModalContent>
        </Modal>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <Modal
          title="Từ chối tin tuyển dụng"
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setRejectReason('');
          }}
          size="md"
        >

          <ModalContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">
                    Xác nhận từ chối
                  </h4>
                  <p className="text-yellow-700 text-sm">
                    Bạn đang từ chối tin tuyển dụng "{selectedJob?.title}".
                    Hành động này không thể hoàn tác.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do từ chối (tùy chọn)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  placeholder="Nhập lý do từ chối để gửi phản hồi cho nhà tuyển dụng..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                >
                  Hủy
                </Button>

                <Button
                  onClick={handleReject}
                  loading={rejecting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Từ chối tin
                </Button>
              </div>
            </div>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default JobApprovalList;