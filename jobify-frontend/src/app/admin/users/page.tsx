"use client";

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SkeletonCard,
} from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { API_BASE_URL } from "@/lib/api";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  Crown,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Shield,
  ShieldCheck,
  User,
  Users,
  XCircle,
  Briefcase,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  resumeUrl?: string;
  location?: string;
  bio?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdminData {
  _id: string;
  email: string;
  name?: string;
  role: 'superadmin' | 'moderator';
  createdAt: string;
  updatedAt: string;
}

const AdminUsersPage = () => {
  const { user, userType, isLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserData[]>([]);
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  
  // View toggle
  const [viewMode, setViewMode] = useState<"users" | "admins">("users");

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!isLoading && (!user || userType !== "admin")) {
      router.push("/login?redirect=/admin/users");
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
      
      const [usersResponse, adminsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admins/users`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch(`${API_BASE_URL}/admins/all-admins`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
      ]);

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData || []);
      }

      if (adminsResponse.ok) {
        const adminsData = await adminsResponse.json();
        setAdmins(adminsData || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserActive = async (userId: string) => {
    try {
      setUpdating(userId);
      const response = await fetch(`${API_BASE_URL}/admins/users/${userId}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, isActive: updatedUser.isActive } : user
          )
        );
        toast.success("Đã cập nhật trạng thái thành công!");
      } else {
        throw new Error('Failed to update user status');
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    } finally {
      setUpdating(null);
    }
  };

  const updateAdminRole = async (adminId: string, role: 'superadmin' | 'moderator') => {
    try {
      setUpdating(adminId);
      const response = await fetch(`${API_BASE_URL}/admins/admins/${adminId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        const updatedAdmin = await response.json();
        setAdmins((prev) =>
          prev.map((admin) =>
            admin._id === adminId ? { ...admin, role: updatedAdmin.role } : admin
          )
        );
        toast.success("Đã cập nhật quyền thành công!");
      } else {
        throw new Error('Failed to update admin role');
      }
    } catch (error) {
      console.error("Error updating admin role:", error);
      toast.error("Có lỗi xảy ra khi cập nhật quyền");
    } finally {
      setUpdating(null);
    }
  };

  const getUserStats = () => {
    const activeUsers = users.filter(user => user.isActive !== false).length;
    const inactiveUsers = users.length - activeUsers;
    return { total: users.length, active: activeUsers, inactive: inactiveUsers };
  };

  const getAdminStats = () => {
    const superAdmins = admins.filter(admin => admin.role === 'superadmin').length;
    const moderators = admins.filter(admin => admin.role === 'moderator').length;
    return { total: admins.length, superAdmins, moderators };
  };

  const userStats = getUserStats();
  const adminStats = getAdminStats();

  const currentUserAdmin = admins.find(admin => admin.email === user?.email);
  const canManageRoles = currentUserAdmin?.role === 'superadmin';

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

  const currentData = viewMode === "users" ? users : admins;
  const currentStats = viewMode === "users" ? userStats : adminStats;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Quản lý người dùng
                </h1>
                <p className="text-gray-600 mt-1">
                  Quản lý users và admins trong hệ thống
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={fetchData}
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle & Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* View Toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={viewMode === "users" ? "primary" : "outline"}
              onClick={() => setViewMode("users")}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Người dùng ({userStats.total})
            </Button>
            <Button
              variant={viewMode === "admins" ? "primary" : "outline"}
              onClick={() => setViewMode("admins")}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Quản trị viên ({adminStats.total})
            </Button>
          </div>

          {/* Stats Overview */}
          {viewMode === "users" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {userStats.total}
                </div>
                <div className="text-sm text-blue-700">Tổng người dùng</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {userStats.active}
                </div>
                <div className="text-sm text-green-700">Đang hoạt động</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {userStats.inactive}
                </div>
                <div className="text-sm text-red-700">Tạm khóa</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {adminStats.total}
                </div>
                <div className="text-sm text-blue-700">Tổng quản trị viên</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {adminStats.superAdmins}
                </div>
                <div className="text-sm text-purple-700">Super Admin</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {adminStats.moderators}
                </div>
                <div className="text-sm text-orange-700">Moderator</div>
              </div>
            </div>
          )}

          {/* Data List */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : currentData.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                {viewMode === "users" ? (
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                ) : (
                  <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Không tìm thấy {viewMode === "users" ? "người dùng" : "quản trị viên"} nào
                </h3>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {viewMode === "users" ? (
                // Users List
                users.map((user, index) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* User Avatar */}
                          <Avatar
                            src={
                              user.avatarUrl
                                ? `${API_BASE_URL}${user.avatarUrl}`
                                : undefined
                            }
                            name={user.name}
                            size="lg"
                            className="flex-shrink-0"
                          />

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {user.name}
                                  </h3>
                                  <Badge
                                    variant={user.isActive !== false ? "default" : "secondary"}
                                  >
                                    {user.isActive !== false ? "Hoạt động" : "Tạm khóa"}
                                  </Badge>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    <span>{user.email}</span>
                                  </div>
                                  {user.phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="w-4 h-4" />
                                      <span>{user.phone}</span>
                                    </div>
                                  )}
                                  {user.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      <span>{user.location}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatRelativeTime(user.createdAt)}</span>
                                  </div>
                                </div>

                                {user.bio && (
                                  <p className="text-gray-600 mb-3 line-clamp-2">
                                    {user.bio}
                                  </p>
                                )}

                                {user.resumeUrl && (
                                  <div className="flex items-center gap-2 mb-3">
                                    <Briefcase className="w-4 h-4 text-blue-500" />
                                    <a
                                      href={`${API_BASE_URL}${user.resumeUrl}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline text-sm"
                                    >
                                      Xem CV
                                    </a>
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleUserActive(user._id)}
                                  disabled={updating === user._id}
                                  className={
                                    user.isActive !== false
                                      ? "text-red-600 border-red-600 hover:bg-red-50"
                                      : "text-green-600 border-green-600 hover:bg-green-50"
                                  }
                                >
                                  {user.isActive !== false ? (
                                    <>
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Khóa
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Mở khóa
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                // Admins List
                admins.map((admin, index) => (
                  <motion.div
                    key={admin._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Admin Avatar */}
                          <Avatar
                            name={admin.name || admin.email}
                            size="lg"
                            className="flex-shrink-0"
                          />

                          {/* Admin Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {admin.name || admin.email}
                                  </h3>
                                  <Badge
                                    variant={admin.role === 'superadmin' ? 'primary' : 'secondary'}
                                    className={admin.role === 'superadmin' ? 'bg-purple-100 text-purple-800' : ''}
                                  >
                                    {admin.role === 'superadmin' ? (
                                      <>
                                        <Crown className="w-3 h-3 mr-1" />
                                        Super Admin
                                      </>
                                    ) : (
                                      <>
                                        <ShieldCheck className="w-3 h-3 mr-1" />
                                        Moderator
                                      </>
                                    )}
                                  </Badge>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    <span>{admin.email}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatRelativeTime(admin.createdAt)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Actions - Only for SuperAdmin and not self */}
                              {canManageRoles && admin.email !== user?.email && (
                                <div className="flex gap-2">
                                  <Select
                                    value={admin.role}
                                    onChange={(role) => updateAdminRole(admin._id, role as 'superadmin' | 'moderator')}
                                    options={[
                                      { value: 'moderator', label: 'Moderator' },
                                      { value: 'superadmin', label: 'Super Admin' },
                                    ]}
                                    disabled={updating === admin._id}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
