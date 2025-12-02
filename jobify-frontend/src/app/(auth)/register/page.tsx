'use client';

import {
  Button,
  Card,
  CardContent
} from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useMutation } from '@/hooks/use-api';
import { companiesApi, usersApi } from '@/lib/api';
import { ANIMATION_VARIANTS } from '@/lib/constants';
import { UserRole } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  Phone,
  User
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Validation schemas
const userRegisterSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số').optional(),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

const companyRegisterSchema = z.object({
  name: z.string().min(2, 'Tên công ty phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số').optional(),
  websiteUrl: z.string().url('URL website không hợp lệ').optional().or(z.literal('')),
  location: z.string().min(2, 'Địa chỉ phải có ít nhất 2 ký tự').optional(),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự').optional(),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type UserRegisterFormData = z.infer<typeof userRegisterSchema>;
type CompanyRegisterFormData = z.infer<typeof companyRegisterSchema>;

const RegisterPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.USER);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // Parse role from URL if provided
  useEffect(() => {
    const roleParam = searchParams.get('type');
    if (roleParam === 'company') {
      setSelectedRole(UserRole.COMPANY);
    }
  }, [searchParams]);

  const userForm = useForm<UserRegisterFormData>({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    }
  });

  const companyForm = useForm<CompanyRegisterFormData>({
    resolver: zodResolver(companyRegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      websiteUrl: '',
      location: '',
      description: '',
      password: '',
      confirmPassword: '',
    }
  });

  const currentForm = selectedRole === UserRole.USER ? userForm : companyForm;

  const { mutate: registerUser, loading: isRegisteringUser } = useMutation(
    (data: any) => usersApi.createUser(data),
    {
      onSuccess: () => {
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        router.push('/login');
      },
      onError: (error: any) => {
        if (error.response?.status === 409) {
          currentForm.setError('email', { message: 'Email đã được sử dụng' });
        } else {
          toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
        }
      }
    }
  );

  const { mutate: registerCompany, loading: isRegisteringCompany } = useMutation(
    (data: any) => companiesApi.createCompany(data),
    {
      onSuccess: () => {
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        router.push('/login?type=company');
      },
      onError: (error: any) => {
        if (error.response?.status === 409) {
          currentForm.setError('email', { message: 'Email đã được sử dụng' });
        } else {
          toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
        }
      }
    }
  );

  const isSubmitting = isRegisteringUser || isRegisteringCompany;

  const roleOptions = [
    {
      value: UserRole.USER,
      label: 'Ứng viên',
      icon: User,
      description: 'Tìm kiếm và ứng tuyển việc làm',
    },
    {
      value: UserRole.COMPANY,
      label: 'Nhà tuyển dụng',
      icon: Building2,
      description: 'Đăng tin tuyển dụng và quản lý ứng viên',
    }
  ];

  const onSubmit = async (data: UserRegisterFormData | CompanyRegisterFormData) => {
    if (!acceptTerms) {
      toast.error('Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }

    const { confirmPassword, ...registerData } = data;

    Object.entries(registerData).forEach(([k, v]) => {
      if(!v) {
        delete registerData[k as keyof typeof registerData];
      }
    })

    if (selectedRole === UserRole.USER) {
      registerUser(registerData);
    } else {
      registerCompany(registerData);
    }
  };

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = [
      password.length >= 6,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];

    strength = checks.filter(Boolean).length;

    if (strength <= 2) return { label: 'Yếu', color: 'red', width: '33%' };
    if (strength <= 4) return { label: 'Trung bình', color: 'yellow', width: '66%' };
    return { label: 'Mạnh', color: 'green', width: '100%' };
  };

  const passwordValue = currentForm.watch('password') || '';
  const passwordStrength = getPasswordStrength(passwordValue);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center gap-2 mb-4"
            {...ANIMATION_VARIANTS.fadeIn}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Jobify</span>
          </motion.div>

          <motion.h1
            className="text-2xl font-bold text-gray-900 mb-2"
            {...ANIMATION_VARIANTS.slideUp}
          >
            Tạo tài khoản mới
          </motion.h1>

          <motion.p
            className="text-gray-600"
            {...ANIMATION_VARIANTS.slideUp}
          >
            Bắt đầu hành trình nghề nghiệp của bạn ngay hôm nay
          </motion.p>
        </div>

        {/* Register Form */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            <form onSubmit={currentForm.handleSubmit(onSubmit)} className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tôi muốn đăng ký là:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roleOptions.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.value;

                    return (
                      <motion.button
                        key={role.value}
                        type="button"
                        onClick={() => setSelectedRole(role.value)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                            <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-600'
                              }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'
                                }`}>
                                {role.label}
                              </span>
                              {/* {isSelected && (
                                <Badge variant="success" size="sm">
                                  Đã chọn
                                </Badge>
                              )} */}
                            </div>
                            <p className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-600'
                              }`}>
                              {role.description}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Field */}
                <div className={selectedRole === UserRole.USER ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedRole === UserRole.USER ? 'Họ và tên' : 'Tên công ty'} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...currentForm.register('name')}
                      type="text"
                      placeholder={selectedRole === UserRole.USER ? 'Nguyễn Văn A' : 'Công ty ABC'}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentForm.formState.errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                  </div>
                  {currentForm.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{currentForm.formState.errors.name.message}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...currentForm.register('email')}
                      type="email"
                      placeholder="your@email.com"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentForm.formState.errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                  </div>
                  {currentForm.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">{currentForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...currentForm.register('phone')}
                      type="tel"
                      placeholder="0123456789"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentForm.formState.errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                  </div>
                  {currentForm.formState.errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{currentForm.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Company-specific fields */}
              {selectedRole === UserRole.COMPANY && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        {...companyForm.register('websiteUrl')}
                        type="url"
                        placeholder="https://yourcompany.com"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${companyForm.formState.errors.websiteUrl ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                    </div>
                    {companyForm.formState.errors.websiteUrl && (
                      <p className="text-red-500 text-sm mt-1">{companyForm.formState.errors.websiteUrl.message}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ
                    </label>
                    <input
                      {...companyForm.register('location')}
                      type="text"
                      placeholder="Hà Nội, Việt Nam"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${companyForm.formState.errors.location ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {companyForm.formState.errors.location && (
                      <p className="text-red-500 text-sm mt-1">{companyForm.formState.errors.location.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả công ty
                    </label>
                    <textarea
                      {...companyForm.register('description')}
                      rows={3}
                      placeholder="Mô tả ngắn về công ty của bạn..."
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${companyForm.formState.errors.description ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {companyForm.formState.errors.description && (
                      <p className="text-red-500 text-sm mt-1">{companyForm.formState.errors.description.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...currentForm.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentForm.formState.errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Password Strength */}
                  {passwordValue && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Độ mạnh mật khẩu:</span>
                        <span className={`font-medium text-${passwordStrength.color}-600`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full bg-${passwordStrength.color}-500 transition-all duration-300`}
                          style={{ width: passwordStrength.width }}
                        />
                      </div>
                    </div>
                  )}

                  {currentForm.formState.errors.password && (
                    <p className="text-red-500 text-sm mt-1">{currentForm.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...currentForm.register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentForm.formState.errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {currentForm.formState.errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{currentForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex  gap-3 items-center">
                <input
                  id="accept-terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="accept-terms" className="text-sm text-gray-700">
                  Tôi đồng ý với{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                    Điều khoản sử dụng
                  </Link>
                  {' '}và{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                    Chính sách bảo mật
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || !acceptTerms}
                loading={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Đang tạo tài khoản...' : (
                  <>
                    Tạo tài khoản
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                Đã có tài khoản?{' '}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;