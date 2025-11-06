import { useState } from 'react';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    sessionReminders: true,
    weeklyReports: false,
    
    // Privacy
    shareDataForResearch: false,
    anonymousAnalytics: true,
    showOnlineStatus: true,
    
    // Appearance
    theme: 'light',
    language: 'vi',
    fontSize: 'medium',
    
    // Accessibility
    highContrast: false,
    reduceMotion: false,
    screenReader: false
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleSelect = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Cài Đặt</h1>
          <p className="settings-subtitle">
            Quản lý tài khoản, thông báo và tùy chỉnh ứng dụng
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="settings-grid">
        {/* Notifications Section */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">🔔</div>
            <div>
              <h2 className="section-title">Thông Báo</h2>
              <p className="section-description">
                Quản lý cách bạn nhận thông báo
              </p>
            </div>
          </div>

          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Email thông báo</div>
                <div className="setting-description">
                  Nhận thông báo qua email về buổi tư vấn và tin nhắn mới
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Thông báo đẩy</div>
                <div className="setting-description">
                  Nhận thông báo đẩy trên thiết bị của bạn
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Nhắc nhở buổi tư vấn</div>
                <div className="setting-description">
                  Nhận nhắc nhở 30 phút trước buổi tư vấn
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.sessionReminders}
                  onChange={() => handleToggle('sessionReminders')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Báo cáo hàng tuần</div>
                <div className="setting-description">
                  Nhận tóm tắt tiến trình hàng tuần qua email
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.weeklyReports}
                  onChange={() => handleToggle('weeklyReports')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">🔒</div>
            <div>
              <h2 className="section-title">Quyền Riêng Tư</h2>
              <p className="section-description">
                Kiểm soát dữ liệu và quyền riêng tư của bạn
              </p>
            </div>
          </div>

          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Chia sẻ dữ liệu nghiên cứu</div>
                <div className="setting-description">
                  Cho phép dữ liệu ẩn danh được sử dụng cho nghiên cứu y khoa
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.shareDataForResearch}
                  onChange={() => handleToggle('shareDataForResearch')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Phân tích ẩn danh</div>
                <div className="setting-description">
                  Gửi dữ liệu sử dụng ẩn danh để cải thiện ứng dụng
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.anonymousAnalytics}
                  onChange={() => handleToggle('anonymousAnalytics')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Hiển thị trạng thái online</div>
                <div className="setting-description">
                  Cho phép bác sĩ thấy khi bạn đang online
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.showOnlineStatus}
                  onChange={() => handleToggle('showOnlineStatus')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="privacy-actions">
            <button className="btn btn-outline btn-sm">
              Xem chính sách bảo mật
            </button>
            <button className="btn btn-outline btn-sm">
              Tải xuống dữ liệu của tôi
            </button>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">🎨</div>
            <div>
              <h2 className="section-title">Giao Diện</h2>
              <p className="section-description">
                Tùy chỉnh giao diện ứng dụng
              </p>
            </div>
          </div>

          <div className="settings-list">
            <div className="setting-item column">
              <div className="setting-label">Chủ đề</div>
              <div className="option-group">
                <button
                  className={`option-btn ${settings.theme === 'light' ? 'active' : ''}`}
                  onClick={() => handleSelect('theme', 'light')}
                >
                  ☀️ Sáng
                </button>
                <button
                  className={`option-btn ${settings.theme === 'dark' ? 'active' : ''}`}
                  onClick={() => handleSelect('theme', 'dark')}
                >
                  🌙 Tối
                </button>
                <button
                  className={`option-btn ${settings.theme === 'auto' ? 'active' : ''}`}
                  onClick={() => handleSelect('theme', 'auto')}
                >
                  ⚙️ Tự động
                </button>
              </div>
            </div>

            <div className="setting-item column">
              <div className="setting-label">Ngôn ngữ</div>
              <select
                className="select-input"
                value={settings.language}
                onChange={(e) => handleSelect('language', e.target.value)}
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="setting-item column">
              <div className="setting-label">Cỡ chữ</div>
              <div className="option-group">
                <button
                  className={`option-btn ${settings.fontSize === 'small' ? 'active' : ''}`}
                  onClick={() => handleSelect('fontSize', 'small')}
                >
                  Nhỏ
                </button>
                <button
                  className={`option-btn ${settings.fontSize === 'medium' ? 'active' : ''}`}
                  onClick={() => handleSelect('fontSize', 'medium')}
                >
                  Trung bình
                </button>
                <button
                  className={`option-btn ${settings.fontSize === 'large' ? 'active' : ''}`}
                  onClick={() => handleSelect('fontSize', 'large')}
                >
                  Lớn
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility Section */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">♿</div>
            <div>
              <h2 className="section-title">Trợ Năng</h2>
              <p className="section-description">
                Cài đặt cho người dùng có nhu cầu đặc biệt
              </p>
            </div>
          </div>

          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Độ tương phản cao</div>
                <div className="setting-description">
                  Tăng độ tương phản màu sắc để dễ đọc hơn
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={() => handleToggle('highContrast')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Giảm chuyển động</div>
                <div className="setting-description">
                  Giảm hiệu ứng chuyển động và hoạt ảnh
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.reduceMotion}
                  onChange={() => handleToggle('reduceMotion')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Hỗ trợ đọc màn hình</div>
                <div className="setting-description">
                  Tối ưu hóa cho phần mềm đọc màn hình
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.screenReader}
                  onChange={() => handleToggle('screenReader')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-section danger-zone">
          <div className="section-header">
            <div className="section-icon">⚠️</div>
            <div>
              <h2 className="section-title">Vùng Nguy Hiểm</h2>
              <p className="section-description">
                Các hành động không thể hoàn tác
              </p>
            </div>
          </div>

          <div className="danger-actions">
            <button className="btn btn-outline btn-sm danger-btn">
              Xóa lịch sử chat
            </button>
            <button className="btn btn-outline btn-sm danger-btn">
              Hủy kích hoạt tài khoản
            </button>
            <button className="btn btn-outline btn-sm danger-btn">
              Xóa tài khoản vĩnh viễn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
