import '../Page.css';
const PatientList = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title"><span className="page-icon">👥</span> Danh sách bệnh nhân</h1>
        <p className="page-description">Quản lý bệnh nhân của bạn</p>
      </div>
      <div className="page-content">
        <div className="placeholder-card">
          <div className="placeholder-icon">👥</div>
          <h3>Danh sách bệnh nhân</h3>
          <p>Tính năng đang được phát triển</p>
        </div>
      </div>
    </div>
  );
};
export default PatientList;
