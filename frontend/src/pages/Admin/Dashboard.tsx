import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Users, UserCheck, DollarSign, TrendingUp, Activity, AlertCircle, BarChart3, Brain } from 'lucide-react';

interface SystemMetric {
  label: string;
  value: string | number;
  change: string;
  icon: any;
  trend: 'up' | 'down';
  color: string;
}

interface RecentActivity {
  id: number;
  type: 'user' | 'doctor' | 'payment' | 'alert';
  message: string;
  timestamp: string;
}

const Dashboard = () => {
  const metrics: SystemMetric[] = [
    {
      label: 'Tổng Người Dùng',
      value: '1,234',
      change: '+12% so tháng trước',
      icon: Users,
      trend: 'up',
      color: 'text-blue-600'
    },
    {
      label: 'Bác Sĩ Hoạt Động',
      value: '56',
      change: '+3 bác sĩ mới',
      icon: UserCheck,
      trend: 'up',
      color: 'text-green-600'
    },
    {
      label: 'Doanh Thu Tháng',
      value: '$12,345',
      change: '+18% so tháng trước',
      icon: DollarSign,
      trend: 'up',
      color: 'text-purple-600'
    },
    {
      label: 'Phiên Tư Vấn',
      value: '892',
      change: '+8% so tuần trước',
      icon: Activity,
      trend: 'up',
      color: 'text-orange-600'
    },
    {
      label: 'Gói Premium',
      value: '342',
      change: '+15% so tháng trước',
      icon: TrendingUp,
      trend: 'up',
      color: 'text-pink-600'
    },
    {
      label: 'Cảnh Báo Nghiêm Trọng',
      value: '8',
      change: 'Cần xử lý ngay',
      icon: AlertCircle,
      trend: 'down',
      color: 'text-red-600'
    },
    {
      label: 'Tỷ Lệ Hài Lòng',
      value: '94%',
      change: '+2% so tháng trước',
      icon: BarChart3,
      trend: 'up',
      color: 'text-teal-600'
    },
    {
      label: 'AI Model Uptime',
      value: '99.8%',
      change: 'Hoạt động ổn định',
      icon: Brain,
      trend: 'up',
      color: 'text-indigo-600'
    }
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: 1,
      type: 'user',
      message: 'Người dùng mới đăng ký: nguyenvana@email.com',
      timestamp: '5 phút trước'
    },
    {
      id: 2,
      type: 'doctor',
      message: 'Bác sĩ Trần Thị B đã được phê duyệt',
      timestamp: '12 phút trước'
    },
    {
      id: 3,
      type: 'payment',
      message: 'Thanh toán thành công: $299 - Gói Premium',
      timestamp: '23 phút trước'
    },
    {
      id: 4,
      type: 'alert',
      message: 'Cảnh báo: Bệnh nhân ID #123 cần chú ý',
      timestamp: '35 phút trước'
    },
    {
      id: 5,
      type: 'user',
      message: 'Người dùng mới đăng ký: lethic@email.com',
      timestamp: '1 giờ trước'
    }
  ];

  const quickStats = [
    { label: 'Người dùng mới hôm nay', value: 23 },
    { label: 'Bác sĩ chờ phê duyệt', value: 5 },
    { label: 'Phiên tư vấn hôm nay', value: 47 },
    { label: 'Doanh thu hôm nay', value: '$2,340' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'doctor':
        return <UserCheck className="w-4 h-4 text-green-600" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-purple-600" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'user':
        return <Badge variant="secondary">Người dùng</Badge>;
      case 'doctor':
        return <Badge className="bg-green-600">Bác sĩ</Badge>;
      case 'payment':
        return <Badge className="bg-purple-600">Thanh toán</Badge>;
      case 'alert':
        return <Badge variant="destructive">Cảnh báo</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Page Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-purple-100 mt-1 text-lg">
                Tổng quan hệ thống và quản lý toàn diện
              </p>
            </div>
          </div>
          
          {/* Quick Metrics in Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {metrics.slice(0, 4).map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-100 font-medium">{metric.label}</p>
                      <p className="text-2xl font-bold mt-1">{metric.value}</p>
                      <p className="text-xs text-purple-200 mt-1">{metric.change}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Additional Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.slice(4).map((metric, index) => (
          <Card key={index} className="card-hover shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs mt-1 flex items-center gap-1 ${
                metric.trend === 'up' ? 'text-green-600' : 'text-muted-foreground'
              }`}>
                {metric.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                {metric.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Thống Kê Nhanh</CardTitle>
          <CardDescription>Tổng quan hoạt động hôm nay</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => (
              <div key={index} className="p-4 rounded-lg border bg-accent/50">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500 text-white">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">Hoạt Động Gần Đây</CardTitle>
                  <CardDescription className="text-base">Các sự kiện trong hệ thống</CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Xem tất cả
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent transition-colors">
                  <div className="mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getActivityBadge(activity.type)}
                    </div>
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-linear-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500 text-white">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Trạng Thái Hệ Thống</CardTitle>
                <CardDescription className="text-base">Tình trạng các dịch vụ</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-600" />
                  <div>
                    <div className="font-medium">API Server</div>
                    <div className="text-xs text-muted-foreground">Hoạt động bình thường</div>
                  </div>
                </div>
                <Badge className="bg-green-600">Online</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-600" />
                  <div>
                    <div className="font-medium">Database</div>
                    <div className="text-xs text-muted-foreground">99.9% uptime</div>
                  </div>
                </div>
                <Badge className="bg-green-600">Healthy</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-600" />
                  <div>
                    <div className="font-medium">AI Model Service</div>
                    <div className="text-xs text-muted-foreground">Latency: 120ms</div>
                  </div>
                </div>
                <Badge className="bg-green-600">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-600" />
                  <div>
                    <div className="font-medium">Payment Gateway</div>
                    <div className="text-xs text-muted-foreground">Response time cao</div>
                  </div>
                </div>
                <Badge className="bg-yellow-600">Warning</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-600" />
                  <div>
                    <div className="font-medium">Email Service</div>
                    <div className="text-xs text-muted-foreground">Hoạt động bình thường</div>
                  </div>
                </div>
                <Badge className="bg-green-600">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500 text-white">
              <Activity className="w-5 h-5" />
            </div>
            <CardTitle className="text-xl">Hành Động Nhanh</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="h-auto py-6 flex-col gap-3 hover:scale-105 hover:shadow-lg border-2 transition-all" variant="outline">
              <div className="p-4 rounded-xl shadow-lg bg-blue-500/10">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <span className="font-semibold">Quản Lý Người Dùng</span>
            </Button>
            <Button className="h-auto py-6 flex-col gap-3 hover:scale-105 hover:shadow-lg border-2 transition-all" variant="outline">
              <div className="p-4 rounded-xl shadow-lg bg-green-500/10">
                <UserCheck className="w-6 h-6 text-green-500" />
              </div>
              <span className="font-semibold">Phê Duyệt Bác Sĩ</span>
            </Button>
            <Button className="h-auto py-6 flex-col gap-3 hover:scale-105 hover:shadow-lg border-2 transition-all" variant="outline">
              <div className="p-4 rounded-xl shadow-lg bg-purple-500/10">
                <BarChart3 className="w-6 h-6 text-purple-500" />
              </div>
              <span className="font-semibold">Xem Báo Cáo</span>
            </Button>
            <Button className="h-auto py-6 flex-col gap-3 hover:scale-105 hover:shadow-lg border-2 transition-all" variant="outline">
              <div className="p-4 rounded-xl shadow-lg bg-pink-500/10">
                <Brain className="w-6 h-6 text-pink-500" />
              </div>
              <span className="font-semibold">AI Model Config</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
