import '../Page.css';
const Dashboard = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title"><span className="page-icon">📊</span> Admin Dashboard</h1>
        <p className="page-description">Tổng quan hệ thống</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-value">1,234</div>
          <div className="stat-card-label">Người dùng</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🩺</div>
          <div className="stat-card-value">56</div>
          <div className="stat-card-label">Bác sĩ</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-value">$12,345</div>
          <div className="stat-card-label">Doanh thu</div>
        </div>
      </div>
      <div className="page-content">
        <div className="placeholder-card">
          <div className="placeholder-icon">⚙️</div>
          <h3>Admin Dashboard</h3>
          <p>Tính năng đang được phát triển</p>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
