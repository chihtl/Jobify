'use client';

import {
  Button,
  Card,
  CardContent
} from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { ANIMATION_VARIANTS } from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Chrome,
  Eye,
  EyeOff,
  Facebook,
  Github,
  Lock,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, user } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);
    }
  }, [user, router, searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);

    try {
      // Sử dụng unified login - server sẽ tự động detect user type
      await login(data);

      // Success - will be redirected by useEffect
      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);

    } catch (error: unknown) {
      // Handle specific error messages
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number } };
        if (apiError.response?.status === 401) {
          setError('email', { message: 'Email hoặc mật khẩu không chính xác' });
          setError('password', { message: 'Email hoặc mật khẩu không chính xác' });
        } else if (apiError.response?.status === 404) {
          setError('email', { message: 'Không tìm thấy tài khoản với email này' });
        } else {
          toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
        }
      } else {
        toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`Đăng nhập với ${provider} đang được phát triển`);
    // TODO: Implement social login
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md shadow-[0_6px_24px_0px_rgba(0,0,0,0.05),0px_0px_0px_1px_rgba(0,0,0,0.08)] rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 pt-4">
          <motion.div
            className="inline-flex items-center gap-2 mb-4"
            {...ANIMATION_VARIANTS.fadeIn}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-base sm:text-lg">J</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">Jobify</span>
          </motion.div>

          <motion.h1
            className="text-xl sm:text-2xl font-bold text-gray-900 mb-2"
            {...ANIMATION_VARIANTS.slideUp}
          >
            Chào mừng trở lại!
          </motion.h1>

          <motion.p
            className="text-sm sm:text-base text-gray-600"
            {...ANIMATION_VARIANTS.slideUp}
          >
            Đăng nhập để tiếp tục hành trình của bạn
          </motion.p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="your@email.com"
                    className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-12 py-2.5 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                loading={isSubmitting}
                className="w-full py-2.5 sm:py-3 text-sm sm:text-base"
              >
                {isSubmitting ? 'Đang đăng nhập...' : (
                  <>
                    Đăng nhập
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-4 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc đăng nhập với</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('Google')}
                className="p-2 sm:p-3"
              >
                <Chrome className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('Facebook')}
                className="p-2 sm:p-3"
              >
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('GitHub')}
                className="p-2 sm:p-3"
              >
                <Github className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
              </Button>
            </div>

            {/* Register Link */}
            <div className="text-center mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
              <p className="text-xs sm:text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <Link
                  href="/register"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;