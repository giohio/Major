import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const DoctorSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/doctor/dashboard', icon: '🏠', label: 'Dashboard tổng quan' },
    { path: '/doctor/patients', icon: '👥', label: 'Danh sách bệnh nhân' },
    { path: '/doctor/appointments', icon: '🗓️', label: 'Lịch hẹn & Ca trị liệu' },
    { path: '/doctor/alerts', icon: '🚨', label: 'Cảnh báo hành vi' },
    { path: '/doctor/library', icon: '📚', label: 'Thư viện trị liệu' },
  ];

  return (
    <aside className="sidebar sidebar-doctor">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <span className="logo-icon">🩺</span>
          <span className="logo-text">Doctor Portal</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default DoctorSidebar;
