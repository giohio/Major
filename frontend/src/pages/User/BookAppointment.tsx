import { useParams, useNavigate } from 'react-router-dom';
import '../Page.css';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Đã đặt lịch thành công!');
    navigate('/user/profile');
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title"><span className="page-icon">📅</span> Đặt lịch hẹn</h1>
        <p className="page-description">Chọn thời gian phù hợp với bạn (Bác sĩ #{doctorId})</p>
      </div>

      <div className="page-content">
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Ngày hẹn</label>
            <input type="date" className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Giờ hẹn</label>
            <select className="form-input" required>
              <option>09:00 - 10:00</option>
              <option>10:00 - 11:00</option>
              <option>14:00 - 15:00</option>
              <option>15:00 - 16:00</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Ghi chú</label>
            <textarea className="form-input" rows={4} placeholder="Mô tả vấn đề của bạn..."></textarea>
          </div>
          <button type="submit" className="btn btn-primary btn-block">Xác nhận đặt lịch</button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
