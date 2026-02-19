import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiClient } from '../../services/api.client';
import { API_ENDPOINTS } from '../../config/api.config';
import { toast } from 'sonner';
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

interface DashboardStats {
  patient_count: number;
  today_appointments: number;
  pending_appointments: number;
  critical_alerts: number;
  improvement_rate: number;
}

interface Appointment {
  id: number;
  patient_name: string;
  appointment_date: string;
  appointment_type: string;
  status: string;
}

interface Alert {
  id: number;
  user_id: number;
  severity: string;
  message: string;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    patient_count: 0,
    today_appointments: 0,
    pending_appointments: 0,
    critical_alerts: 0,
    improvement_rate: 0
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{
        stats: DashboardStats;
        upcoming_appointments: Appointment[];
        active_alerts: Alert[];
      }>(API_ENDPOINTS.DOCTOR.DASHBOARD);

      setStats(response.stats);
      setAppointments(response.upcoming_appointments || []);
      setAlerts(response.active_alerts || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const statsDisplay = [
    {
      title: 'Tổng bệnh nhân',
      value: stats.patient_count.toString(),
      change: '+12%',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      title: 'Lịch hẹn hôm nay',
      value: stats.today_appointments.toString(),
      change: `${stats.pending_appointments} pending`,
      icon: Calendar,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      title: 'Cảnh báo khẩn',
      value: stats.critical_alerts.toString(),
      change: 'Cần xử lý',
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950'
    },
    {
      title: 'Tỷ lệ cải thiện',
      value: `${stats.improvement_rate}%`,
      change: '+8%',
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    }
  ];

  const quickActions = [
    { label: 'Thêm bệnh nhân mới', icon: UserPlus, color: 'bg-blue-500', path: '/doctor/patients' },
    { label: 'Tạo lịch hẹn', icon: Calendar, color: 'bg-green-500', path: '/doctor/appointments' },
    { label: 'Viết báo cáo', icon: FileText, color: 'bg-purple-500', path: '/doctor/patients' },
    { label: 'Xem hoạt động', icon: Activity, color: 'bg-orange-500', path: '/doctor/dashboard' }
  ];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${Math.floor(diffHours / 24)} ngày trước`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Page Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
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
            {statsDisplay.map((stat, index) => {
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
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
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
          <CardContent className="space-y-3 pt-6">
            {appointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Không có lịch hẹn sắp tới</p>
            ) : (
              appointments.slice(0, 4).map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{appointment.patient_name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatTime(appointment.appointment_date)}
                        </span>
                        {appointment.appointment_type === 'video' ? (
                          <Video className="w-3 h-3 text-blue-500" />
                        ) : (
                          <MessageSquare className="w-3 h-3 text-green-500" />
                        )}
                        <span className="text-xs">{appointment.appointment_type === 'video' ? 'Video Call' : 'Chat'}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => navigate('/doctor/appointments')}>
                    Xem
                  </Button>
                </div>
              ))
            )}
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/doctor/appointments')}>
              Xem tất cả lịch hẹn
            </Button>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
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
          <CardContent className="space-y-3 pt-6">
            {alerts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Không có cảnh báo</p>
            ) : (
              alerts.slice(0, 3).map((alert) => (
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
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(alert.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {alert.message}
                  </p>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => navigate('/doctor/alerts')}>
                    Xem chi tiết
                  </Button>
                </div>
              ))
            )}
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/doctor/alerts')}>
              Xem tất cả cảnh báo
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
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
                  onClick={() => navigate(action.path)}
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
