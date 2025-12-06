import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Calendar } from '../../components/ui/calendar';
import { Calendar as CalendarIcon, Clock, Video, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '../../services/api.client';
import { API_ENDPOINTS } from '../../config/api.config';
import { toast } from 'sonner';
import VideoCall from '../../components/VideoCall';
import { STORAGE_KEYS } from '../../config/api.config';

interface Appointment {
  id: number;
  patientName: string;
  time: string;
  type: 'video' | 'chat';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
}

const Appointments = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState<Appointment | null>(null);

  // Get current user info from storage
  const userJson = localStorage.getItem(STORAGE_KEYS.USER);
  const currentUser = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await apiClient.get<Record<string, unknown>[]>(API_ENDPOINTS.DOCTOR.APPOINTMENTS);

      const mappedAppointments: Appointment[] = response.map((apt: Record<string, unknown>) => ({
        id: Number(apt.id),
        patientName: apt.user_name ? String(apt.user_name) : 'Unknown Patient',
        time: new Date(String(apt.appointment_date)).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        type: String(apt.appointment_type) as 'video' | 'chat',
        status: String(apt.status) as 'scheduled' | 'completed' | 'cancelled' | 'no-show',
        notes: apt.notes ? String(apt.notes) : undefined
      }));

      setAppointments(mappedAppointments);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error('Không thể tải lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const todayAppointments = appointments.filter(a => a.status === 'scheduled' || a.status === 'completed');
  const scheduledCount = appointments.filter(a => a.status === 'scheduled').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="secondary">Đã đặt</Badge>;
      case 'completed':
        return <Badge className="bg-green-600">Hoàn thành</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Đã hủy</Badge>;
      case 'no-show':
        return <Badge variant="outline">Vắng mặt</Badge>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'video'
      ? <Video className="w-4 h-4 text-blue-600" />
      : <MessageSquare className="w-4 h-4 text-green-600" />;
  };

  const getTypeText = (type: string) => {
    return type === 'video' ? 'Tư vấn video' : 'Tư vấn chat';
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
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
              userName={currentUser.full_name || 'Doctor'}
              isDoctor={true}
              onEndCall={() => setActiveCall(null)}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Lịch Hẹn</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý các buổi tư vấn với bệnh nhân
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              Hôm Nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Tổng số lịch hẹn</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              Đang Chờ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledCount}</div>
            <p className="text-xs text-yellow-600 mt-1">Chưa bắt đầu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Hoàn Thành
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-green-600 mt-1">Đã xong</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Lịch</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lịch Hẹn Hôm Nay</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {date?.toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <Button>
                <CalendarIcon className="w-4 h-4 mr-2" />
                Thêm lịch hẹn
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Đang tải lịch hẹn...</div>
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Không có lịch hẹn nào trong ngày này</p>
                </div>
              ) : (
                todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {getTypeIcon(appointment.type)}
                          </div>
                          <div>
                            <div className="font-medium text-lg">{appointment.patientName}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {appointment.time} • {getTypeText(appointment.type)}
                            </div>
                          </div>
                        </div>
                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground ml-13">
                            {appointment.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(appointment.status)}
                        <div className="flex gap-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <Button
                                size="sm"
                                className="gap-1"
                                onClick={() => setActiveCall(appointment)}
                              >
                                <Video className="w-3 h-3" />
                                Bắt đầu
                              </Button>
                              <Button variant="ghost" size="sm">
                                <XCircle className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                          {appointment.status === 'completed' && (
                            <Button variant="outline" size="sm">
                              Xem ghi chú
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div >
  );
};

export default Appointments;
