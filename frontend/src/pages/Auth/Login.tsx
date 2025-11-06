import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'doctor' | 'admin'>('user');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password, role);
    
    // Redirect based on role
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'doctor') navigate('/doctor/dashboard');
    else navigate('/user/profile');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Đăng nhập</h1>
            <p className="auth-subtitle">Chào mừng bạn trở lại! ✨</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Đăng nhập với vai trò</label>
              <select 
                className="form-input"
                value={role}
                onChange={(e) => setRole(e.target.value as 'user' | 'doctor' | 'admin')}
              >
                <option value="user">Người dùng</option>
                <option value="doctor">Bác sĩ</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>

            <div className="form-footer">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <Link to="/forgot-password" className="link">Quên mật khẩu?</Link>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Đăng nhập
            </button>
          </form>

          <div className="auth-divider">
            <span>hoặc</span>
          </div>

          <div className="social-login">
            <button className="btn btn-outline btn-block">
              <span>🔍</span> Đăng nhập với Google
            </button>
            <button className="btn btn-outline btn-block">
              <span>📘</span> Đăng nhập với Facebook
            </button>
          </div>

          <div className="auth-switch">
            <span>Chưa có tài khoản?</span>
            <Link to="/register" className="link">Đăng ký ngay</Link>
          </div>

          <div className="guest-access">
            <Link to="/chat" className="link">
              <span>👤</span> Tiếp tục với tư cách khách
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
