import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import { Toaster } from '@/components/ui';
import { AuthProvider } from '@/contexts/auth-context';
import { UIProvider } from '@/contexts/ui-context';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Jobify - Nền tảng tìm việc hàng đầu Việt Nam',
  description: 'Khám phá hàng nghìn cơ hội việc làm từ các công ty hàng đầu. Tìm việc dễ dàng, ứng tuyển nhanh chóng cùng Jobify.',
  keywords: 'tìm việc, việc làm, tuyển dụng, IT jobs, công nghệ, career',
  authors: [{ name: 'Jobify Team' }],
  openGraph: {
    title: 'Jobify - Nền tảng tìm việc hàng đầu Việt Nam',
    description: 'Khám phá hàng nghìn cơ hội việc làm từ các công ty hàng đầu',
    url: 'https://jobify.vn',
    siteName: 'Jobify',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Jobify - Tìm việc làm',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jobify - Nền tảng tìm việc hàng đầu Việt Nam',
    description: 'Khám phá hàng nghìn cơ hội việc làm từ các công ty hàng đầu',
    images: ['/images/og-image.jpg'],
    creator: '@jobify_vn',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <UIProvider>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster
              position="bottom-right"
              expand={false}
              richColors
              closeButton
              toastOptions={{
                duration: 5000,
                style: {
                  background: 'white',
                  color: '#333',
                  border: '1px solid #e5e7eb',
                },
              }}
            />
          </AuthProvider>
        </UIProvider>
      </body>
    </html>
  );
}