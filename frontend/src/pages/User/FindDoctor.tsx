import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Page.css';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  experience: number;
  available: boolean;
}

const FindDoctor = () => {
  const navigate = useNavigate();
  const [doctors] = useState<Doctor[]>([
    { id: 1, name: 'Dr. Nguyễn Văn A', specialty: 'Tâm lý lâm sàng', rating: 4.8, experience: 10, available: true },
    { id: 2, name: 'Dr. Trần Thị B', specialty: 'Trị liệu CBT', rating: 4.9, experience: 8, available: true },
    { id: 3, name: 'Dr. Lê Văn C', specialty: 'Tâm lý trẻ em', rating: 4.7, experience: 12, available: false },
  ]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title"><span className="page-icon">👩‍⚕️</span> Tìm bác sĩ phù hợp</h1>
        <p className="page-description">Kết nối với chuyên gia tâm lý chuyên nghiệp</p>
      </div>

      <div className="page-content">
        <div className="grid-2">
          {doctors.map(doctor => (
            <div key={doctor.id} className="card">
              <h3>{doctor.name}</h3>
              <p><strong>Chuyên môn:</strong> {doctor.specialty}</p>
              <p><strong>Đánh giá:</strong> ⭐ {doctor.rating}/5</p>
              <p><strong>Kinh nghiệm:</strong> {doctor.experience} năm</p>
              <p><strong>Trạng thái:</strong> {doctor.available ? '✅ Có thể đặt lịch' : '⏰ Đang bận'}</p>
              <button 
                className="btn btn-primary" 
                onClick={() => navigate(`/user/book-appointment/${doctor.id}`)}
                disabled={!doctor.available}
              >
                Đặt lịch hẹn
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FindDoctor;
