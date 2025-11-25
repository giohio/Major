import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Calendar } from '../../components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Calendar as CalendarIcon, Clock, Video, MessageSquare, Star, CheckCircle, Loader2 } from 'lucide-react';
import { apiClient } from '../../services/api.client';
import { API_ENDPOINTS } from '../../config/api.config';
import { toast } from 'sonner';
import type { Doctor, Appointment } from '../../types/api.types';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [consultationType, setConsultationType] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDoctorInfo();
  }, [doctorId]);

  const loadDoctorInfo = async () => {
    if (!doctorId) {
      toast.error('Không tìm thấy thông tin bác sĩ');
      navigate('/user/find-doctor');
      return;
    }

    try {
      setLoading(true);
      const data = await apiClient.get<Doctor>(API_ENDPOINTS.DOCTOR.GET(parseInt(doctorId)));
      setDoctor(data);
    } catch (error: any) {
      console.error('Failed to load doctor info:', error);
      toast.error(error.message || 'Không thể tải thông tin bác sĩ');
      navigate('/user/find-doctor');
    } finally {
      setLoading(false);
    }
  };

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const consultationTypes = [
    { value: 'consultation', label: 'Video Call', icon: <Video className="w-4 h-4" /> },
    { value: 'initial', label: 'Khám đầu tiên', icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'follow_up', label: 'Tái khám', icon: <Clock className="w-4 h-4" /> }
  ];

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !consultationType) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!doctor) {
      toast.error('Không tìm thấy thông tin bác sĩ');
      return;
    }

    try {
      setSubmitting(true);
      
      // Combine date and time
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      await apiClient.post<{ message: string; appointment: Appointment }>(API_ENDPOINTS.USERS.APPOINTMENTS, {
        doctor_id: doctor.id,
        appointment_type: consultationType,
        appointment_date: appointmentDateTime.toISOString(),
        notes: notes || undefined
      });

      toast.success('Đặt lịch thành công!');
      navigate('/user/appointments');
    } catch (error: any) {
      console.error('Failed to create appointment:', error);
      toast.error(error.message || 'Không thể đặt lịch. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Đặt Lịch Hẹn</h1>
        <p className="text-muted-foreground mt-1">
          Chọn thời gian và hình thức tư vấn phù hợp
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor Info - Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <div className="flex flex-col items-center text-center space-y-4">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-border"
                />
                <div>
                  <CardTitle className="flex items-center justify-center gap-2">
                    {doctor.name}
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {doctor.specialty}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{doctor.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({doctor.reviews} đánh giá)
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Kinh nghiệm</span>
                  <span className="font-medium">{doctor.experience} năm</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Giá khám</span>
                  <span className="font-medium">{formatPrice(doctor.price)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Form - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Consultation Type */}
          <Card>
            <CardHeader>
              <CardTitle>Hình thức tư vấn</CardTitle>
              <CardDescription>Chọn phương thức tư vấn phù hợp với bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {consultationTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setConsultationType(type.value)}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all hover:border-primary ${
                      consultationType === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                  >
                    {type.icon}
                    <span className="font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Chọn ngày
              </CardTitle>
              <CardDescription>Chọn ngày bạn muốn đặt lịch</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Chọn giờ
              </CardTitle>
              <CardDescription>
                {selectedDate && `Thời gian khả dụng cho ${selectedDate.toLocaleDateString('vi-VN')}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 border-2 rounded-lg text-sm font-medium transition-all hover:border-primary ${
                      selectedTime === time
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Ghi chú</CardTitle>
              <CardDescription>Mô tả ngắn gọn vấn đề bạn muốn tư vấn (tùy chọn)</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Ví dụ: Tôi đang gặp khó khăn với lo âu và muốn được tư vấn về cách quản lý cảm xúc..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* Summary & Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Xác nhận đặt lịch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bác sĩ:</span>
                  <span className="font-medium">{doctor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hình thức:</span>
                  <span className="font-medium">
                    {consultationType ? consultationTypes.find(t => t.value === consultationType)?.label : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày:</span>
                  <span className="font-medium">
                    {selectedDate ? selectedDate.toLocaleDateString('vi-VN') : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giờ:</span>
                  <span className="font-medium">{selectedTime || '-'}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">Tổng chi phí:</span>
                  <span className="font-bold text-lg">{formatPrice(doctor.price)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(-1)}
                >
                  Quay lại
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTime || !consultationType}
                >
                  Xác nhận đặt lịch
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
