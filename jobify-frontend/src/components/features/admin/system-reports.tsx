'use client';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import {
  BarChart3,
  Briefcase,
  Building2,
  Download,
  FileText,
  PieChart,
  RefreshCw,
  TrendingUp,
  Users
} from 'lucide-react';

interface SystemReportsProps {
  stats: any;
  loading: boolean;
  onRefresh: () => void;
}

const SystemReports = ({ stats, loading, onRefresh }: SystemReportsProps) => {
  // Mock data for charts - in real app, this would come from API
  const mockChartData = {
    userGrowth: [
      { month: 'T1', users: 120, companies: 15 },
      { month: 'T2', users: 180, companies: 25 },
      { month: 'T3', users: 250, companies: 35 },
      { month: 'T4', users: 320, companies: 45 },
      { month: 'T5', users: 420, companies: 60 },
      { month: 'T6', users: 520, companies: 75 },
    ],
    jobsByCategory: [
      { category: 'IT - Phần mềm', count: 145, percentage: 35 },
      { category: 'Marketing', count: 89, percentage: 22 },
      { category: 'Kinh doanh', count: 67, percentage: 16 },
      { category: 'Thiết kế', count: 45, percentage: 11 },
      { category: 'Khác', count: 64, percentage: 16 },
    ],
    applicationTrends: [
      { status: 'Đang chờ', count: 89, percentage: 35, color: 'yellow' },
      { status: 'Đã xem xét', count: 67, percentage: 26, color: 'blue' },
      { status: 'Được chấp nhận', count: 45, percentage: 18, color: 'green' },
      { status: 'Bị từ chối', count: 54, percentage: 21, color: 'red' },
    ]
  };

  const handleExportReport = (type: string) => {
    // In real app, this would generate and download a report
    console.log(`Exporting ${type} report...`);
    // Mock download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${type}-report-${new Date().toISOString().split('T')[0]}.pdf`;
    // link.click();
  };

  return (
    <div className="space-y-8">
      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Báo cáo hệ thống
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                loading={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Làm mới
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportReport('full')}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Xuất báo cáo
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {((stats?.users?.total || 0) / (stats?.companies?.total || 1)).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Tỷ lệ ứng viên/công ty</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {((stats?.applications?.accepted || 0) / (stats?.applications?.total || 1) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Tỷ lệ ứng tuyển thành công</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {((stats?.jobPosts?.active || 0) / (stats?.jobPosts?.total || 1) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Tỷ lệ việc làm hoạt động</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Tăng trưởng người dùng (6 tháng gần đây)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockChartData.userGrowth.map((data, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 text-sm font-medium text-gray-600">
                    {data.month}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${(data.users / 600) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-blue-600">
                        {data.users} UV
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${(data.companies / 100) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        {data.companies} CT
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full" />
                <span className="text-sm text-gray-600">Ứng viên (UV)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded-full" />
                <span className="text-sm text-gray-600">Công ty (CT)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Categories Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Phân bố việc làm theo ngành
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockChartData.jobsByCategory.map((category, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {category.category}
                      </span>
                      <span className="text-sm text-gray-600">
                        {category.count} việc
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${index === 0 ? 'bg-blue-600' :
                            index === 1 ? 'bg-green-600' :
                              index === 2 ? 'bg-purple-600' :
                                index === 3 ? 'bg-orange-600' : 'bg-gray-600'
                          }`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600 w-12 text-right">
                    {category.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Application Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Trạng thái đơn ứng tuyển
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockChartData.applicationTrends.map((trend, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {trend.status}
                      </span>
                      <span className="text-sm text-gray-600">
                        {trend.count} đơn ({trend.percentage}%)
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${trend.color === 'yellow' ? 'bg-yellow-500' :
                            trend.color === 'blue' ? 'bg-blue-500' :
                              trend.color === 'green' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        style={{ width: `${trend.percentage * 2.5}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tình trạng hệ thống
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="font-medium text-green-900">API Server</span>
                </div>
                <span className="text-green-700 text-sm">Hoạt động bình thường</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="font-medium text-green-900">Database</span>
                </div>
                <span className="text-green-700 text-sm">Kết nối ổn định</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="font-medium text-yellow-900">Email Service</span>
                </div>
                <span className="text-yellow-700 text-sm">Chậm một chút</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="font-medium text-green-900">File Storage</span>
                </div>
                <span className="text-green-700 text-sm">Hoạt động tốt</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Xuất báo cáo chi tiết</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => handleExportReport('users')}
              className="flex items-center gap-2 justify-start h-auto p-4"
            >
              <Users className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <div className="font-medium">Báo cáo người dùng</div>
                <div className="text-sm text-gray-500">Thống kê ứng viên và hoạt động</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleExportReport('jobs')}
              className="flex items-center gap-2 justify-start h-auto p-4"
            >
              <Briefcase className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <div className="font-medium">Báo cáo việc làm</div>
                <div className="text-sm text-gray-500">Tin tuyển dụng và xu hướng</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleExportReport('companies')}
              className="flex items-center gap-2 justify-start h-auto p-4"
            >
              <Building2 className="w-5 h-5 text-purple-600" />
              <div className="text-left">
                <div className="font-medium">Báo cáo công ty</div>
                <div className="text-sm text-gray-500">Nhà tuyển dụng và hiệu quả</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemReports;