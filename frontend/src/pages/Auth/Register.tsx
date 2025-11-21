import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }

    // Mock registration
    login(formData.email, formData.password, 'user');
    navigate('/user/profile');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Đăng ký tài khoản</h1>
            <p className="auth-subtitle">Bắt đầu hành trình chăm sóc sức khỏe tâm thần 🌱</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Họ và tên</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Nguyễn Văn A"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-footer">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>Tôi đồng ý với <Link to="/terms" className="link">Điều khoản sử dụng</Link></span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Tạo tài khoản
            </button>
          </form>

          <div className="auth-divider">
            <span>hoặc</span>
          </div>

          <div className="social-login">
            <button className="btn btn-outline btn-block">
              <span>🔍</span> Đăng ký với Google
            </button>
            <button className="btn btn-outline btn-block">
              <span>📘</span> Đăng ký với Facebook
            </button>
          </div>

          <div className="auth-switch">
            <span>Đã có tài khoản?</span>
            <Link to="/login" className="link">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
