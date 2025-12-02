'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SkeletonCard } from '@/components/ui/skeleton';
import { companiesApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { Building2, Calendar, Filter, Globe, MapPin, Search, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Company {
  _id: string;
  name: string;
  email: string;
  logoUrl?: string;
  websiteUrl?: string;
  location: string;
  description: string;
  industry?: string;
  companySize?: string;
  foundedYear?: number;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  jobCount?: number;
}

interface CompaniesResponse {
  data: Company[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<CompaniesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await companiesApi.getCompanies();
      if (response?.data) {
        setCompanies(response.data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort companies
  const filteredCompanies = (companies?.data || []).filter((company: Company) => {
    const matchesSearch = !searchQuery ||
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIndustry = !industryFilter || company.industry === industryFilter;
    const matchesSize = !sizeFilter || company.companySize === sizeFilter;

    return matchesSearch && matchesIndustry && matchesSize;
  }).sort((a: Company, b: Company) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'location':
        return a.location.localeCompare(b.location);
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default:
        return 0;
    }
  });

  // Get unique filter options
  const companiesList = companies?.data || [];
  const industries = [...new Set(companiesList.map((c: Company) => c.industry).filter((i): i is string => Boolean(i)))].sort();
  const companySizes = [...new Set(companiesList.map((c: Company) => c.companySize).filter((s): s is string => Boolean(s)))].sort();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Các Công Ty</h1>
          <p className="text-gray-600">Khám phá các công ty hàng đầu và cơ hội nghề nghiệp</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Các Công Ty</h1>
        <p className="text-gray-600">Khám phá các công ty hàng đầu và cơ hội nghề nghiệp</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Tổng Công Ty</p>
                <p className="text-2xl font-bold text-gray-900">{companies?.data?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Đang Tuyển</p>
                <p className="text-2xl font-bold text-gray-900">
                  {companiesList.filter((c: Company) => c.jobCount && c.jobCount > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Thành Phố</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(companiesList.map((c: Company) => c.location.split(',')[0])).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Năm 2024</p>
                <p className="text-2xl font-bold text-gray-900">
                  {companiesList.filter((c: Company) => c.foundedYear === 2024).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm công ty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Industry Filter */}
            {/* <div>
              <Select
                value={industryFilter}
                onChange={setIndustryFilter}
                placeholder="Ngành nghề"
                options={[
                  { value: '', label: 'Tất cả' },
                  ...industries.map((industry: string) => ({
                    value: industry,
                    label: industry
                  }))
                ]}
              />
            </div> */}

            {/* Size Filter */}

            {/* Sort */}
            <div>
              <Select
                value={sortBy}
                onChange={setSortBy}
                placeholder="Sắp xếp"
                options={[
                  { value: 'name', label: 'Tên A-Z' },
                  { value: 'location', label: 'Địa điểm' },
                  { value: 'newest', label: 'Mới nhất' },
                  { value: 'oldest', label: 'Cũ nhất' }
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          Hiển thị {filteredCompanies.length} trong tổng số {companies?.totalItems || 0} công ty
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter className="w-4 h-4" />
          <span>Đã lọc</span>
        </div>
      </div>

      {/* Companies Grid */}
      {filteredCompanies.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy công ty nào</h3>
            <p className="text-gray-600 mb-4">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setIndustryFilter('');
              setSizeFilter('');
              setSortBy('name');
            }}>
              Xóa bộ lọc
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company, index) => (
            <motion.div
              key={company._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow group">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                      {company.logoUrl ? (
                        <img
                          src={company.logoUrl}
                          alt={company.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Building2 className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg mb-2 group-hover:text-blue-600 transition-colors">
                        {company.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{company.location}</span>
                      </div>
                      {company.industry && (
                        <Badge variant="secondary" className="text-xs">
                          {company.industry}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {company.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    {company.companySize && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{company.companySize}</span>
                      </div>
                    )}
                    {company.foundedYear && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{company.foundedYear}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <Link href={`/companies/${company._id}`}>
                        Xem chi tiết
                      </Link>
                    </Button>
                    {company.websiteUrl && (
                      <Button variant="outline" size="md">
                        <a
                          href={company.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <Globe className="w-4 h-4" />
                          Website
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;
