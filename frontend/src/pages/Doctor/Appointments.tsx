import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Calendar as CalendarIcon, Clock, Video, MessageSquare, CheckCircle, XCircle, FileText, ClipboardEdit } from 'lucide-react';
import { apiClient } from '../../services/api.client';
import { API_ENDPOINTS } from '../../config/api.config';
import { toast } from 'sonner';
import VideoCall from '../../components/VideoCall';
import ChatConsultation from '../../components/ChatConsultation';
import AppointmentSessionNotes from '../../components/AppointmentSessionNotes';
import { useAuth } from '../../contexts/AuthContext';
import { getAvatarUrl } from '../../utils/avatar';

interface Appointment {
  id: number;
  patientName: string;
  patientAvatar?: string;
  time: string;
  type: 'video' | 'chat';
  status: 'pending' | 'confirmed' | 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
}

const Appointments = () => {

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState<Appointment | null>(null);
  const [activeChat, setActiveChat] = useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'scheduled' | 'completed' | 'all'>('all');
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedAppointmentForNotes, setSelectedAppointmentForNotes] = useState<number | null>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await apiClient.get<Record<string, unknown>[]>(API_ENDPOINTS.DOCTOR.APPOINTMENTS);

      const mappedAppointments: Appointment[] = response.map((apt: Record<string, unknown>) => ({
        id: Number(apt.id),
        patientName: apt.user_name ? String(apt.user_name) : 'Unknown Patient',
        patientAvatar: apt.user_avatar_url ? String(apt.user_avatar_url) : undefined,
        time: new Date(String(apt.appointment_date)).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        type: String(apt.appointment_type) as 'video' | 'chat',
        status: String(apt.status) as 'pending' | 'confirmed' | 'scheduled' | 'completed' | 'cancelled' | 'no-show',
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

  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const scheduledAppointments = appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed');
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const todayAppointments = appointments.filter(a =>
    a.status === 'pending' || a.status === 'scheduled' || a.status === 'confirmed' || a.status === 'completed'
  );

  const scheduledCount = scheduledAppointments.length;
  const pendingCount = pendingAppointments.length;
  const completedCount = completedAppointments.length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending</Badge>;
      case 'confirmed':
      case 'scheduled':
        return <Badge variant="secondary">Đã xác nhận</Badge>;
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

  const handleUpdateAppointment = async (appointmentId: number, newStatus: string) => {
    try {
      await apiClient.put(`${API_ENDPOINTS.DOCTOR.APPOINTMENTS}/${appointmentId}`, {
        status: newStatus
      });
      toast.success(`Đã ${newStatus === 'scheduled' ? 'chấp nhận' : 'từ chối'} lịch hẹn`);
      fetchAppointments(); // Reload list
    } catch (error) {
      console.error('Failed to update appointment:', error);
      toast.error('Không thể cập nhật lịch hẹn');
    }
  };

  const handleOpenNotes = (appointmentId: number) => {
    setSelectedAppointmentForNotes(appointmentId);
    setNotesDialogOpen(true);
  };

  const handleCloseNotes = () => {
    setNotesDialogOpen(false);
    setSelectedAppointmentForNotes(null);
    fetchAppointments(); // Reload to see updated notes
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

      {activeChat && currentUser && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-[80vh] bg-background rounded-xl overflow-hidden shadow-2xl">
            <ChatConsultation
              appointmentId={activeChat.id}
              patientName={activeChat.patientName}
              patientAvatar={activeChat.patientAvatar}
              doctorName={currentUser.full_name || 'Doctor'}
              doctorAvatar={currentUser.avatar_url}
              isDoctor={true}
              onClose={() => setActiveChat(null)}
              onRequestVideoCall={() => {
                setActiveChat(null);
                setActiveCall(activeChat);
              }}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              Chờ Duyệt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-yellow-600 mt-1">Cần xác nhận</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              Đã Xác Nhận
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledCount}</div>
            <p className="text-xs text-blue-600 mt-1">Sẵn sàng</p>
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

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="pending" className="gap-1">
              <Clock className="w-3 h-3" />
              Chờ duyệt
              {pendingCount > 0 && <Badge variant="secondary" className="ml-1 rounded-full px-1.5 py-0 text-xs">{pendingCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="gap-1">
              <CheckCircle className="w-3 h-3" />
              Đã xác nhận
              {scheduledCount > 0 && <Badge variant="secondary" className="ml-1 rounded-full px-1.5 py-0 text-xs">{scheduledCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-1">
              <CheckCircle className="w-3 h-3" />
              Hoàn thành
            </TabsTrigger>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Contents */}
        <TabsContent value="pending" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  Đang tải lịch hẹn...
                </div>
              </CardContent>
            </Card>
          ) : pendingAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium mb-2">Không có lịch hẹn nào</p>
                  <p className="text-sm">Chưa có lịch hẹn nào cần duyệt</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingAppointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow border-l-4" style={{
                  borderLeftColor: '#eab308'
                }}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <Avatar className="w-12 h-12 shadow-lg">
                            <AvatarImage src={getAvatarUrl(appointment.patientAvatar)} alt={appointment.patientName} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                              {appointment.patientName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
                              {getStatusBadge(appointment.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {appointment.time}
                              </div>
                              <div className="flex items-center gap-1">
                                {getTypeIcon(appointment.type)}
                                {getTypeText(appointment.type)}
                              </div>
                            </div>
                          </div>
                        </div>
                        {appointment.notes && (
                          <div className="ml-16 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-start gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          className="gap-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleUpdateAppointment(appointment.id, 'scheduled')}
                        >
                          <CheckCircle className="w-3 h-3" />
                          Chấp nhận
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleUpdateAppointment(appointment.id, 'cancelled')}
                        >
                          <XCircle className="w-3 h-3" />
                          Từ chối
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  Đang tải lịch hẹn...
                </div>
              </CardContent>
            </Card>
          ) : scheduledAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium mb-2">Không có lịch hẹn nào</p>
                  <p className="text-sm">Chưa có lịch hẹn đã xác nhận</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {scheduledAppointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow border-l-4" style={{
                  borderLeftColor: '#3b82f6'
                }}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <Avatar className="w-12 h-12 shadow-lg">
                            <AvatarImage src={getAvatarUrl(appointment.patientAvatar)} alt={appointment.patientName} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                              {appointment.patientName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
                              {getStatusBadge(appointment.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {appointment.time}
                              </div>
                              <div className="flex items-center gap-1">
                                {getTypeIcon(appointment.type)}
                                {getTypeText(appointment.type)}
                              </div>
                            </div>
                          </div>
                        </div>
                        {appointment.notes && (
                          <div className="ml-16 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-start gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {appointment.type === 'video' ? (
                          <Button
                            size="sm"
                            className="gap-1"
                            onClick={() => setActiveCall(appointment)}
                          >
                            <Video className="w-3 h-3" />
                            Video
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="gap-1 bg-green-600 hover:bg-green-700"
                            onClick={() => setActiveChat(appointment)}
                          >
                            <MessageSquare className="w-3 h-3" />
                            Chat
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleOpenNotes(appointment.id)}
                        >
                          <ClipboardEdit className="w-3 h-3" />
                          Ghi chú
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleUpdateAppointment(appointment.id, 'cancelled')}>
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  Đang tải lịch hẹn...
                </div>
              </CardContent>
            </Card>
          ) : completedAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium mb-2">Không có lịch hẹn nào</p>
                  <p className="text-sm">Chưa có lịch hẹn hoàn thành</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {completedAppointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow border-l-4" style={{
                  borderLeftColor: '#22c55e'
                }}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <Avatar className="w-12 h-12 shadow-lg">
                            <AvatarImage src={getAvatarUrl(appointment.patientAvatar)} alt={appointment.patientName} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                              {appointment.patientName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
                              {getStatusBadge(appointment.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {appointment.time}
                              </div>
                              <div className="flex items-center gap-1">
                                {getTypeIcon(appointment.type)}
                                {getTypeText(appointment.type)}
                              </div>
                            </div>
                          </div>
                        </div>
                        {appointment.notes && (
                          <div className="ml-16 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-start gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm">
                          Xem ghi chú
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  Đang tải lịch hẹn...
                </div>
              </CardContent>
            </Card>
          ) : todayAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium mb-2">Không có lịch hẹn nào</p>
                  <p className="text-sm">Chưa có lịch hẹn nào</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {todayAppointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow border-l-4" style={{
                  borderLeftColor:
                    appointment.status === 'pending' ? '#eab308' :
                      (appointment.status === 'scheduled' || appointment.status === 'confirmed') ? '#3b82f6' :
                        '#22c55e'
                }}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <Avatar className="w-12 h-12 shadow-lg">
                            <AvatarImage src={getAvatarUrl(appointment.patientAvatar)} alt={appointment.patientName} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                              {appointment.patientName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
                              {getStatusBadge(appointment.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {appointment.time}
                              </div>
                              <div className="flex items-center gap-1">
                                {getTypeIcon(appointment.type)}
                                {getTypeText(appointment.type)}
                              </div>
                            </div>
                          </div>
                        </div>
                        {appointment.notes && (
                          <div className="ml-16 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-start gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {appointment.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="gap-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleUpdateAppointment(appointment.id, 'scheduled')}
                            >
                              <CheckCircle className="w-3 h-3" />
                              Chấp nhận
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-1"
                              onClick={() => handleUpdateAppointment(appointment.id, 'cancelled')}
                            >
                              <XCircle className="w-3 h-3" />
                              Từ chối
                            </Button>
                          </>
                        )}
                        {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                          <>
                            {appointment.type === 'video' ? (
                              <Button
                                size="sm"
                                className="gap-1"
                                onClick={() => setActiveCall(appointment)}
                              >
                                <Video className="w-3 h-3" />
                                Video
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="gap-1 bg-green-600 hover:bg-green-700"
                                onClick={() => setActiveChat(appointment)}
                              >
                                <MessageSquare className="w-3 h-3" />
                                Chat
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => handleOpenNotes(appointment.id)}
                            >
                              <ClipboardEdit className="w-3 h-3" />
                              Ghi chú
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleUpdateAppointment(appointment.id, 'cancelled')}>
                              <XCircle className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                        {appointment.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenNotes(appointment.id)}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Xem ghi chú
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Session Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ghi chú buổi tư vấn</DialogTitle>
          </DialogHeader>
          {selectedAppointmentForNotes && (
            <AppointmentSessionNotes
              appointmentId={selectedAppointmentForNotes}
              onSave={handleCloseNotes}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointments;
