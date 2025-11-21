import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BookAppointment.css';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  // Mock doctor data
  const doctor = {
    id: doctorId,
    name: 'Dr. Nguyễn Văn An',
    specialty: 'Tâm lý lâm sàng',
    price: 500000,
    avatar: 'A'
  };

  const timeSlots = [
    { time: '08:00 - 09:00', available: false },
    { time: '09:00 - 10:00', available: true },
    { time: '10:00 - 11:00', available: true },
    { time: '11:00 - 12:00', available: false },
    { time: '14:00 - 15:00', available: true },
    { time: '15:00 - 16:00', available: true },
    { time: '16:00 - 17:00', available: true },
    { time: '17:00 - 18:00', available: false }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      alert('Vui lòng chọn ngày và giờ hẹn');
      return;
    }
    alert('Đã đặt lịch thành công!');
    navigate('/user/profile');
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="book-appointment-page">
      {/* Header */}
      <div className="appointment-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Quay lại
        </button>
        <div>
          <h1 className="appointment-title">Đặt Lịch Hẹn</h1>
          <p className="appointment-subtitle">
            Chọn thời gian phù hợp với bạn
          </p>
        </div>
      </div>

      {/* Doctor Info */}
      <div className="doctor-info-card">
        <div className="doctor-avatar">
          <div className="avatar-circle">{doctor.avatar}</div>
        </div>
        <div className="doctor-details">
          <h3 className="doctor-name">{doctor.name}</h3>
          <p className="doctor-specialty">{doctor.specialty}</p>
          <div className="doctor-price">
            💰 {(doctor.price / 1000).toFixed(0)}k / buổi
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="booking-form">
        {/* Date Selection */}
        <div className="form-section">
          <h3 className="section-title">Chọn Ngày</h3>
          <input
            type="date"
            className="date-input"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            min={getMinDate()}
            max={getMaxDate()}
            required
          />
        </div>

        {/* Time Selection */}
        <div className="form-section">
          <h3 className="section-title">Chọn Giờ</h3>
          <div className="time-slots">
            {timeSlots.map((slot, index) => (
              <button
                key={index}
                type="button"
                className={`time-slot ${
                  selectedTime === slot.time ? 'selected' : ''
                } ${!slot.available ? 'disabled' : ''}`}
                onClick={() => slot.available && setSelectedTime(slot.time)}
                disabled={!slot.available}
              >
                <span className="slot-time">{slot.time}</span>
                {!slot.available && (
                  <span className="slot-status">Đã đặt</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="form-section">
          <h3 className="section-title">Ghi Chú (Tùy chọn)</h3>
          <textarea
            className="notes-input"
            rows={4}
            placeholder="Mô tả vấn đề hoặc lý do bạn muốn gặp bác sĩ..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          ></textarea>
        </div>

        {/* Summary */}
        {selectedDate && selectedTime && (
          <div className="booking-summary">
            <h3 className="summary-title">Tóm Tắt Đặt Lịch</h3>
            <div className="summary-item">
              <span className="summary-label">Bác sĩ:</span>
              <span className="summary-value">{doctor.name}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Ngày:</span>
              <span className="summary-value">
                {new Date(selectedDate).toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Giờ:</span>
              <span className="summary-value">{selectedTime}</span>
            </div>
            <div className="summary-item total">
              <span className="summary-label">Tổng chi phí:</span>
              <span className="summary-value">
                {(doctor.price / 1000).toFixed(0)}k ₫
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary btn-lg btn-block">
          Xác nhận đặt lịch
        </button>
      </form>
    </div>
  );
};

export default BookAppointment;
