'use client';

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Modal,
  ModalContent
} from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useMutation } from '@/hooks/use-api';
import { applicationApi } from '@/lib/api';
import { CreateApplicationDto, JobPost } from '@/lib/types';
import { formatSalaryRange } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Check,
  FileText,
  Mail,
  Phone,
  Upload
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Validation schema
const applicationSchema = z.object({
  coverLetter: z.string().min(50, 'Thư xin việc phải có ít nhất 50 ký tự'),
  expectedSalary: z.number().min(0, 'Mức lương mong muốn phải lớn hơn 0').optional(),
  availableDate: z.string().optional(),
  portfolioUrl: z.string().url('URL portfolio không hợp lệ').optional().or(z.literal('')),
  resumeFile: z.any().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface JobApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobPost;
  onSuccess: () => void;
}

const JobApplicationForm = ({
  isOpen,
  onClose,
  job,
  onSuccess
}: JobApplicationFormProps) => {
  const { user, userType } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      coverLetter: '',
      expectedSalary: undefined,
      availableDate: '',
      portfolioUrl: '',
    }
  });

  const { mutate: submitApplication, loading: submitting } = useMutation(
    (data: CreateApplicationDto) => applicationApi.createApplication(data),
    {
      onSuccess: () => {
        onSuccess();
        reset();
        setCurrentStep(1);
        setResumeFile(null);
      },
      onError: (error) => {
        toast.error('Có lỗi xảy ra khi ứng tuyển');
      }
    }
  );

  const company = typeof job.companyId === 'object' ? job.companyId : null;
  const skills = Array.isArray(job.skillIds)
    ? job.skillIds.filter(skill => typeof skill === 'object')
    : [];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Chỉ chấp nhận file PDF, DOC, DOCX');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('Kích thước file không được vượt quá 5MB');
        return;
      }

      setResumeFile(file);
      setValue('resumeFile', file);
    }
  };

  const onSubmit = async (data: ApplicationFormData) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để ứng tuyển');
      return;
    }

    const formData = new FormData();
    formData.append('jobPostId', job._id);
    formData.append('coverLetter', data.coverLetter);

    if (data.expectedSalary) {
      formData.append('expectedSalary', data.expectedSalary.toString());
    }

    if (data.availableDate) {
      formData.append('availableDate', data.availableDate);
    }

    if (data.portfolioUrl) {
      formData.append('portfolioUrl', data.portfolioUrl);
    }

    if (resumeFile) {
      formData.append('resume', resumeFile);
    }

    // Convert FormData to object for API call
    // Note: In real implementation, you'd send FormData directly
    const applicationData: CreateApplicationDto = {
      jobPostId: job._id,
      coverLetter: data.coverLetter,
      expectedSalary: data.expectedSalary,
      availableDate: data.availableDate,
      portfolioUrl: data.portfolioUrl,
    };

    submitApplication(applicationData);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleClose = () => {
    onClose();
    reset();
    setCurrentStep(1);
    setResumeFile(null);
  };

  if (!user) {
    return (
      <Modal title="Đăng nhập để ứng tuyển" isOpen={isOpen} onClose={handleClose} size="md">
        <ModalContent>
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cần đăng nhập
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn cần đăng nhập để có thể ứng tuyển vào vị trí này.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleClose}>
                Đóng
              </Button>
              <Button onClick={() => window.location.href = '/login'}>
                Đăng nhập
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal title={`Ứng tuyển: ${job.title}`} isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                    }`}
                >
                  {step < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 ${step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Job & Profile Overview */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin công việc
                </h3>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar
                        src={company?.logoUrl}
                        name={company?.name}
                        size="md"
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {job.title}
                        </h4>
                        <p className="text-gray-600 mb-2">
                          {company?.name}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" size="sm">
                            {formatSalaryRange(job.salaryMin, job.salaryMax)}
                          </Badge>
                          {job.location && (
                            <Badge variant="outline" size="sm">
                              {job.location}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {skills.slice(0, 3).map((skill: any) => (
                            <Badge key={skill._id} variant="secondary" size="sm">
                              {skill.name}
                            </Badge>
                          ))}
                          {skills.length > 3 && (
                            <Badge variant="outline" size="sm">
                              +{skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin của bạn
                </h3>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar
                        src={user.avatarUrl}
                        name={user.name}
                        size="md"
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {user.name}
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
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
                          {user.resumeUrl && (
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <a
                                href={user.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                CV hiện tại
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Lưu ý quan trọng
                </h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Hãy đảm bảo thông tin liên hệ của bạn là chính xác</li>
                  <li>• CV và thư xin việc sẽ được gửi trực tiếp đến nhà tuyển dụng</li>
                  <li>• Bạn có thể theo dõi trạng thái ứng tuyển trong trang hồ sơ</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Cover Letter & Additional Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thư xin việc <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('coverLetter')}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Giới thiệu bản thân, kinh nghiệm và lý do bạn phù hợp với vị trí này..."
                />
                {errors.coverLetter && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.coverLetter.message}
                  </p>
                )}
                <p className="text-gray-500 text-sm mt-2">
                  {watch('coverLetter')?.length || 0} / 1000 ký tự
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mức lương mong muốn (VNĐ)
                  </label>
                  <Input
                    type="number"
                    {...register('expectedSalary', { valueAsNumber: true })}
                    placeholder="15000000"
                    error={errors.expectedSalary?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày có thể bắt đầu làm việc
                  </label>
                  <Input
                    type="date"
                    {...register('availableDate')}
                    error={errors.availableDate?.message}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio / Website cá nhân
                </label>
                <Input
                  type="url"
                  {...register('portfolioUrl')}
                  placeholder="https://your-portfolio.com"
                  error={errors.portfolioUrl?.message}
                />
              </div>
            </div>
          )}

          {/* Step 3: Resume Upload */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tải lên CV
                </h3>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />

                  {resumeFile ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <FileText className="w-5 h-5" />
                        <span className="font-medium">{resumeFile.name}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setResumeFile(null)}
                      >
                        Chọn file khác
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-gray-600 font-medium">
                        Kéo thả file CV hoặc click để chọn
                      </p>
                      <p className="text-sm text-gray-500">
                        Hỗ trợ: PDF, DOC, DOCX (tối đa 5MB)
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="resume-upload"
                      />
                      <label htmlFor="resume-upload">
                        <Button type="button" variant="outline" className="cursor-pointer">
                          Chọn file CV
                        </Button>
                      </label>
                    </div>
                  )}
                </div>

                {user.resumeUrl && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Hoặc sử dụng CV hiện tại
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      <a
                        href={user.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        CV đã tải lên trước đó
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">
                      Kiểm tra lại thông tin
                    </h4>
                    <p className="text-yellow-700 text-sm">
                      Hãy đảm bảo CV và thông tin ứng tuyển đã chính xác trước khi gửi.
                      Bạn sẽ không thể chỉnh sửa sau khi ứng tuyển.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <div>
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Quay lại
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleClose}>
                Hủy
              </Button>

              {currentStep < 3 ? (
                <Button type="button" onClick={nextStep}>
                  Tiếp tục
                </Button>
              ) : (
                <Button type="submit" loading={submitting}>
                  {submitting ? 'Đang gửi...' : 'Gửi ứng tuyển'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default JobApplicationForm;