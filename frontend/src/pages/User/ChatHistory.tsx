import '../Page.css';

const ChatHistory = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title"><span className="page-icon">📝</span> Lịch sử hội thoại</h1>
        <p className="page-description">Xem lại các cuộc trò chuyện với AI</p>
      </div>
      <div className="page-content">
        <div className="placeholder-card">
          <div className="placeholder-icon">📝</div>
          <h3>Lịch sử chat</h3>
          <p>Tính năng đang được phát triển</p>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
