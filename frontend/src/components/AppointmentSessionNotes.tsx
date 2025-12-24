import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Save, FileText, Clock, User, Calendar, MessageSquare, Video } from 'lucide-react';
import { apiClient } from '../services/api.client';
import { toast } from 'sonner';

interface Appointment {
  id: number;
  user_id: number;
  patient_name: string;
  appointment_date: string;
  duration_minutes: number;
  status: string;
  appointment_type: 'video' | 'chat' | 'initial';
  notes: string;
  doctor_notes: string;
}

interface AppointmentSessionNotesProps {
  appointmentId: number;
  onSave?: () => void;
}

const AppointmentSessionNotes = ({ appointmentId, onSave }: AppointmentSessionNotesProps) => {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAppointment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<Appointment>(`/api/doctors/appointments/${appointmentId}`);
      setAppointment(data);
      
      // Parse existing notes if any
      if (data.doctor_notes) {
        try {
          const parsed = JSON.parse(data.doctor_notes);
          setSessionNotes(parsed.session_notes || '');
          setDiagnosis(parsed.diagnosis || '');
          setTreatment(parsed.treatment || '');
          setFollowUp(parsed.follow_up || '');
        } catch {
          setSessionNotes(data.doctor_notes);
        }
      }
    } catch (error) {
      console.error('Failed to load appointment:', error);
      toast.error('Không thể tải thông tin buổi hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!sessionNotes.trim() && !diagnosis.trim() && !treatment.trim() && !followUp.trim()) {
      toast.error('Vui lòng nhập ít nhất một trường thông tin');
      return;
    }

    try {
      setSaving(true);
      
      const notesData = {
        session_notes: sessionNotes,
        diagnosis: diagnosis,
        treatment: treatment,
        follow_up: followUp,
        saved_at: new Date().toISOString()
      };

      await apiClient.put(`/api/doctors/appointments/${appointmentId}`, {
        doctor_notes: JSON.stringify(notesData),
        status: 'completed'
      });

      toast.success('Đã lưu ghi chú buổi tư vấn');
      onSave?.();
    } catch (error) {
      console.error('Failed to save notes:', error);
      toast.error('Không thể lưu ghi chú');
    } finally {
      setSaving(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return 'Video Call';
      case 'chat':
        return 'Chat Text';
      case 'initial':
        return 'Khám đầu tiên';
      default:
        return type;
    }
  };

  if (loading || !appointment) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Appointment Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Thông tin buổi tư vấn
            </CardTitle>
            <Badge variant={appointment.status === 'completed' ? 'default' : 'secondary'}>
              {appointment.status === 'completed' ? 'Completed' : 'In Progress'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Bệnh nhân</p>
                <p className="font-medium">{appointment.patient_name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Ngày giờ</p>
                <p className="font-medium">
                  {new Date(appointment.appointment_date).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Thời lượng</p>
                <p className="font-medium">{appointment.duration_minutes} phút</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {getTypeIcon(appointment.appointment_type)}
              <div>
                <p className="text-sm text-slate-500">Hình thức</p>
                <p className="font-medium">{getTypeLabel(appointment.appointment_type)}</p>
              </div>
            </div>
          </div>

          {appointment.notes && (
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-sm text-slate-500 mb-2">Ghi chú từ bệnh nhân:</p>
              <p className="text-sm">{appointment.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Notes Form */}
      <Card>
        <CardHeader>
          <CardTitle>Ghi chú buổi tư vấn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Session Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Diễn biến buổi tư vấn <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={sessionNotes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSessionNotes(e.target.value)}
              placeholder="Detailed description of consultation progress, issues discussed..."
              className="min-h-[120px]"
            />
          </div>

          {/* Diagnosis */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Đánh giá / Chẩn đoán
            </label>
            <Textarea
              value={diagnosis}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDiagnosis(e.target.value)}
              placeholder="Đánh giá tình trạng tâm lý, chẩn đoán ban đầu (nếu có)..."
              className="min-h-[100px]"
            />
          </div>

          {/* Treatment Plan */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Phương án điều trị / Can thiệp
            </label>
            <Textarea
              value={treatment}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTreatment(e.target.value)}
              placeholder="Phương pháp điều trị, bài tập, thuốc (nếu có), lời khuyên..."
              className="min-h-[100px]"
            />
          </div>

          {/* Follow Up */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Kế hoạch theo dõi
            </label>
            <Textarea
              value={followUp}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFollowUp(e.target.value)}
              placeholder="Lịch tái khám, các bước tiếp theo, lưu ý cần theo dõi..."
              className="min-h-20"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-slate-500">
              Ghi chú sẽ được lưu vào hồ sơ bệnh án
            </p>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu ghi chú
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentSessionNotes;
