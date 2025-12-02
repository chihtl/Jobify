'use client';

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SkeletonCard
} from '@/components/ui';
import { companiesApi, jobsApi } from '@/lib/api';
import { formatRelativeTime, formatSalaryRange } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Globe,
  Mail,
  MapPin,
  Phone,
  Star,
  TrendingUp,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Company {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  websiteUrl?: string;
  location: string;
  description: string;
  industry: string;
  companySize: string;
  foundedYear?: number;
  logoUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    jobPosts?: number;
    employees?: number;
  };
}

interface JobPost {
  _id: string;
  title: string;
  description: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: string;
  experienceLevel: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  categoryId?: {
    _id: string;
    name: string;
  };
  skillIds?: Array<{
    _id: string;
    name: string;
  }>;
}

interface JobsResponse {
  data: JobPost[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const CompanyDetailPage = () => {
  const params = useParams();
  const companyId = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<JobsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);

  // Fetch company details
  useEffect(() => {
    if (companyId) {
      fetchCompanyDetails();
      fetchCompanyJobs();
    }
  }, [companyId]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      const response = await companiesApi.getCompanyById(companyId);
      if (response?.data) {
        setCompany(response.data);
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyJobs = async () => {
    try {
      setJobsLoading(true);
      const response = await jobsApi.getJobsByCompany(companyId);
      if (response?.data) {
        setJobs(response.data);
      }
    } catch (error) {
      console.error('Error fetching company jobs:', error);
    } finally {
      setJobsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <SkeletonCard />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <div className="lg:col-span-2 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy công ty</h2>
          <p className="text-gray-600 mb-6">Công ty bạn đang tìm kiếm không tồn tại hoặc đã bị xóa</p>
          <Button onClick={() => window.location.href = '/companies'}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const isExpired = (date: string) => new Date(date) < new Date();
  const isNew = (date: string) => new Date(date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="outline" size="sm">
                <Link href="/companies" className='flex items-center '>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Link>
              </Button>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Company Logo */}
              <Avatar
                src={company.logoUrl}
                name={company.name}
                size="xl"
                className="border-4 border-white shadow-lg"
              />

              {/* Company Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {company.name}
                  </h1>
                  {company.isVerified && (
                    <Badge className="bg-green-100 text-green-800">
                      ✓ Xác thực
                    </Badge>
                  )}
                  {company.isActive && (
                    <Badge className="bg-blue-100 text-blue-800">
                      Hoạt động
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{company.location}</span>
                  </div>
                  {/* <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>{company.industry}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{company.companySize}</span>
                  </div> */}
                  {company.foundedYear && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Thành lập {company.foundedYear}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  {company.websiteUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(company.websiteUrl, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => window.open(`mailto:${company.email}`)}
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Liên hệ
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar */}
            <div className="space-y-6">
              {/* Company Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Thống kê
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Việc làm đang tuyển:</span>
                    <span className="font-semibold text-blue-600">
                      {company._count?.jobPosts || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tham gia:</span>
                    <span className="font-semibold">
                      {formatRelativeTime(company.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Cập nhật:</span>
                    <span className="font-semibold">
                      {formatRelativeTime(company.updatedAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Thông tin liên hệ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{company.email}</span>
                  </div>
                  {company.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{company.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{company.location}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Company Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Giới thiệu</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {company.description}
                  </p>
                </CardContent>
              </Card>

              {/* Job Listings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Việc làm đang tuyển ({jobs?.data?.length || 0})
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {jobsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  ) : jobs?.data?.length === 0 ? (
                    <div className="text-center py-8">
                      <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="font-medium text-gray-900 mb-1">
                        Chưa có việc làm nào
                      </h3>
                      <p className="text-sm text-gray-500">
                        Công ty này chưa đăng việc làm nào
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(jobs?.data || []).map((job, index) => (
                        <motion.div
                          key={job._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {job.title}
                                    </h3>
                                    {isNew(job.createdAt) && (
                                      <Badge className="bg-green-100 text-green-800 text-xs">
                                        Mới
                                      </Badge>
                                    )}
                                    {job.expiresAt && isExpired(job.expiresAt) && (
                                      <Badge className="bg-red-100 text-red-800 text-xs">
                                        Hết hạn
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      <span>{job.location}</span>
                                    </div>
                                    {(job.salaryMin || job.salaryMax) && (
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="w-4 h-4" />
                                        <span>{formatSalaryRange(job.salaryMin, job.salaryMax)}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      <span className="capitalize">{job.jobType.replace('-', ' ')}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4" />
                                      <span className="capitalize">{job.experienceLevel}</span>
                                    </div>
                                  </div>

                                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                    {job.description}
                                  </p>

                                  {job.categoryId && (
                                    <div className="flex items-center gap-2 mb-3">
                                      <Badge variant="outline" className="text-xs">
                                        {job.categoryId.name}
                                      </Badge>
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                  <Button
                                    size="sm"
                                    className="whitespace-nowrap"
                                    onClick={() => window.location.href = `/jobs/${job._id}`}
                                  >
                                    Xem chi tiết
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailPage;
