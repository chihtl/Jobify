'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Chỉ redirect khi đã khởi tạo xong và không có user
    if (isInitialized && !isLoading && !user) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
    }
  }, [user, isLoading, isInitialized, router]);

  // Hiển thị loading khi đang khởi tạo hoặc loading
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Không hiển thị gì khi chưa khởi tạo xong
  if (!isInitialized) {
    return null;
  }

  // Không có user sau khi khởi tạo xong
  if (!user) {
    return null;
  }

  return <>{children}</>;
}