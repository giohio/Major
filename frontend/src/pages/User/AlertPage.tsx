import { useNavigate } from 'react-router-dom';
import '../Page.css';
import './AlertPage.css';

const AlertPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page alert-page">
      <div className="alert-banner">
        <div className="alert-icon">🚨</div>
        <h1>Chúng tôi quan tâm đến bạn</h1>
        <p>Tôi nhận thấy bạn có thể đang trải qua giai đoạn khó khăn. Hãy để chúng tôi hỗ trợ bạn.</p>
      </div>

      <div className="page-content">
        <div className="alert-options">
          <div className="option-card urgent">
            <h3>🚨 Cần hỗ trợ khẩn cấp</h3>
            <p>Nếu bạn đang có suy nghĩ tự tử hoặc tự gây thương tích</p>
            <div className="hotlines">
              <a href="tel:1800xxxx" className="btn btn-primary">📞 Hotline 24/7: 1800-xxxx</a>
              <a href="tel:113" className="btn btn-danger">🚑 Khẩn cấp: 113</a>
            </div>
          </div>

          <div className="option-card">
            <h3>👩‍⚕️ Kết nối với bác sĩ</h3>
            <p>Tìm và đặt lịch với chuyên gia tâm lý phù hợp</p>
            <button 
              onClick={() => navigate('/user/find-doctor')}
              className="btn btn-primary btn-block"
            >
              Tìm bác sĩ ngay
            </button>
          </div>

          <div className="option-card">
            <h3>💬 Tiếp tục trò chuyện</h3>
            <p>Chia sẻ thêm với AI để được hỗ trợ tốt hơn</p>
            <button 
              onClick={() => navigate('/chat')}
              className="btn btn-outline btn-block"
            >
              Quay lại chat
            </button>
          </div>
        </div>

        <div className="support-resources">
          <h3>📚 Tài nguyên hỗ trợ</h3>
          <ul>
            <li>Kỹ thuật thở sâu và thư giãn</li>
            <li>Bài tập mindfulness</li>
            <li>Hướng dẫn quản lý cảm xúc</li>
            <li>Cộng đồng hỗ trợ trực tuyến</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AlertPage;
