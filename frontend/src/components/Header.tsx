import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-text-mindcare">MindCare AI</span>
          </Link>

          <nav className="nav-links">
            <Link to="/" className="nav-link">Trang chủ</Link>
<<<<<<< HEAD
            <Link to="/#features" className="nav-link">Dịch vụ</Link>
            <Link to="/#how-it-works" className="nav-link">Về chúng tôi</Link>
=======
            <Link to="/plans" className="nav-link">Dịch vụ</Link>
            <Link to="/about" className="nav-link">Về chúng tôi</Link>
>>>>>>> 89f2b86b3ec12af45c68d1d95aaa12497dd62e81
            <Link to="/contact" className="nav-link">Liên hệ</Link>
          </nav>

          <div className="header-actions">
            {user ? (
              <>
                <Link 
                  to={
                    user.role === 'admin' ? '/admin/dashboard' :
                    user.role === 'doctor' ? '/doctor/dashboard' :
                    '/user/profile'
                  } 
                  className="btn btn-ghost"
                >
                  <span>👤</span>
                  {user.name}
                </Link>
                <button onClick={handleLogout} className="btn btn-outline-teal">
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">Đăng nhập</Link>
<<<<<<< HEAD
                <Link to="/register" className="btn btn-primary-teal">Đăng ký cho Bác sĩ</Link>
=======
                <Link to="/register" className="btn btn-primary-teal">Dành cho Bác sĩ</Link>
>>>>>>> 89f2b86b3ec12af45c68d1d95aaa12497dd62e81
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
