import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/users', icon: '👥', label: 'Quản lý người dùng' },
    { path: '/admin/doctors', icon: '🩺', label: 'Quản lý bác sĩ' },
    { path: '/admin/subscriptions', icon: '💰', label: 'Quản lý gói & thanh toán' },
    { path: '/admin/ai-models', icon: '🧠', label: 'Quản lý mô hình AI' },
    { path: '/admin/analytics', icon: '📈', label: 'Thống kê & Logs' },
    { path: '/admin/audit', icon: '🔐', label: 'Audit & Bảo mật' },
  ];

  return (
    <aside className="sidebar sidebar-admin">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <span className="logo-icon">⚙️</span>
          <span className="logo-text">Admin Panel</span>
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

export default AdminSidebar;
