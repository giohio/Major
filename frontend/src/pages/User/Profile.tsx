import '../Page.css';

const Profile = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <span className="page-icon">👤</span>
          Trang cá nhân
        </h1>
        <p className="page-description">
          Quản lý thông tin cá nhân và tài khoản của bạn
        </p>
      </div>

      <div className="page-content">
        <div className="grid-2">
          <div className="card">
            <h3>📝 Thông tin cơ bản</h3>
            <p>Cập nhật thông tin cá nhân</p>
          </div>
          <div className="card">
            <h3>🔐 Bảo mật</h3>
            <p>Quản lý mật khẩu và xác thực</p>
          </div>
          <div className="card">
            <h3>📊 Thống kê sử dụng</h3>
            <p>Xem lịch sử hoạt động</p>
          </div>
          <div className="card">
            <h3>💰 Gói dịch vụ</h3>
            <p>Quản lý subscription</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
