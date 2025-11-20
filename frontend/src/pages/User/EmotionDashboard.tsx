import '../Page.css';

const EmotionDashboard = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title"><span className="page-icon">📈</span> Dashboard cảm xúc</h1>
        <p className="page-description">Theo dõi biểu đồ cảm xúc và xu hướng tâm trạng</p>
      </div>
      <div className="page-content">
        <div className="placeholder-card">
          <div className="placeholder-icon">📈</div>
          <h3>Biểu đồ cảm xúc</h3>
          <p>Tính năng đang được phát triển</p>
        </div>
      </div>
    </div>
  );
};

export default EmotionDashboard;
