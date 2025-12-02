'use client';

import { Button, Card } from '@/components/ui';
import { useApi } from '@/hooks/use-api';
import { companiesApi } from '@/lib/api';
import { ANIMATION_VARIANTS } from '@/lib/constants';
import { Company } from '@/lib/types';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const TopCompanies = () => {
  const { data: companiesResponse, loading } = useApi(
    () => companiesApi.getCompanies({ limit: 8 }),
    [],
    { immediate: true }
  );

  const companies = companiesResponse?.data || [];

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          {...ANIMATION_VARIANTS.fadeIn}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Công ty hàng đầu
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Những nhà tuyển dụng uy tín đang tìm kiếm nhân tài
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6"
          variants={ANIMATION_VARIANTS.stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {companies.map((company: Company) => (
            <motion.div
              key={company._id}
              variants={ANIMATION_VARIANTS.slideUp}
            >
              <Card
                hoverable
                className="p-4 text-center cursor-pointer group h-24 flex items-center justify-center"
                onClick={() => window.location.href = `/companies/${company._id}`}
              >
                {company.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt={company.name}
                    className="max-h-12 max-w-full object-contain group-hover:scale-110 transition-transform duration-200"
                  />
                ) : (
                  <div className="text-2xl font-bold text-gray-400 group-hover:text-gray-600 transition-colors">
                    {company.name.charAt(0)}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/companies'}
          >
            Xem tất cả công ty
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TopCompanies;