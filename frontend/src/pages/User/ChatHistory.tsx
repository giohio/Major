import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatHistory.css';

interface ChatSession {
  id: string;
  title: string;
  preview: string;
  date: string;
  messageCount: number;
  emotion: 'positive' | 'neutral' | 'negative';
  duration: string;
}

const ChatHistory = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with API call
  const sessions: ChatSession[] = [
    {
      id: '1',
      title: 'Buổi tư vấn về căng thẳng công việc',
      preview: 'Tôi đang cảm thấy áp lực với công việc hiện tại...',
      date: '2025-11-06',
      messageCount: 24,
      emotion: 'neutral',
      duration: '45 phút'
    },
    {
      id: '2',
      title: 'Chia sẻ về mối quan hệ gia đình',
      preview: 'Gần đây tôi có một số vấn đề với gia đình...',
      date: '2025-11-05',
      messageCount: 18,
      emotion: 'negative',
      duration: '30 phút'
    },
    {
      id: '3',
      title: 'Cảm xúc tích cực sau kỳ nghỉ',
      preview: 'Tôi cảm thấy tốt hơn rất nhiều sau chuyến đi...',
      date: '2025-11-04',
      messageCount: 12,
      emotion: 'positive',
      duration: '20 phút'
    },
    {
      id: '4',
      title: 'Thảo luận về kỹ thuật thư giãn',
      preview: 'Bạn có thể hướng dẫn tôi một số kỹ thuật...',
      date: '2025-11-03',
      messageCount: 15,
      emotion: 'neutral',
      duration: '25 phút'
    },
    {
      id: '5',
      title: 'Lo lắng về tương lai',
      preview: 'Tôi cảm thấy bất an về những gì sắp tới...',
      date: '2025-11-02',
      messageCount: 32,
      emotion: 'negative',
      duration: '50 phút'
    }
  ];

  const filteredSessions = sessions.filter(session => {
    const matchesFilter = filter === 'all' || session.emotion === filter;
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.preview.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      default: return '😐';
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'positive': return 'success';
      case 'negative': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <div className="chat-history-container">
      {/* Header */}
      <div className="chat-history-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Lịch sử hội thoại</h1>
            <p className="page-subtitle">
              Xem lại và quản lý các cuộc trò chuyện của bạn với AI tâm lý
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/user/chatbot')}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z"/>
            </svg>
            Bắt đầu chat mới
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="chat-history-controls">
        <div className="search-box">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả ({sessions.length})
          </button>
          <button
            className={`filter-tab ${filter === 'positive' ? 'active' : ''}`}
            onClick={() => setFilter('positive')}
          >
            😊 Tích cực ({sessions.filter(s => s.emotion === 'positive').length})
          </button>
          <button
            className={`filter-tab ${filter === 'neutral' ? 'active' : ''}`}
            onClick={() => setFilter('neutral')}
          >
            😐 Trung lập ({sessions.filter(s => s.emotion === 'neutral').length})
          </button>
          <button
            className={`filter-tab ${filter === 'negative' ? 'active' : ''}`}
            onClick={() => setFilter('negative')}
          >
            😔 Tiêu cực ({sessions.filter(s => s.emotion === 'negative').length})
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="chat-history-list">
        {filteredSessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">�</div>
            <h3>Không tìm thấy kết quả</h3>
            <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div 
              key={session.id} 
              className="session-card"
              onClick={() => navigate(`/user/chat/${session.id}`)}
            >
              <div className="session-emotion">
                <span className={`emotion-badge ${getEmotionColor(session.emotion)}`}>
                  {getEmotionIcon(session.emotion)}
                </span>
              </div>
              
              <div className="session-content">
                <h3 className="session-title">{session.title}</h3>
                <p className="session-preview">{session.preview}</p>
                
                <div className="session-meta">
                  <span className="session-meta-item">
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                    </svg>
                    {session.duration}
                  </span>
                  <span className="session-meta-item">
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                    </svg>
                    {session.messageCount} tin nhắn
                  </span>
                  <span className="session-meta-item">
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                    </svg>
                    {new Date(session.date).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              <button className="session-actions">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
