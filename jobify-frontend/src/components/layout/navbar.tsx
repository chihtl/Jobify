"use client";

import { Avatar, Button } from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { API_BASE_URL } from "@/lib/api";
import { UserRole } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Calendar,
  FileText,
  Heart,
  LogOut,
  Menu,
  Plus,
  Settings,
  Shield,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, userType, isAuthenticated, logout } = useAuth();
  useEffect(() => {
    console.log(user);
  }, [user]);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
  };

  const getNavItems = () => {
    if (userType === UserRole.COMPANY) {
      return [
        { href: "/candidates", label: "Ứng viên", icon: User },
        { href: "/companies", label: "Công ty", icon: Building2 },
      ];
    }
    return [
      { href: "/jobs", label: "Việc làm", icon: FileText },
      { href: "/companies", label: "Công ty", icon: Building2 },
    ];
  };

  const navItems = getNavItems();

  const userMenuItems = [
    { href: "/profile", label: "Hồ sơ của tôi", icon: User },
    { href: "/profile?tab=saved", label: "Việc làm đã lưu", icon: Heart },
    { href: "/bookings", label: "Lời mời liên hệ", icon: Calendar },
    { href: "/profile?tab=settings", label: "Cài đặt", icon: Settings },
  ];

  const companyMenuItems = [
    {
      href: `/company-profile/${user?._id}`,
      label: "Hồ sơ công ty",
      icon: Building2,
    },
    { href: "/create-job", label: "Đăng việc làm", icon: Plus },
    { href: "/manage-jobs", label: "Quản lý việc làm", icon: FileText },
    { href: "/applications", label: "Đơn ứng tuyển", icon: FileText },
  ];

  const adminMenuItems = [
    { href: "/admin", label: "Dashboard", icon: Shield },
    { href: "/manage-jobs", label: "Quản lý việc làm", icon: FileText },
    { href: "/admin/companies", label: "Quản lý công ty", icon: Building2 },
    { href: "/admin/users", label: "Quản lý người dùng", icon: User },
  ];

  const getMenuItems = () => {
    switch (userType) {
      case UserRole.COMPANY:
        return companyMenuItems;
      case UserRole.ADMIN:
        return adminMenuItems;
      default:
        return userMenuItems;
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-[60]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Jobify
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <Avatar
                    src={
                      (user as any)?.avatarUrl
                        ? `${API_BASE_URL}${(user as any).avatarUrl}`
                        : (user as any)?.logoUrl
                        ? `${API_BASE_URL}${(user as any).logoUrl}`
                        : undefined
                    }
                    name={user?.name}
                    size="md"
                  />
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {userType === UserRole.COMPANY
                        ? "Nhà tuyển dụng"
                        : userType === UserRole.ADMIN
                        ? "Quản trị viên"
                        : "Ứng viên"}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0  bg-opacity-10 z-40"
                        onClick={() => setIsProfileMenuOpen(false)}
                      />

                      {/* Menu */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                      >
                        {getMenuItems().map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <item.icon className="w-4 h-4 mr-3" />
                            {item.label}
                          </Link>
                        ))}
                        <hr className="my-2 border-gray-200" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Đăng xuất
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost">Đăng nhập</Button>
                </Link>
                <Link href="/register">
                  <Button>Đăng ký</Button>
                </Link>
                {/* {userType !== UserRole.COMPANY && (
                  <Link href="/register?type=company">
                    <Button variant="outline">Nhà tuyển dụng</Button>
                  </Link>
                )} */}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-200 py-4"
            >
              <div className="space-y-4">
                {/* Navigation Links */}
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                ))}

                <hr className="border-gray-200" />

                {/* Auth Section */}
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center px-4 py-2 bg-gray-50 rounded-lg">
                      <Avatar
                        src={
                          (user as any)?.avatarUrl
                            ? `${API_BASE_URL}${(user as any).avatarUrl}`
                            : (user as any)?.logoUrl
                            ? `${API_BASE_URL}${(user as any).logoUrl}`
                            : undefined
                        }
                        name={user?.name}
                        size="md"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {user?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {userType === UserRole.COMPANY
                            ? "Nhà tuyển dụng"
                            : userType === UserRole.ADMIN
                            ? "Quản trị viên"
                            : "Ứng viên"}
                        </div>
                      </div>
                    </div>

                    {getMenuItems().map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <item.icon className="w-4 h-4 mr-3" />
                        {item.label}
                      </Link>
                    ))}

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Đăng xuất
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 px-4">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        Đăng nhập
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full">Đăng ký</Button>
                    </Link>
                    <Link
                      href="/register?type=company"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full">
                        Nhà tuyển dụng
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
