'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  MultiSelect,
  Select,
  SkeletonCard,
} from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useApi, useMutation } from '@/hooks/use-api';
import { categoriesApi, jobsApi, skillsApi } from '@/lib/api';
import {
  CITIES,
  EXPERIENCE_LEVEL_OPTIONS,
  JOB_TYPE_OPTIONS
} from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  DollarSign,
  Eye,
  FileText,
  MapPin,
  Plus,
  Save,
  Users,
  X
} from 'lucide-react';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Validation schema
const jobSchema = z.object({
  title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
  description: z.string().min(100, 'Mô tả phải có ít nhất 100 ký tự'),
  categoryId: z.string().min(1, 'Vui lòng chọn ngành nghề'),
  skillIds: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất 1 kỹ năng'),
  location: z.string().min(1, 'Vui lòng chọn địa điểm'),
  salaryMin: z.number().min(0, 'Lương tối thiểu phải lớn hơn 0').nullable().optional(),
  salaryMax: z.number().min(0, 'Lương tối đa phải lớn hơn 0').nullable().optional(),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship']),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead']),
  requirements: z.array(z.string()).min(1, 'Vui lòng thêm ít nhất 1 yêu cầu'),
  benefits: z.array(z.string()).optional(),
  expiresAt: z.string().min(1, 'Vui lòng chọn ngày hết hạn'),
}).refine((data) => {
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMax >= data.salaryMin;
  }
  return true;
}, {
  message: 'Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu',
  path: ['salaryMax'],
});

type JobFormData = z.infer<typeof jobSchema>;

