
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Calendar, Clock, User, Plus, CalendarDays, Video, MessageSquare, Phone, MoreHorizontal, XCircle } from 'lucide-react';
import VideoCall from '../../components/VideoCall';
import { STORAGE_KEYS } from '../../config/api.config';
import { apiClient } from '../../services/api.client';
import { API_ENDPOINTS } from '../../config/api.config';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface Appointment {
  id: number;
  doctor_id: number;
  doctor_name?: string;
  doctor_specialization?: string;
  appointment_type: string;
  appointment_date: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  doctor_notes?: string;
  created_at: string;
}

const UserAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState<Appointment | null>(null);

  // Get current user info from storage
  const userJson = localStorage.getItem(STORAGE_KEYS.USER);
  const currentUser = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<Appointment[]>(API_ENDPOINTS.USERS.APPOINTMENTS);
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
      toast.error('Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string; dot: string }> = {
      scheduled: {
        className: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800',
        label: 'Sắp tới',
        dot: 'bg-teal-500'
      },
      completed: {
        className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        label: 'Hoàn thành',
        dot: 'bg-slate-500'
      },
      cancelled: {
        className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800',
        label: 'Đã hủy',
        dot: 'bg-rose-500'
      },
      no_show: {
        className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
        label: 'Vắng mặt',
        dot: 'bg-orange-500'
      }
    };

    const config = variants[status] || variants.scheduled;
    return (
      <div className={cn("flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-medium", config.className)}>
        <div className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
        {config.label}
      </div>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'chat': return <MessageSquare className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      video: 'Video Call',
      chat: 'Chat tư vấn',
      phone: 'Điện thoại'
    };
    return types[type] || type;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      day: date.getDate(),
      month: date.toLocaleDateString('vi-VN', { month: 'short' }),
      fullDate: date
    };
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) return;

    try {
      await apiClient.put(`${API_ENDPOINTS.USERS.APPOINTMENTS}/${appointmentId}`, {
        status: 'cancelled'
      });
      toast.success('Đã hủy lịch hẹn');
      loadAppointments();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      toast.error('Không thể hủy lịch hẹn');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(a => a.status === 'scheduled');
  const pastAppointments = appointments.filter(a => a.status !== 'scheduled');

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
      {activeCall && currentUser && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[80vh] bg-black rounded-xl overflow-hidden shadow-2xl relative">
            <Button
              variant="ghost"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setActiveCall(null)}
            >
              <XCircle className="w-6 h-6" />
            </Button>
            <VideoCall
              roomId={activeCall.id.toString()}
              userId={currentUser.id.toString()}
              userName={currentUser.full_name || 'Patient'}
              isDoctor={false}
              onEndCall={() => setActiveCall(null)}
            />
          </div>
        </div>
      )}

      {/* Modern Minimal Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Lịch hẹn</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            Quản lý các phiên tư vấn sức khỏe của bạn
          </p>
        </div>
        <Link to="/user/find-doctor">
          <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 rounded-full px-6 transition-all hover:scale-105">
            <Plus className="w-5 h-5 mr-2" />
            Đặt lịch mới
          </Button>
        </Link>
      </div>

      {/* Upcoming Appointments Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-lg">
              <CalendarDays className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Sắp diễn ra</h2>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {upcomingAppointments.length}
            </span>
          </div>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Chưa có lịch hẹn nào</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">
              Bạn chưa có lịch hẹn nào sắp tới. Hãy đặt lịch với bác sĩ để được tư vấn.
            </p>
            <Link to="/user/find-doctor">
              <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 dark:border-teal-800 dark:text-teal-400 dark:hover:bg-teal-900/30">
                Đặt lịch ngay
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingAppointments.map((appointment) => {
              const dateTime = formatDateTime(appointment.appointment_date);
              return (
                <Card key={appointment.id} className="group overflow-hidden border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300">
                  <CardHeader className="pb-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-900 dark:text-slate-100">
                          <span className="text-xl font-bold leading-none">{dateTime.day}</span>
                          <span className="text-[10px] font-medium text-slate-500 uppercase mt-1">{dateTime.month}</span>
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                            {appointment.doctor_name || `Bác sĩ #${appointment.doctor_id}`}
                          </CardTitle>
                          <CardDescription className="text-sm text-slate-500 mt-1">
                            {appointment.doctor_specialization || 'Chuyên khoa tâm lý'}
                          </CardDescription>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400 hover:text-slate-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{dateTime.time}</span>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg">
                      {getTypeIcon(appointment.appointment_type)}
                      <span>{getTypeLabel(appointment.appointment_type)}</span>
                    </div>

                    {appointment.notes && (
                      <div className="text-sm text-slate-500 italic line-clamp-2 px-1">
                        "{appointment.notes}"
                      </div>
                    )}

                    <div className="pt-2 flex gap-3">
                      {appointment.status === 'scheduled' && appointment.appointment_type === 'video' && (
                        <Button
                          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                          onClick={() => setActiveCall(appointment)}
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Tham gia
                        </Button>
                      )}

                      <Button className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-teal-900/20 dark:hover:text-teal-300 transition-colors shadow-sm">
                        Chi tiết
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        Hủy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Appointments Section */}
      {pastAppointments.length > 0 && (
        <div className="space-y-6 pt-6">
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-slate-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Lịch sử</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastAppointments.map((appointment) => {
              const dateTime = formatDateTime(appointment.appointment_date);
              return (
                <Card key={appointment.id} className="bg-slate-50/50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-medium text-slate-700 dark:text-slate-300">
                          {appointment.doctor_name || `Bác sĩ #${appointment.doctor_id}`}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Calendar className="w-3 h-3" />
                          <span>{dateTime.date}</span>
                        </div>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAppointments;

