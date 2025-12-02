"use client";

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SkeletonCard,
} from "@/components/ui";
import { useApi } from "@/hooks/use-api";
import { savedJobsApi } from "@/lib/api";
import { JOB_TYPE_OPTIONS } from "@/lib/constants";
import { formatRelativeTime, formatSalaryRange } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Clock,
  DollarSign,
  Eye,
  Heart,
  MapPin,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SavedJobsListProps {
  userId: string;
}

const SavedJobsList = ({ userId }: SavedJobsListProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch saved jobs
  const {
    data: savedJobs,
    loading: savedJobsLoading,
    refetch: refetchSavedJobs,
  } = useApi(() => savedJobsApi.getSavedJobsByUser(userId), [], {
    immediate: true,
  });

  // Filter saved jobs
  const filteredSavedJobs = (savedJobs?.data || []).filter((savedJob: any) => {
    const job = savedJob.jobPostId;
    const company = job?.companyId;

    if (!searchQuery) return true;

    return (
      job?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job?.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleUnsaveJob = async (jobPostId: string) => {
    try {
      await savedJobsApi.unsaveJob(userId, jobPostId);
      toast.success("Đã bỏ lưu việc làm");
      refetchSavedJobs();
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  };

  const handleViewJob = (jobId: string) => {
    window.open(`/jobs/${jobId}`, "_blank");
  };

  if (savedJobsLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Việc làm đã lưu ({savedJobs?.data?.length || 0})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refetchSavedJobs}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm việc làm đã lưu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Saved Jobs List */}
      {filteredSavedJobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {savedJobs?.data?.length === 0
                ? "Chưa có việc làm đã lưu"
                : "Không tìm thấy kết quả"}
            </h3>
            <p className="text-gray-600 mb-6">
              {savedJobs?.data?.length === 0
                ? "Lưu những công việc yêu thích để xem lại sau"
                : "Thử thay đổi từ khóa tìm kiếm"}
            </p>
            {savedJobs?.data?.length === 0 && (
              <Button onClick={() => (window.location.href = "/jobs")}>
                Tìm việc làm
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSavedJobs.map((savedJob: any, index: number) => {
            const job = savedJob.jobPostId;
            const company = job?.companyId;
            const jobTypeOption = JOB_TYPE_OPTIONS.find(
              (option) => option.value === job?.jobType
            );

            return (
              <motion.div
                key={savedJob._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Company Avatar */}
                      <Avatar
                        src={company?.logoUrl}
                        name={company?.name}
                        size="lg"
                        className="flex-shrink-0"
                      />

                      {/* Job Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {job?.title}
                            </h3>
                            <p className="text-gray-600 mb-2">
                              {company?.name}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                              {job?.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{job.location}</span>
                                </div>
                              )}

                              {(job?.salaryMin || job?.salaryMax) && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  <span>
                                    {formatSalaryRange(
                                      job.salaryMin,
                                      job.salaryMax
                                    )}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>
                                  Đăng {formatRelativeTime(job?.createdAt)}
                                </span>
                              </div>
                            </div>

                            {/* Job Type & Skills */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {jobTypeOption && (
                                <Badge variant="outline" size="sm">
                                  {jobTypeOption.icon} {jobTypeOption.label}
                                </Badge>
                              )}

                              {job?.skillIds?.slice(0, 3).map((skill: any) => (
                                <Badge
                                  key={skill._id}
                                  variant="secondary"
                                  size="sm"
                                >
                                  {skill.name}
                                </Badge>
                              ))}

                              {job?.skillIds?.length > 3 && (
                                <Badge variant="outline" size="sm">
                                  +{job.skillIds.length - 3} more
                                </Badge>
                              )}
                            </div>

                            {/* Job Description Preview */}
                            {job?.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {job.description
                                  .replace(/<[^>]*>/g, "")
                                  .substring(0, 150)}
                                ...
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewJob(job?._id)}
                              className="flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              Xem
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnsaveJob(job?._id)}
                              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                              Bỏ lưu
                            </Button>
                          </div>
                        </div>

                        {/* Saved Date */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Heart className="w-3 h-3 fill-current text-red-500" />
                            <span>
                              Đã lưu {formatRelativeTime(savedJob.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedJobsList;
