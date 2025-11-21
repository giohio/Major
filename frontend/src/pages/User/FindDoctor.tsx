import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FindDoctor.css';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: number;
  available: boolean;
  nextSlot?: string;
  price: number;
  languages: string[];
  verified: boolean;
}

const FindDoctor = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');

  const [doctors] = useState<Doctor[]>([
    {
      id: 1,
      name: 'Dr. Nguyễn Văn An',
      specialty: 'Tâm lý lâm sàng',
      rating: 4.8,
      reviews: 127,
      experience: 10,
      available: true,
      nextSlot: 'Hôm nay, 14:00',
      price: 500000,
      languages: ['Tiếng Việt', 'English'],
      verified: true
    },
    {
      id: 2,
      name: 'Dr. Trần Thị Bình',
      specialty: 'Trị liệu CBT',
      rating: 4.9,
      reviews: 203,
      experience: 8,
      available: true,
      nextSlot: 'Ngày mai, 09:00',
      price: 600000,
      languages: ['Tiếng Việt'],
      verified: true
    },
    {
      id: 3,
      name: 'Dr. Lê Văn Cường',
      specialty: 'Tâm lý trẻ em',
      rating: 4.7,
      reviews: 89,
      experience: 12,
      available: false,
      nextSlot: '12/01, 15:00',
      price: 550000,
      languages: ['Tiếng Việt', 'English'],
      verified: true
    },
    {
      id: 4,
      name: 'Dr. Phạm Mai Dung',
      specialty: 'Tâm lý gia đình',
      rating: 4.9,
      reviews: 156,
      experience: 15,
      available: true,
      nextSlot: 'Hôm nay, 16:30',
      price: 700000,
      languages: ['Tiếng Việt', 'English', '中文'],
      verified: true
    },
    {
      id: 5,
      name: 'Dr. Hoàng Minh Đức',
      specialty: 'Lo âu & Trầm cảm',
      rating: 4.8,
      reviews: 142,
      experience: 9,
      available: true,
      nextSlot: 'Ngày mai, 10:30',
      price: 580000,
      languages: ['Tiếng Việt'],
      verified: true
    },
    {
      id: 6,
      name: 'Dr. Vũ Thu Hằng',
      specialty: 'Mindfulness & Thiền',
      rating: 4.6,
      reviews: 78,
      experience: 7,
      available: true,
      nextSlot: 'Hôm nay, 17:00',
      price: 450000,
      languages: ['Tiếng Việt', 'English'],
      verified: false
    }
  ]);

  const specialties = [
    'Tất cả',
    'Tâm lý lâm sàng',
    'Trị liệu CBT',
    'Tâm lý trẻ em',
    'Tâm lý gia đình',
    'Lo âu & Trầm cảm',
    'Mindfulness & Thiền'
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
    const matchesPrice =
      priceRange === 'all' ||
      (priceRange === 'low' && doctor.price < 500000) ||
      (priceRange === 'medium' && doctor.price >= 500000 && doctor.price < 600000) ||
      (priceRange === 'high' && doctor.price >= 600000);

    return matchesSearch && matchesSpecialty && matchesPrice;
  });

  return (
    <div className="find-doctor-page">
      {/* Header */}
      <div className="doctor-header">
        <div>
          <h1 className="doctor-title">Tìm Bác Sĩ Phù Hợp</h1>
          <p className="doctor-subtitle">
            Kết nối với {doctors.length}+ chuyên gia tâm lý chuyên nghiệp
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm bác sĩ, chuyên môn..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-row">
          <select
            className="filter-select"
            value={selectedSpecialty}
            onChange={e => setSelectedSpecialty(e.target.value)}
          >
            <option value="all">Tất cả chuyên môn</option>
            {specialties.slice(1).map(specialty => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={priceRange}
            onChange={e => setPriceRange(e.target.value)}
          >
            <option value="all">Tất cả mức giá</option>
            <option value="low">&lt; 500k</option>
            <option value="medium">500k - 600k</option>
            <option value="high">&gt; 600k</option>
          </select>
        </div>
      </div>

      {/* Doctor Cards */}
      <div className="doctors-grid">
        {filteredDoctors.map(doctor => (
          <div key={doctor.id} className="doctor-card">
            <div className="doctor-avatar">
              <div className="avatar-placeholder">
                {doctor.name.split(' ').slice(-1)[0].charAt(0)}
              </div>
              {doctor.verified && (
                <span className="verified-badge" title="Đã xác minh">
                  ✓
                </span>
              )}
            </div>

            <div className="doctor-info">
              <h3 className="doctor-name">{doctor.name}</h3>
              <p className="doctor-specialty">{doctor.specialty}</p>

              <div className="doctor-rating">
                <span className="rating-stars">⭐ {doctor.rating}</span>
                <span className="rating-reviews">({doctor.reviews} đánh giá)</span>
              </div>

              <div className="doctor-details">
                <div className="detail-item">
                  <span className="detail-icon">💼</span>
                  <span>{doctor.experience} năm kinh nghiệm</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">💰</span>
                  <span>{(doctor.price / 1000).toFixed(0)}k / buổi</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🌐</span>
                  <span>{doctor.languages.join(', ')}</span>
                </div>
              </div>

              {doctor.available && doctor.nextSlot && (
                <div className="next-slot">
                  <span className="slot-icon">📅</span>
                  <span>Lịch trống: {doctor.nextSlot}</span>
                </div>
              )}

              <button
                className={`btn ${doctor.available ? 'btn-primary' : 'btn-outline'} btn-block`}
                onClick={() => navigate(`/user/book-appointment/${doctor.id}`)}
                disabled={!doctor.available}
              >
                {doctor.available ? 'Đặt lịch ngay' : 'Không có lịch trống'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Không tìm thấy bác sĩ</h3>
          <p>Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      )}
    </div>
  );
};

export default FindDoctor;
