import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Calendar, Clock, User, AlertCircle } from 'lucide-react';
import { apiClient } from '../../services/api.client';
import { API_ENDPOINTS } from '../../config/api.config';
import { toast } from 'sonner';

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
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      scheduled: { variant: 'outline', label: 'Đã lên lịch' },
      completed: { variant: 'secondary', label: 'Hoàn thành' },
      cancelled: { variant: 'destructive', label: 'Đã hủy' },
      no_show: { variant: 'destructive', label: 'Vắng mặt' }
    };

    const config = variants[status] || variants.scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      video: 'Video call',
      chat: 'Chat',
      phone: 'Điện thoại'
    };

    return types[type] || type;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('vi-VN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải lịch hẹn...</p>
        </div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(
    a => a.status === 'scheduled'
  );
  const pastAppointments = appointments.filter(
    a => a.status === 'completed' || a.status === 'cancelled' || a.status === 'no_show'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lịch hẹn của tôi</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý các cuộc hẹn với bác sĩ tâm lý
          </p>
        </div>
        <Button asChild>
          <a href="/user/find-doctor">
            <Calendar className="w-4 h-4 mr-2" />
            Đặt lịch mới
          </a>
        </Button>
      </div>

      {/* Upcoming Appointments */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Lịch hẹn sắp tới</h2>
        {upcomingAppointments.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Bạn chưa có lịch hẹn nào sắp tới</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {upcomingAppointments.map((appointment) => {
              const dateTime = formatDateTime(appointment.appointment_date);
              return (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">
                            {appointment.doctor_name || `Bác sĩ #${appointment.doctor_id}`}
                          </CardTitle>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <CardDescription className="flex items-center gap-4 text-base">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {getTypeBadge(appointment.appointment_type)}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{dateTime.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{dateTime.time}</span>
                      </div>
                      {appointment.notes && (
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <AlertCircle className="w-4 h-4 mt-1" />
                          <span className="text-sm">{appointment.notes}</span>
                        </div>
                      )}
                      {appointment.status === 'scheduled' && (
                        <div className="flex gap-2 mt-4">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleCancelAppointment(appointment.id)}
                          >
                            Hủy lịch hẹn
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Lịch sử</h2>
          <div className="grid gap-4">
            {pastAppointments.map((appointment) => {
              const dateTime = formatDateTime(appointment.appointment_date);
              return (
                <Card key={appointment.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">
                            {appointment.doctor_name || `Bác sĩ #${appointment.doctor_id}`}
                          </CardTitle>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {getTypeBadge(appointment.appointment_type)}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{dateTime.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{dateTime.time}</span>
                      </div>
                    </div>
                  </CardContent>
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