const EditJobPage = () => {
  const { user, userType } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [benefits, setBenefits] = useState<string[]>(['']);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Redirect if not company user
  useEffect(() => {
    if (user && userType !== 'company') {
      router.push('/');
      toast.error('Chỉ có nhà tuyển dụng mới có thể chỉnh sửa tin tuyển dụng');
    }
  }, [user, userType, router]);

  // Fetch job data
  const { data: jobData, loading: jobLoading, error: jobError } = useApi(
    () => {
      console.log('Fetching job with ID:', jobId);
      return jobsApi.getJobById(jobId);
    },
    [jobId],
    { immediate: true }
  );

  // Debug API response
  useEffect(() => {
    console.log('Job loading:', jobLoading);
    console.log('Job error:', jobError);
    console.log('Job data response:', jobData);
  }, [jobLoading, jobError, jobData]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    getValues,
    reset,
    trigger,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      skillIds: [],
      location: '',
      salaryMin: null,
      salaryMax: null,
      jobType: 'full-time',
      experienceLevel: 'mid',
      requirements: [],
      benefits: [],
      expiresAt: '',
    }
  });

  // Fetch categories
  const { data: categories, loading: categoriesLoading } = useApi(
    () => categoriesApi.getCategories(),
    [],
    { immediate: true }
  );

  // Fetch skills
  const { data: skills, loading: skillsLoading } = useApi(
    () => skillsApi.getSkills(),
    [],
    { immediate: true }
  );

  // Update job mutation
  const { mutate: updateJob, loading: isUpdating } = useMutation(
    (data: any) => jobsApi.updateJob(jobId, data),
    {
      onSuccess: (response) => {
        toast.success('Cập nhật tin tuyển dụng thành công!');
        router.push(`/jobs/${jobId}`);
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.';
        toast.error(message);
      }
    }
  );

  // Populate form when job data is loaded
  useEffect(() => {
    console.log('=== POPULATE FORM EFFECT ===');
    console.log('Job data:', jobData);
    console.log('Is data loaded:', isDataLoaded);
    
    // Only run once when data is available and not yet loaded
    if (jobData && !isDataLoaded) {
      const job = jobData;
      console.log('Job object:', job);
      
      // Check if user owns this job
      if (userType === 'company' && job.companyId?._id !== user?._id) {
        toast.error('Bạn không có quyền chỉnh sửa tin tuyển dụng này');
        router.push('/manage-jobs');
        return;
      }

      // Prepare form data
      const formData: JobFormData = {
        title: job.title || '',
        description: job.description || '',
        categoryId: job.categoryId?._id || '',
        // Handle skillIds - check if they are objects or strings
        skillIds: job.skillIds?.map((skill: any) => 
          typeof skill === 'string' ? skill : skill._id
        ) || [],
        location: job.location || '',
        salaryMin: job.salaryMin ?? null,
        salaryMax: job.salaryMax ?? null,
        jobType: job.jobType || 'full-time',
        experienceLevel: job.experienceLevel || 'mid',
        requirements: job.requirements || [],
        benefits: job.benefits || [],
        expiresAt: job.expiresAt ? new Date(job.expiresAt).toISOString().split('T')[0] : '',
      };
      
      console.log('📝 Form data to populate:', formData);
      console.log('📝 CategoryId:', formData.categoryId);
      console.log('📝 SkillIds:', formData.skillIds);
      console.log('📝 Requirements:', formData.requirements);
      console.log('📝 Benefits:', formData.benefits);
      
      // Set local state first
      const jobRequirements = job.requirements?.length > 0 ? job.requirements : [''];
      const jobBenefits = job.benefits?.length > 0 ? job.benefits : [''];
      
      console.log('Setting requirements:', jobRequirements);
      console.log('Setting benefits:', jobBenefits);
      
      setRequirements(jobRequirements);
      setBenefits(jobBenefits);
      
      // Populate form fields using reset
      console.log('Calling reset with formData...');
      reset(formData);
      
      // Trigger validation to ensure form state is updated
      trigger();
      
      // Mark as loaded
      setIsDataLoaded(true);
      console.log('=== FORM POPULATED ===');
      
      // Log form values after a short delay to ensure state is updated
      setTimeout(() => {
        console.log('✅ Form values after reset:', getValues());
      }, 100);
    }
  }, [jobData, isDataLoaded, reset, trigger, userType, user, router]);

  const categoryOptions = categories?.data?.map((cat: any) => ({
    value: cat._id,
    label: cat.name
  })) || [];

  const skillOptions = skills?.data?.map((skill: any) => ({
    value: skill._id,
    label: skill.name
  })) || [];

  const locationOptions = CITIES.map(city => ({
    value: city,
    label: city
  }));

  const steps = [
    { id: 1, title: 'Thông tin cơ bản', icon: FileText },
    { id: 2, title: 'Mô tả & Yêu cầu', icon: Users },
    { id: 3, title: 'Xem trước & Cập nhật', icon: Eye },
  ];

  const addRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
    setValue('requirements', newRequirements.filter(req => req.trim() !== ''));
  };

  const removeRequirement = (index: number) => {
    const newRequirements = requirements.filter((_, i) => i !== index);
    setRequirements(newRequirements);
    setValue('requirements', newRequirements.filter(req => req.trim() !== ''));
  };

  const addBenefit = () => {
    setBenefits([...benefits, '']);
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setBenefits(newBenefits);
    setValue('benefits', newBenefits.filter(benefit => benefit.trim() !== ''));
  };

  const removeBenefit = (index: number) => {
    const newBenefits = benefits.filter((_, i) => i !== index);
    setBenefits(newBenefits);
    setValue('benefits', newBenefits.filter(benefit => benefit.trim() !== ''));
  };

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      const values = getValues();
      if (!values.title || values.title.trim().length < 5) {
        toast.error('Tiêu đề công việc phải có ít nhất 5 ký tự');
        return false;
      }
      if (!values.categoryId) {
        toast.error('Vui lòng chọn ngành nghề');
        return false;
      }
      if (!values.skillIds || values.skillIds.length === 0) {
        toast.error('Vui lòng chọn ít nhất 1 kỹ năng');
        return false;
      }
      if (!values.location) {
        toast.error('Vui lòng chọn địa điểm');
        return false;
      }
      if (!values.expiresAt) {
        toast.error('Vui lòng chọn ngày hết hạn');
        return false;
      }
    } else if (currentStep === 2) {
      const description = getValues('description');
      if (!description || description.trim().length < 100) {
        toast.error('Mô tả công việc phải có ít nhất 100 ký tự');
        return false;
      }
      if (requirements.filter(req => req.trim() !== '').length === 0) {
        toast.error('Vui lòng thêm ít nhất 1 yêu cầu ứng viên');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: JobFormData) => {
    console.log('Submit button clicked!');
    console.log('Form data:', data);
    console.log('Requirements:', requirements);
    console.log('Benefits:', benefits);

    const jobData = {
      ...data,
      // Xử lý salary - nếu null thì gửi undefined để backend hiểu là "thỏa thuận"
      salaryMin: data.salaryMin || undefined,
      salaryMax: data.salaryMax || undefined,
      requirements: requirements.filter(req => req.trim() !== ''),
      benefits: benefits.filter(benefit => benefit.trim() !== ''),
    };

    console.log('Final job data:', jobData);
    updateJob(jobData);
  };

  const watchedValues = watch();

  // Error state - check this first
  if (jobError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy tin tuyển dụng
          </h2>
          <p className="text-gray-600 mb-6">
            Tin tuyển dụng không tồn tại hoặc đã bị xóa.
          </p>
          <Button onClick={() => router.push('/manage-jobs')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  // if (jobLoading || categoriesLoading || skillsLoading || !isDataLoaded) {
  //   return (
  //     <div className="min-h-screen bg-gray-50">
  //       <div className="container mx-auto px-4 py-6">
  //         <div className="max-w-6xl mx-auto space-y-6">
  //           <SkeletonCard />
  //           <SkeletonCard />
  //           <SkeletonCard />
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // Access control
  if (!user || userType !== 'company') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Chỉ dành cho nhà tuyển dụng
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn cần đăng nhập với tài khoản công ty để chỉnh sửa tin tuyển dụng.
          </p>
          <Button onClick={() => router.push('/login?type=company')}>
            Đăng nhập công ty
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/manage-jobs')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại
                </Button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Chỉnh sửa tin tuyển dụng
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Cập nhật thông tin việc làm của bạn
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center gap-2 sm:gap-3 ${isActive ? 'text-blue-600' :
                      isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}>
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-100' :
                        isCompleted ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </div>
                      <span className="font-medium text-xs sm:text-sm hidden sm:block">{step.title}</span>
                      <span className="font-medium text-xs sm:hidden">Bước {step.id}</span>
                    </div>

                    {index < steps.length - 1 && (
                      <div className={`w-8 sm:w-20 h-1 mx-2 sm:mx-4 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'
                        }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <form key={jobData?.data?._id} onSubmit={handleSubmit(onSubmit)}>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin cơ bản</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                    {/* Job Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tiêu đề công việc <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('title')}
                        placeholder="VD: Senior Frontend Developer"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.title && (
                        <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                      )}
                    </div>

                    {/* Category & Skills */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ngành nghề <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={watchedValues.categoryId}
                          onChange={(value) => setValue('categoryId', value)}
                          options={categoryOptions}
                          placeholder="Chọn ngành nghề"
                        />
                        {errors.categoryId && (
                          <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kỹ năng yêu cầu <span className="text-red-500">*</span>
                        </label>
                        <MultiSelect
                          value={watchedValues.skillIds}
                          onChange={(value) => setValue('skillIds', value)}
                          options={skillOptions}
                          placeholder="Chọn kỹ năng"
                        />
                        {errors.skillIds && (
                          <p className="text-red-500 text-sm mt-1">{errors.skillIds.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Location & Job Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Địa điểm <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={watchedValues.location}
                          onChange={(value) => setValue('location', value)}
                          options={locationOptions}
                          placeholder="Chọn thành phố"
                        />
                        {errors.location && (
                          <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Loại hình công việc <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={watchedValues.jobType}
                          onChange={(value) => setValue('jobType', value as any)}
                          options={JOB_TYPE_OPTIONS.map(opt => ({
                            value: opt.value,
                            label: opt.label
                          }))}
                        />
                      </div>
                    </div>

                    {/* Salary & Experience */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lương tối thiểu (VNĐ)
                        </label>
                        <input
                          type="number"
                          {...register('salaryMin', { valueAsNumber: true })}
                          placeholder="15000000"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.salaryMin ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.salaryMin && (
                          <p className="text-red-500 text-sm mt-1">{errors.salaryMin.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lương tối đa (VNĐ)
                        </label>
                        <input
                          type="number"
                          {...register('salaryMax', { valueAsNumber: true })}
                          placeholder="30000000"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.salaryMax ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.salaryMax && (
                          <p className="text-red-500 text-sm mt-1">{errors.salaryMax.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kinh nghiệm <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={watchedValues.experienceLevel}
                          onChange={(value) => setValue('experienceLevel', value as any)}
                          options={EXPERIENCE_LEVEL_OPTIONS.map(opt => ({
                            value: opt.value,
                            label: opt.label
                          }))}
                        />
                      </div>
                    </div>

                    {/* Expiry Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày hết hạn <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        {...register('expiresAt')}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.expiresAt ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.expiresAt && (
                        <p className="text-red-500 text-sm mt-1">{errors.expiresAt.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Description & Requirements */}
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Mô tả & Yêu cầu công việc</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                    {/* Job Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả công việc <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        {...register('description')}
                        rows={10}
                        placeholder="Mô tả chi tiết về công việc, trách nhiệm chính, môi trường làm việc...

Ví dụ:
- Phát triển và duy trì các ứng dụng web sử dụng React
- Thiết kế giao diện người dùng responsive
- Tối ưu hóa hiệu suất ứng dụng
- Làm việc với team backend để tích hợp API"
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm leading-relaxed"
                        value={watchedValues.description}
                        onChange={(e) => setValue('description', e.target.value)}
                      />
                      <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <span>Tối thiểu 100 ký tự</span>
                        <span>{watchedValues.description?.length || 0} ký tự</span>
                      </div>
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                      )}
                    </div>

                    {/* Requirements */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Yêu cầu ứng viên <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-3">
                        {requirements.map((requirement, index) => (
                          <div key={index} className="flex items-center gap-2 sm:gap-3">
                            <input
                              value={requirement}
                              onChange={(e) => updateRequirement(index, e.target.value)}
                              placeholder={`Yêu cầu ${index + 1}: VD: Có kinh nghiệm React từ 2 năm trở lên`}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {requirements.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeRequirement(index)}
                                className="flex-shrink-0 w-8 h-8 p-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={addRequirement}
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Thêm yêu cầu
                        </Button>
                      </div>
                      {errors.requirements && (
                        <p className="text-red-500 text-sm mt-1">{errors.requirements.message}</p>
                      )}
                    </div>

                    {/* Benefits */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quyền lợi (tùy chọn)
                      </label>
                      <div className="space-y-3">
                        {benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center gap-2 sm:gap-3">
                            <input
                              value={benefit}
                              onChange={(e) => updateBenefit(index, e.target.value)}
                              placeholder={`Quyền lợi ${index + 1}: VD: Bảo hiểm y tế 100%`}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {benefits.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeBenefit(index)}
                                className="flex-shrink-0 w-8 h-8 p-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={addBenefit}
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Thêm quyền lợi
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Preview & Submit */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Preview Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Xem trước tin tuyển dụng</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      {/* Job Preview */}
                      <div className="space-y-4 sm:space-y-6">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                            {watchedValues.title || 'Tiêu đề công việc'}
                          </h2>
                          <p className="text-base sm:text-lg text-gray-700">
                            {user?.name || 'Tên công ty'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                          <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mx-auto mb-1" />
                            <div className="font-semibold text-xs sm:text-sm">
                              {watchedValues.salaryMin && watchedValues.salaryMax
                                ? `${(watchedValues.salaryMin / 1000000).toFixed(0)}-${(watchedValues.salaryMax / 1000000).toFixed(0)}M`
                                : 'Thỏa thuận'
                              }
                            </div>
                            <div className="text-xs text-gray-500">Lương</div>
                          </div>

                          <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mx-auto mb-1" />
                            <div className="font-semibold text-xs sm:text-sm">
                              {watchedValues.location || 'Địa điểm'}
                            </div>
                            <div className="text-xs text-gray-500">Vị trí</div>
                          </div>

                          <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mx-auto mb-1" />
                            <div className="font-semibold text-xs sm:text-sm">
                              {EXPERIENCE_LEVEL_OPTIONS.find(opt => opt.value === watchedValues.experienceLevel)?.label || 'Kinh nghiệm'}
                            </div>
                            <div className="text-xs text-gray-500">Cấp độ</div>
                          </div>

                          <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mx-auto mb-1" />
                            <div className="font-semibold text-xs sm:text-sm">
                              {watchedValues.expiresAt
                                ? new Date(watchedValues.expiresAt).toLocaleDateString('vi-VN')
                                : 'Hết hạn'
                              }
                            </div>
                            <div className="text-xs text-gray-500">Deadline</div>
                          </div>
                        </div>

                        {/* Skills */}
                        {watchedValues.skillIds && watchedValues.skillIds.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Kỹ năng yêu cầu</h3>
                            <div className="flex flex-wrap gap-2">
                              {watchedValues.skillIds.map((skillId) => {
                                const skill = skillOptions.find((s: { value: string; label: string }) => s.value === skillId);
                                return skill ? (
                                  <Badge key={skillId} variant="secondary">
                                    {skill.label}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">Mô tả công việc</h3>
                          <div className="text-gray-700 whitespace-pre-wrap">
                            {watchedValues.description || 'Mô tả công việc sẽ hiển thị ở đây...'}
                          </div>
                        </div>

                        {/* Requirements */}
                        {requirements.filter(req => req.trim() !== '').length > 0 && (
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Yêu cầu ứng viên</h3>
                            <ul className="space-y-2">
                              {requirements.filter(req => req.trim() !== '').map((requirement, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-700">{requirement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Benefits */}
                        {benefits.filter(benefit => benefit.trim() !== '').length > 0 && (
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Quyền lợi</h3>
                            <ul className="space-y-2">
                              {benefits.filter(benefit => benefit.trim() !== '').map((benefit, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-700">{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Confirmation */}
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">
                            Xác nhận cập nhật
                          </h4>
                          <p className="text-gray-600 text-sm mb-4">
                            Tin tuyển dụng sẽ được cập nhật với thông tin mới. Nếu có thay đổi quan trọng, 
                            tin có thể cần được duyệt lại bởi admin.
                          </p>

                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id="confirm-update"
                              checked={isConfirmed}
                              onChange={(e) => setIsConfirmed(e.target.checked)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <label htmlFor="confirm-update" className="text-sm text-gray-700 cursor-pointer">
                              Tôi xác nhận thông tin trên là chính xác và đồng ý cập nhật tin này
                            </label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8">
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Quay lại
                  </Button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/jobs/${jobId}`)}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Xem tin hiện tại
                </Button>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Tiếp tục
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    loading={isUpdating}
                    disabled={isUpdating || !isConfirmed}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto"
                    size="sm"
                  >
                    <Save className="w-4 h-4" />
                    {isUpdating ? 'Đang cập nhật...' : 'Cập nhật tin tuyển dụng'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditJobPage;