"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/api";
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Edit2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import companiesApi from "@/lib/companies-api";

interface CompanyProfile {
  _id: string;
  name: string;
  email: string;
  logoUrl?: string;
  websiteUrl?: string;
  phone?: string;
  location?: string;
  description?: string;
  isVerified: boolean;
  isActive: boolean;
}

interface Props {
  params: {
    id: string;
  };
}

const CompanyProfilePage = ({ params }: Props) => {
  const { user, userType } = useAuth();
  const router = useRouter();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<CompanyProfile>>({});

  // Check if current user is the owner of this company profile
  const isOwner = userType === "company" && user?._id === params.id;

  useEffect(() => {
    fetchCompanyProfile();
  }, [params.id]);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      const response = await companiesApi.getCompany(params.id);
      if (response?.data) {
        setCompany(response.data);
        setFormData(response.data);
      }
    } catch (error) {
      console.error("Error fetching company profile:", error);
      toast.error("Có lỗi xảy ra khi tải thông tin công ty");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: string) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await companiesApi.updateCompany(params.id, formData);
      setCompany((prev) => ({ ...prev!, ...formData }));
      setIsEditing(false);
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Error updating company profile:", error);
      toast.error("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Không tìm thấy công ty
          </h2>
          <p className="text-gray-600">
            Công ty bạn đang tìm kiếm không tồn tại hoặc đã bị xóa
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6">
            {/* Header with Logo and Basic Info */}
            <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
              <Avatar
                src={
                  company.logoUrl
                    ? `${API_BASE_URL}${company.logoUrl}`
                    : undefined
                }
                name={company.name}
                size="xl"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {company.name}
                  </h1>
                  {company.isVerified && (
                    <Badge
                      variant="success"
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Đã xác minh
                    </Badge>
                  )}
                  {!company.isActive && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      Không hoạt động
                    </Badge>
                  )}
                </div>

                {isOwner && !isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mb-4"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Chỉnh sửa thông tin
                  </Button>
                )}

                {isEditing ? (
                  <div className="space-y-4">
                    <Input
                      value={formData.websiteUrl || ""}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, websiteUrl: value }))
                      }
                      placeholder="Website công ty"
                    />
                    <Input
                      value={formData.phone || ""}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, phone: value }))
                      }
                      placeholder="Số điện thoại"
                    />
                    <Input
                      value={formData.location || ""}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, location: value }))
                      }
                      placeholder="Địa chỉ"
                    />
                    <Textarea
                      value={formData.description || ""}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, description: value }))
                      }
                      placeholder="Mô tả về công ty"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-24"
                      >
                        {saving ? "Đang lưu..." : "Lưu"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData(company);
                        }}
                        disabled={saving}
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {company.websiteUrl && (
                      <p className="flex items-center gap-2 text-gray-600">
                        <Globe className="w-4 h-4" />
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
                    <p className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {company.email}
                    </p>
                    {company.phone && (
                      <p className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        {company.phone}
                      </p>
                    )}
                    {company.location && (
                      <p className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {company.location}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {!isEditing && company.description && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Giới thiệu về công ty
                </h2>
                <p className="text-gray-600 whitespace-pre-line">
                  {company.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Jobs Posted by Company */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Việc làm đang tuyển</CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO: Add jobs list here */}
            <p className="text-gray-600 text-center py-6">
              Chưa có việc làm nào được đăng tải
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyProfilePage;
