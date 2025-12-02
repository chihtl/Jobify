'use client';

import { Card, CardContent, SkeletonCard } from '@/components/ui';
import {
  AlertTriangle,
  Briefcase,
  Building2,
  CheckCircle,
  FileText,
  TrendingDown,
  TrendingUp,
  Users
} from 'lucide-react';

interface AdminStatsProps {
  stats: any;
  loading: boolean;
}

const AdminStats = ({ stats, loading }: AdminStatsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Tổng người dùng',
      value: stats?.users?.total || 0,
      change: stats?.users?.newThisMonth || 0,
      changeLabel: 'mới trong tháng',
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Công ty',
      value: stats?.companies?.total || 0,
      change: stats?.companies?.newThisMonth || 0,
      changeLabel: 'mới trong tháng',
      icon: Building2,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Việc làm',
      value: stats?.jobPosts?.total || 0,
      change: stats?.jobPosts?.newThisMonth || 0,
      changeLabel: 'mới trong tháng',
      icon: Briefcase,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Đơn ứng tuyển',
      value: stats?.applications?.total || 0,
      change: stats?.applications?.newThisMonth || 0,
      changeLabel: 'mới trong tháng',
      icon: FileText,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Việc làm đang hoạt động',
      value: stats?.jobPosts?.active || 0,
      change: stats?.jobPosts?.total ?
        Math.round((stats.jobPosts.active / stats.jobPosts.total) * 100) : 0,
      changeLabel: '% tổng số việc làm',
      icon: CheckCircle,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Đơn chờ xử lý',
      value: stats?.applications?.pending || 0,
      change: stats?.applications?.total ?
        Math.round((stats.applications.pending / stats.applications.total) * 100) : 0,
      changeLabel: '% tổng đơn ứng tuyển',
      icon: AlertTriangle,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Danh mục',
      value: stats?.categories?.total || 0,
      change: 0,
      changeLabel: 'danh mục hoạt động',
      icon: TrendingUp,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    },
    {
      title: 'Kỹ năng',
      value: stats?.skills?.total || 0,
      change: 0,
      changeLabel: 'kỹ năng được theo dõi',
      icon: TrendingDown,
      color: 'pink',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const isPositive = stat.change > 0;
        const isPercentage = stat.changeLabel.includes('%');

        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {stat.value.toLocaleString()}
                  </p>

                  {stat.change !== 0 && (
                    <div className={`flex items-center gap-1 text-sm ${isPositive && !isPercentage ? 'text-green-600' :
                        isPercentage ? 'text-gray-600' : 'text-gray-500'
                      }`}>
                      {isPositive && !isPercentage && <TrendingUp className="w-3 h-3" />}
                      <span>
                        {isPercentage ? '' : isPositive ? '+' : ''}
                        {stat.change}
                        {isPercentage ? '%' : ''} {stat.changeLabel}
                      </span>
                    </div>
                  )}

                  {stat.change === 0 && (
                    <p className="text-sm text-gray-500">
                      {stat.changeLabel}
                    </p>
                  )}
                </div>

                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminStats;