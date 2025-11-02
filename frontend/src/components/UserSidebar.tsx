import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const UserSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/user/profile', icon: '👤', label: 'Trang cá nhân' },
    { path: '/user/dashboard', icon: '📈', label: 'Dashboard cảm xúc' },
    { path: '/chat', icon: '💬', label: 'Chat với AI' },
    { path: '/user/exercises', icon: '🧘‍♀️', label: 'Bài tập tự chăm sóc' },
    { path: '/user/history', icon: '📝', label: 'Lịch sử hội thoại' },
    { path: '/user/payments', icon: '🧾', label: 'Lịch sử thanh toán' },
    { path: '/user/settings', icon: '⚙️', label: 'Cài đặt' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <span className="logo-icon">🧠</span>
          <span className="logo-text">Grounded</span>
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

      <div className="sidebar-footer">
        <div className="emergency-card">
          <div className="emergency-icon">🚨</div>
          <h4>Cần hỗ trợ khẩn cấp?</h4>
          <p>Hotline 24/7</p>
          <a href="tel:1900xxxx" className="emergency-btn">
            1900-xxxx
          </a>
        </div>
      </div>
    </aside>
  );
};

export default UserSidebar;
