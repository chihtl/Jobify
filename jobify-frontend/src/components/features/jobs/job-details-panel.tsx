'use client';

import {
  Avatar,
  Badge,
  Button,
  Card,
  Modal,
  ModalContent
} from '@/components/ui';
import { EXPERIENCE_LEVEL_OPTIONS, JOB_TYPE_OPTIONS } from '@/lib/constants';
import { JobPost } from '@/lib/types';
import {
  formatDate,
  formatRelativeTime,
  formatSalaryRange
} from '@/lib/utils';
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Heart,
  MapPin,
  Share2,
  Star,
  Users,
  X
} from 'lucide-react';
import { useState } from 'react';

interface JobDetailsPanelProps {
  job: JobPost;
  onClose: () => void;
  isMobile?: boolean;
  // New controls for save/apply from parent
  saved?: boolean;
  applied?: boolean;
  saving?: boolean;
  applying?: boolean;
  onToggleSave?: () => void;
  onApply?: () => void;
}

const JobDetailsPanel = ({ job, onClose, isMobile = false, saved, applied, saving = false, applying = false, onToggleSave, onApply }: JobDetailsPanelProps) => {
  const [isSavedInternal, setIsSavedInternal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const isSaved = typeof saved === 'boolean' ? saved : isSavedInternal;

  const company = typeof job.companyId === 'object' ? job.companyId : null;
  const category = typeof job.categoryId === 'object' ? job.categoryId : null;
  const skills = Array.isArray(job.skillIds)
    ? job.skillIds.filter(skill => typeof skill === 'object')
    : [];

  const jobTypeOption = JOB_TYPE_OPTIONS.find(option => option.value === job.jobType);
  const experienceOption = EXPERIENCE_LEVEL_OPTIONS.find(option => option.value === job.experienceLevel);

  const isExpired = job.expiresAt && new Date(job.expiresAt) < new Date();
  const isNew = new Date(job.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const handleSaveToggle = () => {
    if (onToggleSave) onToggleSave();
    else setIsSavedInternal(!isSavedInternal);
  };

  const handleApply = () => {
    setShowApplicationModal(true);
  };

  const handleSubmitApplication = async () => {
    if (onApply) onApply();
    setShowApplicationModal(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job: ${job.title} at ${company?.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleViewCompany = () => {
    if (company) {
      window.open(`/companies/${company._id}`, '_blank');
    }
  };

  return (
    <Card className="h-full max-h-[calc(100vh-6rem)] overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Chi tiết công việc</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="p-2"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Job Header */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar
                src={company?.logoUrl}
                name={company?.name}
                size="lg"
                className="flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span >
                      <span className="text-xl font-bold text-gray-900 mb-2">
                        {job.title}
                      </span>

                    </span>
                    <p className="text-lg text-gray-700 mb-1">
                      {company?.name || 'Công ty'}
                    </p>
                    {job.location && (
                      <span className="flex items-center gap-1 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className='text-sm whitespace-break-spaces'>{job.location}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Job Stats */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                {isNew && (
                  <Badge variant="success" className='whitespace-nowrap'>Mới</Badge>
                )}
                {isExpired && (
                  <Badge variant="danger" className='whitespace-nowrap'>Hết hạn</Badge>
                )}
                {!job.isActive && (
                  <Badge variant="secondary" className='whitespace-nowrap'>Tạm dừng</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 justify-start">
                <DollarSign className="w-5 h-5 text-green-600 " />
                <div className="text-sm font-medium text-gray-900">
                  {formatSalaryRange(job.salaryMin, job.salaryMax)}
                </div>
              </div>

              <div className="flex items-center gap-2 justify-start">
                <Briefcase className="w-5 h-5 text-blue-600 " />
                <div className="text-sm font-medium text-gray-900">
                  {jobTypeOption?.label}
                </div>
              </div>

              <div className="flex items-center gap-2 justify-start">
                <Star className="w-5 h-5 text-purple-600 " />
                <div className="text-sm font-medium text-gray-900">
                  {experienceOption?.label}
                </div>
              </div>

              <div className="flex items-center gap-2 justify-start">
                <Users className="w-5 h-5 text-orange-600 " />
                <div className="text-sm font-medium text-gray-900">
                  {job.applicationCount || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Đăng {formatRelativeTime(job.createdAt)}</span>
              </div>
              {job.expiresAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Hết hạn {formatDate(job.expiresAt)}</span>
                </div>
              )}
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Kỹ năng yêu cầu</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: any) => (
                    <Badge key={skill._id} variant="secondary">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Job Description */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Mô tả công việc</h3>
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Yêu cầu</h3>
              <ul className="space-y-2">
                {job.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Quyền lợi</h3>
              <ul className="space-y-2">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Company Info */}
          {/* {company && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar
                    src={company.logoUrl}
                    name={company.name}
                    size="md"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {company.name}
                    </h4>
                    {company.description && (
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                        {company.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {company.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{company.location}</span>
                        </div>
                      )}
                      {company.websiteUrl && (
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          <a
                            href={company.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-600"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewCompany}
                  >
                    <Building2 className="w-4 h-4 mr-1" />
                    Xem công ty
                  </Button>
                </div>
              </CardContent>
            </Card>
          )} */}
        </div>

        {/* Footer Actions */}
        <div className="px-4 pt-4 border-t border-gray-200">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSaveToggle}
              disabled={saving}
              className={`flex items-center gap-2 ${isSaved ? 'text-red-600 border-red-200' : ''}`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Đã lưu' : 'Lưu việc'}
            </Button>

            <Button
              onClick={handleApply}
              disabled={isExpired || !job.isActive || applying || applied}
              className="flex-1"
              loading={applying}
            >
              {applied ? 'Đã ứng tuyển' : isExpired ? 'Đã hết hạn' : 'Ứng tuyển ngay'}
            </Button>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <Modal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        size="lg"
        title={`Ứng tuyển: ${job.title}`}
      >
        <ModalContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Thông tin ứng tuyển</h4>
              <p className="text-blue-700 text-sm">
                Hệ thống sẽ gửi CV và thông tin liên hệ của bạn tới nhà tuyển dụng.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowApplicationModal(false)}
                disabled={applying}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmitApplication}
                loading={applying}
                className="flex-1"
              >
                {applying ? 'Đang gửi...' : 'Xác nhận ứng tuyển'}
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default JobDetailsPanel;