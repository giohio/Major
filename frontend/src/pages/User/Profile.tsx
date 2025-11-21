import { useState } from 'react';
import './Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'subscription'>('profile');
  
  // Mock user data - replace with real API call
  const user = {
    name: 'Nguyễn Văn A',
    email: 'user@example.com',
    phone: '0901234567',
    avatar: null,
    plan: 'Pro',
    planExpiry: '2025-12-31',
    joinedDate: '2024-01-15',
    sessionsCompleted: 24,
    moodScore: 7.5
  };

  return (
    <div className="profile-container">
      {/* Header with Avatar */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="profile-avatar" />
              ) : (
                <div className="profile-avatar-placeholder">
                  {user.name.charAt(0)}
                </div>
              )}
              <button className="profile-avatar-edit">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                </svg>
              </button>
            </div>
            <div className="profile-header-info">
              <h1 className="profile-name">{user.name}</h1>
              <p className="profile-email">{user.email}</p>
              <div className="profile-plan-badge">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                </svg>
                {user.plan} Plan
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="profile-quick-stats">
            <div className="quick-stat">
              <div className="quick-stat-icon">📅</div>
              <div className="quick-stat-details">
                <span className="quick-stat-value">{user.sessionsCompleted}</span>
                <span className="quick-stat-label">Sessions</span>
              </div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-icon">�</div>
              <div className="quick-stat-details">
                <span className="quick-stat-value">{user.moodScore}/10</span>
                <span className="quick-stat-label">Mood Score</span>
              </div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-icon">⏱️</div>
              <div className="quick-stat-details">
                <span className="quick-stat-value">{Math.floor((new Date().getTime() - new Date(user.joinedDate).getTime()) / (1000 * 60 * 60 * 24))}</span>
                <span className="quick-stat-label">Days Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="profile-tabs">
        <button 
          className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
          </svg>
          Thông tin cá nhân
        </button>
        <button 
          className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z"/>
          </svg>
          Bảo mật
        </button>
        <button 
          className={`profile-tab ${activeTab === 'subscription' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscription')}
        >
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1H0V4zm0 3v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7H0zm3 2h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1z"/>
          </svg>
          Gói dịch vụ
        </button>
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="profile-form-card">
              <h2 className="section-title">Thông tin cá nhân</h2>
              <form className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Họ và tên</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      defaultValue={user.name}
                      placeholder="Nhập họ tên đầy đủ"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      defaultValue={user.email}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      defaultValue={user.phone}
                      placeholder="0901234567"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ngày sinh</label>
                    <input 
                      type="date" 
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Địa chỉ</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="Nhập địa chỉ của bạn"
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary">Hủy</button>
                  <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="profile-section">
            <div className="profile-form-card">
              <h2 className="section-title">Đổi mật khẩu</h2>
              <form className="profile-form">
                <div className="form-group">
                  <label className="form-label">Mật khẩu hiện tại</label>
                  <input 
                    type="password" 
                    className="form-input"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mật khẩu mới</label>
                  <input 
                    type="password" 
                    className="form-input"
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Xác nhận mật khẩu mới</label>
                  <input 
                    type="password" 
                    className="form-input"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary">Hủy</button>
                  <button type="submit" className="btn btn-primary">Cập nhật mật khẩu</button>
                </div>
              </form>
            </div>

            <div className="profile-form-card" style={{ marginTop: 'var(--space-6)' }}>
              <h2 className="section-title">Xác thực hai yếu tố</h2>
              <p className="section-description">
                Tăng cường bảo mật tài khoản bằng xác thực hai yếu tố
              </p>
              <div className="security-option">
                <div className="security-option-info">
                  <div className="security-option-icon">📱</div>
                  <div>
                    <h4>Xác thực qua SMS</h4>
                    <p>Nhận mã xác thực qua tin nhắn</p>
                  </div>
                </div>
                <button className="btn btn-outline btn-sm">Kích hoạt</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="profile-section">
            <div className="subscription-current">
              <div className="subscription-card active">
                <div className="subscription-header">
                  <h3 className="subscription-plan-name">{user.plan} Plan</h3>
                  <span className="subscription-status active">Active</span>
                </div>
                <div className="subscription-body">
                  <div className="subscription-price">
                    <span className="price">99,000₫</span>
                    <span className="period">/tháng</span>
                  </div>
                  <div className="subscription-expiry">
                    Gia hạn vào: <strong>{user.planExpiry}</strong>
                  </div>
                  <ul className="subscription-features">
                    <li>✅ Trò chuyện không giới hạn</li>
                    <li>✅ Tư vấn qua voice call</li>
                    <li>✅ Theo dõi cảm xúc chi tiết</li>
                    <li>✅ Hỗ trợ ưu tiên 24/7</li>
                  </ul>
                </div>
                <div className="subscription-actions">
                  <button className="btn btn-outline btn-block">Nâng cấp gói</button>
                  <button className="btn btn-ghost btn-block">Hủy gói</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
