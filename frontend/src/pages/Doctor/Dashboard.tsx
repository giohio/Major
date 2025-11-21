import '../Page.css';

const Dashboard = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title"><span className="page-icon">🏠</span> Dashboard Bác sĩ</h1>
        <p className="page-description">Tổng quan hoạt động và bệnh nhân</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-value">24</div>
          <div className="stat-card-label">Bệnh nhân</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📅</div>
          <div className="stat-card-value">8</div>
          <div className="stat-card-label">Lịch hẹn hôm nay</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🚨</div>
          <div className="stat-card-value">3</div>
          <div className="stat-card-label">Cảnh báo mới</div>
        </div>
      </div>
      <div className="page-content">
        <div className="placeholder-card">
          <div className="placeholder-icon">🩺</div>
          <h3>Dashboard Bác sĩ</h3>
          <p>Tính năng đang được phát triển</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
