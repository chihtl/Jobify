"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Check, X, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";
import { SkeletonCard } from "@/components/ui/skeleton";

interface CompanyData {
  _id: string;
  name: string;
  email: string;
  websiteUrl?: string;
  location?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

const AdminCompaniesPage = () => {
  const { user, userType, isLoading } = useAuth();
  const router = useRouter();

  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!isLoading && (!user || userType !== "admin")) {
      router.push("/login?redirect=/admin/companies");
    }
  }, [user, userType, isLoading, router]);

  // Fetch data
  useEffect(() => {
    if (user && userType === "admin") {
      fetchData();
    }
  }, [user, userType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admins/companies`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const toggleCompanyVerify = async (companyId: string) => {
    try {
      setUpdating(companyId);
      const response = await fetch(
        `${API_BASE_URL}/admins/companies/${companyId}/toggle-verify`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const updatedCompany = await response.json();
        setCompanies((prev) =>
          prev.map((company) =>
            company._id === companyId
              ? { ...company, isVerified: updatedCompany.isVerified }
              : company
          )
        );
        toast.success("Đã cập nhật trạng thái xác minh thành công!");
      } else {
        throw new Error("Failed to update company verify status");
      }
    } catch (error) {
      console.error("Error updating company verify status:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái xác minh");
    } finally {
      setUpdating(null);
    }
  };

  const toggleCompanyActive = async (companyId: string) => {
    try {
      setUpdating(companyId);
      const response = await fetch(
        `${API_BASE_URL}/admins/companies/${companyId}/toggle-active`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const updatedCompany = await response.json();
        setCompanies((prev) =>
          prev.map((company) =>
            company._id === companyId
              ? { ...company, isActive: updatedCompany.isActive }
              : company
          )
        );
        toast.success("Đã cập nhật trạng thái hoạt động thành công!");
      } else {
        throw new Error("Failed to update company active status");
      }
    } catch (error) {
      console.error("Error updating company active status:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái hoạt động");
    } finally {
      setUpdating(null);
    }
  };

  const getCompanyStats = () => {
    const verifiedCompanies = companies.filter(
      (company) => company.isVerified
    ).length;
    const activeCompanies = companies.filter(
      (company) => company.isActive
    ).length;
    return {
      total: companies.length,
      verified: verifiedCompanies,
      active: activeCompanies,
    };
  };

  const stats = getCompanyStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <SkeletonCard />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || userType !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Quản lý công ty
                </h1>
                <p className="text-gray-600 mt-1">
                  Quản lý danh sách công ty trong hệ thống
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={fetchData}
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Làm mới
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
              <div className="text-sm text-blue-700">Tổng số công ty</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.verified}
              </div>
              <div className="text-sm text-green-700">Đã xác minh</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {stats.active}
              </div>
              <div className="text-sm text-orange-700">Đang hoạt động</div>
            </div>
          </div>

          {/* Companies List */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : companies.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  Chưa có công ty nào trong hệ thống
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {companies.map((company, index) => (
                <motion.div
                  key={company._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                        <div className="flex-grow">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {company.name}
                          </h3>
                          <div className="text-sm text-gray-500 mt-1 space-y-1">
                            <p>{company.email}</p>
                            {company.websiteUrl && (
                              <p>
                                <a
                                  href={company.websiteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {company.websiteUrl}
                                </a>
                              </p>
                            )}
                            {company.location && <p>{company.location}</p>}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Badge
                              variant={
                                company.isVerified ? "success" : "secondary"
                              }
                            >
                              {company.isVerified
                                ? "Đã xác minh"
                                : "Chưa xác minh"}
                            </Badge>
                            <Badge
                              variant={company.isActive ? "success" : "danger"}
                            >
                              {company.isActive ? "Đang hoạt động" : "Tạm khóa"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            variant={
                              company.isVerified ? "destructive" : "primary"
                            }
                            size="sm"
                            onClick={() => toggleCompanyVerify(company._id)}
                            disabled={updating === company._id}
                          >
                            {company.isVerified ? (
                              <X className="w-4 h-4 mr-2" />
                            ) : (
                              <Check className="w-4 h-4 mr-2" />
                            )}
                            {company.isVerified ? "Hủy xác minh" : "Xác minh"}
                          </Button>
                          <Button
                            variant={
                              company.isActive ? "destructive" : "primary"
                            }
                            size="sm"
                            onClick={() => toggleCompanyActive(company._id)}
                            disabled={updating === company._id}
                          >
                            {company.isActive ? (
                              <X className="w-4 h-4 mr-2" />
                            ) : (
                              <Check className="w-4 h-4 mr-2" />
                            )}
                            {company.isActive ? "Khóa" : "Kích hoạt"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCompaniesPage;
