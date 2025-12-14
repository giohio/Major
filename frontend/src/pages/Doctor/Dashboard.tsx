import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Users, 
  Calendar, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  Video,
  MessageSquare,
  UserPlus,
  FileText,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: 'Tổng bệnh nhân',
      value: '48',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      title: 'Lịch hẹn hôm nay',
      value: '8',
      change: '3 đang chờ',
      icon: Calendar,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      title: 'Cảnh báo khẩn',
      value: '3',
      change: 'Cần xử lý',
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950'
    },
    {
      title: 'Tỷ lệ cải thiện',
      value: '76%',
      change: '+8%',
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    }
  ];

  const recentAppointments = [
    {
      id: 1,
      patient: 'Nguyễn Văn A',
      time: '09:00 AM',
      type: 'Video Call',
      status: 'upcoming',
      severity: 'medium'
    },
    {
      id: 2,
      patient: 'Trần Thị B',
      time: '10:30 AM',
      type: 'Chat',
      status: 'upcoming',
      severity: 'high'
    },
    {
      id: 3,
      patient: 'Lê Văn C',
      time: '02:00 PM',
      type: 'Video Call',
      status: 'scheduled',
      severity: 'low'
    },
    {
      id: 4,
      patient: 'Phạm Thị D',
      time: '03:30 PM',
      type: 'Chat',
      status: 'scheduled',
      severity: 'medium'
    }
  ];

  const alerts = [
    {
      id: 1,
      patient: 'Nguyễn Văn E',
      message: 'Điểm cảm xúc giảm đột ngột',
      time: '30 phút trước',
      severity: 'critical'
    },
    {
      id: 2,
      patient: 'Trần Thị F',
      message: 'Không hoàn thành bài tập 3 ngày',
      time: '2 giờ trước',
      severity: 'warning'
    },
    {
      id: 3,
      patient: 'Lê Văn G',
      message: 'Yêu cầu tư vấn khẩn cấp',
      time: '4 giờ trước',
      severity: 'critical'
    }
  ];

  const quickActions = [
    { label: 'Thêm bệnh nhân mới', icon: UserPlus, color: 'bg-blue-500' },
    { label: 'Tạo lịch hẹn', icon: Calendar, color: 'bg-green-500' },
    { label: 'Viết báo cáo', icon: FileText, color: 'bg-purple-500' },
    { label: 'Xem hoạt động', icon: Activity, color: 'bg-orange-500' }
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Page Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Dashboard Bác sĩ</h1>
              <p className="text-blue-100 mt-1 text-lg">
                Chào mừng trở lại! Đây là tổng quan hoạt động của bạn
              </p>
            </div>
          </div>
          
          {/* Quick Stats in Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-100 font-medium">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <p className="text-xs text-blue-200 mt-1">{stat.change}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Appointments */}
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-lg bg-blue-500">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              Lịch hẹn gần nhất
            </CardTitle>
            <CardDescription className="text-base">
              Các buổi tư vấn hôm nay và sắp tới
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="font-medium">{appointment.patient}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {appointment.time}
                      </span>
                      {appointment.type === 'Video Call' ? (
                        <Video className="w-3 h-3 text-blue-500" />
                      ) : (
                        <MessageSquare className="w-3 h-3 text-green-500" />
                      )}
                      <span className="text-xs">{appointment.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      appointment.severity === 'high'
                        ? 'destructive'
                        : appointment.severity === 'medium'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {appointment.severity === 'high' && 'Cao'}
                    {appointment.severity === 'medium' && 'Trung bình'}
                    {appointment.severity === 'low' && 'Thấp'}
                  </Badge>
                  <Button size="sm" variant="ghost">
                    Xem
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              Xem tất cả lịch hẹn
            </Button>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-linear-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-lg bg-red-500">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              Cảnh báo quan trọng
            </CardTitle>
            <CardDescription className="text-base">
              Các bệnh nhân cần chú ý đặc biệt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        alert.severity === 'critical' ? 'destructive' : 'default'
                      }
                    >
                      {alert.severity === 'critical' ? 'Khẩn cấp' : 'Cảnh báo'}
                    </Badge>
                    <span className="font-medium text-sm">{alert.patient}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {alert.time}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {alert.message}
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  Xem chi tiết
                </Button>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              Xem tất cả cảnh báo
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-purple-500">
              <Activity className="w-5 h-5 text-white" />
            </div>
            Thao tác nhanh
          </CardTitle>
          <CardDescription className="text-base">
            Các chức năng thường dùng của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto py-6 flex-col gap-3 hover:scale-105 transition-all hover:shadow-lg border-2"
                >
                  <div className={`p-4 rounded-xl ${action.color} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
