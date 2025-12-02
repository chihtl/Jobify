'use client';

import { Button, Card } from '@/components/ui';
import { useApi } from '@/hooks/use-api';
import { categoriesApi } from '@/lib/api';
import { ANIMATION_VARIANTS } from '@/lib/constants';
import { Category } from '@/lib/types';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const FeaturedCategories = () => {
  const { data: categories, loading } = useApi(
    () => categoriesApi.getCategoriesSimple(),
    [],
    { immediate: true }
  );

  const categoryIcons = ['💻', '📱', '🎨', '📊', '🛠️', '🧪', '📈', '🏗️'];

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
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
            Danh mục công việc
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá các cơ hội việc làm theo ngành nghề yêu thích của bạn
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4"
          variants={ANIMATION_VARIANTS.stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {categories?.slice(0, 8).map((category: Category, index: number) => (
            <motion.div
              key={category._id}
              variants={ANIMATION_VARIANTS.slideUp}
            >
              <Card
                hoverable
                className="p-6 text-center cursor-pointer min-h-[142px] flex flex-col justify-between group hover:shadow-lg transition-all duration-300"
                onClick={() => window.location.href = `/jobs?categoryId=${category._id}`}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
                  {categoryIcons[index] || '💼'}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/jobs'}
          >
            Xem tất cả danh mục
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;