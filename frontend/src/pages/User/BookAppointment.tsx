
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Calendar } from '../../components/ui/calendar';
import { Textarea } from '../../components/ui/textarea';
import { Clock, Video, MessageSquare, ChevronLeft, ArrowRight, Info, Check } from 'lucide-react';
import { apiClient } from '../../services/api.client';
import { API_ENDPOINTS } from '../../config/api.config';
import { toast } from 'sonner';
import type { Doctor, Appointment } from '../../types/api.types';
import { cn } from '../../lib/utils';

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
  const [step, setStep] = useState(1);

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
    {
      value: 'consultation',
      label: 'Video Call',
      icon: <Video className="w-5 h-5" />,
      desc: 'Tư vấn trực tuyến'
    },
    {
      value: 'initial',
      label: 'Khám đầu tiên',
      icon: <MessageSquare className="w-5 h-5" />,
      desc: 'Đánh giá ban đầu'
    },
    {
      value: 'follow_up',
      label: 'Tái khám',
      icon: <Clock className="w-5 h-5" />,
      desc: 'Theo dõi tiến trình'
    }
  ];

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !consultationType || !doctor) return;

    try {
      setSubmitting(true);

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

  if (loading || !doctor) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Đặt lịch hẹn</h1>
          <p className="text-slate-500">Hoàn tất các bước để gặp bác sĩ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Booking Steps */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Consultation Type */}
          <div className={cn("space-y-4 transition-all duration-300", step !== 1 && "opacity-60")}>
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                step >= 1 ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-500"
              )}>1</div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Hình thức tư vấn</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-11">
              {consultationTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    setConsultationType(type.value);
                    setStep(2);
                  }}
                  className={cn(
                    "relative p-4 rounded-2xl border text-left transition-all duration-200 hover:shadow-md",
                    consultationType === type.value
                      ? "border-teal-600 bg-teal-50/50 dark:bg-teal-900/10 ring-1 ring-teal-600"
                      : "border-slate-200 bg-white dark:bg-slate-900 hover:border-teal-200"
                  )}
                >
                  {consultationType === type.value && (
                    <div className="absolute top-3 right-3 text-teal-600">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors",
                    consultationType === type.value ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                  )}>
                    {type.icon}
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{type.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Date & Time */}
          <div className={cn("space-y-4 transition-all duration-300", step !== 2 && "opacity-60")}>
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                step >= 2 ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-500"
              )}>2</div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Thời gian</h3>
            </div>
            <div className="pl-11">
              <div className="flex flex-col md:flex-row gap-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex-1 border-r border-slate-100 dark:border-slate-800 pr-8">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date.getDay() === 0}
                    className="rounded-md mx-auto"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-4 flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" /> Giờ khả dụng
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        onClick={() => {
                          setSelectedTime(time);
                          setStep(3);
                        }}
                        className={cn(
                          "py-2 px-3 rounded-lg text-sm font-medium border transition-all",
                          selectedTime === time
                            ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                            : "hover:border-teal-600 hover:text-teal-600 border-slate-200 text-slate-600"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Notes & Confirm */}
          <div className={cn("space-y-4 transition-all duration-300", step !== 3 && "opacity-60")}>
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                step >= 3 ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-500"
              )}>3</div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Thông tin bổ sung</h3>
            </div>
            <div className="pl-11 space-y-4">
              <Textarea
                placeholder="Mô tả ngắn gọn vấn đề của bạn (không bắt buộc)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none min-h-[120px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-teal-500/20"
              />

              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl flex gap-3 text-sm text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                <Info className="w-5 h-5 shrink-0 text-teal-600" />
                <p>Thông tin của bạn được bảo mật tuyệt đối. Bác sĩ sẽ xem trước ghi chú này để chuẩn bị tốt nhất cho buổi tư vấn.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none overflow-hidden rounded-2xl">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                />
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">{doctor.name}</CardTitle>
                  <p className="text-sm text-slate-500">{doctor.specialty}</p>
                </div>
              </div>
            </div>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Hình thức</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {consultationType ? consultationTypes.find(t => t.value === consultationType)?.label : 'Chưa chọn'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Ngày hẹn</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {selectedDate ? selectedDate.toLocaleDateString('vi-VN') : 'Chưa chọn'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Thời gian</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{selectedTime || 'Chưa chọn'}</span>
                </div>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Tổng cộng</span>
                  <span className="text-xl font-bold text-teal-600">{formatPrice(doctor.price)}</span>
                </div>
              </div>

              <Button
                className="w-full h-12 text-base font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20"
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTime || !consultationType || submitting}
              >
                {submitting ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
                {!submitting && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>

              <p className="text-xs text-center text-slate-400">
                Bằng việc xác nhận, bạn đồng ý với điều khoản sử dụng dịch vụ của chúng tôi.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;

