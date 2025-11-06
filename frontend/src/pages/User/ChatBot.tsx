import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatBot.css';

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  emotion?: 'positive' | 'neutral' | 'negative' | 'critical';
}

const ChatBot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: 'Xin chào! Tôi là AI tâm lý học của MindCare. Tôi ở đây để lắng nghe và hỗ trợ bạn. Hôm nay bạn cảm thấy thế nào?',
      timestamp: '18:34',
      emotion: 'positive'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const [emotionScore, setEmotionScore] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const commonTopics = [
    { icon: '😰', text: 'Tôi đang cảm thấy lo lắng', id: 1 },
    { icon: '💼', text: 'Áp lực công việc', id: 2 },
    { icon: '😴', text: 'Vấn đề về giấc ngủ', id: 3 },
    { icon: '😢', text: 'Cảm thấy buồn và chán nản', id: 4 },
  ];

  useEffect(() => {
    // Scroll only the messages container, not the whole page
    const messagesContainer = messagesEndRef.current?.closest('.chatbot-messages');
    if (messagesContainer && messagesEndRef.current) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  const analyzeEmotion = (text: string): { score: number; emotion: Message['emotion'] } => {
    // Simple emotion analysis (replace with real API)
    const negativeWords = ['buồn', 'lo lắng', 'stress', 'mệt mỏi', 'tự tử', 'chết', 'không muốn sống'];
    const score = negativeWords.filter(word => text.toLowerCase().includes(word)).length;
    
    if (score >= 3) return { score, emotion: 'critical' };
    if (score >= 2) return { score, emotion: 'negative' };
    if (score >= 1) return { score, emotion: 'neutral' };
    return { score, emotion: 'positive' };
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString('vi-VN')
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Analyze emotion
    const { score, emotion } = analyzeEmotion(messageText);
    // setEmotionScore(prev => prev + score);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content: score >= 3 
          ? '🚨 Tôi nhận thấy bạn đang trải qua giai đoạn khó khăn. Tôi nghĩ bạn nên được hỗ trợ từ chuyên gia y tế. Bạn có muốn tôi giúp kết nối với bác sĩ không?'
          : 'Tôi hiểu bạn đang trải qua. Hãy kể cho tôi nghe thêm về cảm giác của bạn...',
        timestamp: new Date().toLocaleTimeString('vi-VN'),
        emotion
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);

      // Show alert if critical
      if (score >= 3) {
        setTimeout(() => {
          const shouldNavigate = window.confirm('Tôi phát hiện bạn có nguy cơ cao. Bạn có muốn xem danh sách bác sĩ không?');
          if (shouldNavigate) {
            navigate('/user/alert');
          }
        }, 1000);
      }
    }, 1500);
  };

  return (
    <div className="chatbot-page">
      {/* Header */}
      <div className="chatbot-page-header">
        <div className="container">
          <div className="header-content-chat">
            <h2 className="logo-chat">MindCare AI</h2>
            <div className="header-right">
              <span className="online-status">🟢 AI đang online</span>
              <button onClick={() => navigate('/user/dashboard')} className="btn-header-link">Dashboard</button>
              <button onClick={() => navigate('/')} className="btn-header-primary">Hồ sơ</button>
            </div>
          </div>
        </div>
      </div>

      <div className="chatbot-main-container">
        <div className="container">
          <div className="chatbot-layout">
            {/* Sidebar Left - Conversations */}
            <div className="chatbot-sidebar-left">
              <div className="sidebar-left-header">
                <h3>Đoạn chat</h3>
              </div>
              <div className="conversations-list">
                <div className="conversation-item active">
                  <div className="conversation-avatar">🛡️</div>
                  <div className="conversation-info">
                    <p className="conversation-name">AI Tâm lý học</p>
                    <p className="conversation-preview">Tôi hiểu bạn đang trải qua...</p>
                  </div>
                  <span className="conversation-time">18:34</span>
                </div>
                <div className="conversation-item">
                  <div className="conversation-avatar">👨‍⚕️</div>
                  <div className="conversation-info">
                    <p className="conversation-name">Bác sĩ Nguyễn</p>
                    <p className="conversation-preview">Hẹn gặp bạn vào thứ 5...</p>
                  </div>
                  <span className="conversation-time">Hôm qua</span>
                </div>
                <div className="conversation-item">
                  <div className="conversation-avatar">💊</div>
                  <div className="conversation-info">
                    <p className="conversation-name">Hỗ trợ y tế</p>
                    <p className="conversation-preview">Lịch uống thuốc của bạn</p>
                  </div>
                  <span className="conversation-time">2 ngày</span>
                </div>
              </div>
            </div>

            {/* Chat Area - Center */}
            <div className="chatbot-chat-area">
              <div className="chat-header">
                <div className="ai-profile">
                  <div className="ai-avatar-circle">🛡️</div>
                  <div>
                    <h3>AI Tâm lý học</h3>
                    <span className="ai-status">Đang online • Phản hồi tức thì</span>
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="icon-btn">📞</button>
                  <button className="icon-btn">📹</button>
                </div>
              </div>

              {/* Messages */}
              <div className="chatbot-messages">
                {messages.map((message) => (
                  <div key={message.id} className={`message ${message.type}`}>
                    {message.type === 'ai' && <div className="message-avatar">🛡️</div>}
                    <div className="message-bubble">
                      <div className="message-content">{message.content}</div>
                      <div className="message-time">{message.timestamp}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message ai">
                    <div className="message-avatar">🛡️</div>
                    <div className="message-bubble">
                      <div className="message-content typing">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Topics */}
              <div className="quick-topics">
                <div className="topics-label">Phản hồi nhanh:</div>
                {commonTopics.map((topic) => (
                  <button
                    key={topic.id}
                    className="topic-btn"
                    onClick={() => handleSendMessage(topic.text)}
                  >
                    {topic.text}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="chatbot-input">
                <input
                  type="text"
                  placeholder="Nhập tin nhắn của bạn..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  className="send-btn" 
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                >
                  ✈️
                </button>
              </div>
            </div>

            {/* Sidebar - Right */}
            <div className="chatbot-sidebar">
              {/* Emotion Status Card */}
              <div className="sidebar-card">
                <h3>Trạng thái cảm xúc</h3>
                <div className="emotion-levels">
                  <div className="emotion-dots">
                    <span className="dot active"></span>
                    <span className="dot active"></span>
                    <span className="dot active"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                  <span className="emotion-label">Mức độ tích cực</span>
                </div>
                <div className="emotion-status-box">
                  Bình thường
                </div>
              </div>

              {/* Session Info Card */}
              <div className="sidebar-card">
                <h3>Phiên trò chuyện</h3>
                <div className="session-info">
                  <div className="info-row">
                    <span>Thời gian</span>
                    <strong>15 phút</strong>
                  </div>
                  <div className="info-row">
                    <span>Tin nhắn</span>
                    <strong>{messages.length}</strong>
                  </div>
                  <div className="info-row">
                    <span>Trạng thái</span>
                    <strong className="status-active">Đang hoạt động</strong>
                  </div>
                </div>
              </div>

              {/* Emergency Support Card */}
              <div className="sidebar-card emergency-card">
                <h3>Hỗ trợ khẩn cấp</h3>
                <p>Nếu bạn đang có ý định tự hại, hãy liên hệ ngay:</p>
                <button className="emergency-btn">
                  📞 Gọi hotline: 1900 1234
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Talk with Us Button */}
      <button 
        className="floating-talk-btn"
        onClick={() => handleSendMessage()}
      >
        Talk with Us
      </button>
    </div>
  );
};

export default ChatBot;
