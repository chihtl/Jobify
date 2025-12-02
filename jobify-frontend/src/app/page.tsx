import FeaturedCategories from '@/components/features/home/featured-categories';
import FeaturedJobs from '@/components/features/home/featured-jobs';
import HeroSection from '@/components/features/home/hero-section';
import TopCompanies from '@/components/features/home/top-companies';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedCategories />
      <FeaturedJobs />
      <TopCompanies />
    </div>
  );
}