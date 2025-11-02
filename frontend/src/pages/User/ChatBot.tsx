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
      content: 'Xin chào! Tôi là AI tư vấn viên tâm lý được đào tạo theo tiêu chuẩn DSM-5. Tôi ở đây để lắng nghe và hỗ trợ bạn. Hãy chia sẻ với tôi những gì bạn đang trải qua nhé. 💙',
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      emotion: 'positive'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emotionScore, setEmotionScore] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const commonTopics = [
    { icon: '😰', text: 'Tôi đang cảm thấy lo lắng', id: 1 },
    { icon: '💼', text: 'Áp lực công việc', id: 2 },
    { icon: '😴', text: 'Vấn đề về giấc ngủ', id: 3 },
    { icon: '😢', text: 'Cảm thấy buồn và chán nản', id: 4 },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    setEmotionScore(prev => prev + score);

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
      <div className="chatbot-container">
        {/* Header */}
        <div className="chatbot-header">
          <button onClick={() => navigate('/')} className="back-btn">
            ← Quay lại
          </button>
          <div className="chatbot-info">
            <div className="ai-avatar">🤖</div>
            <div>
              <h3>AI Tư vấn viên</h3>
              <span className="status">● Đang hoạt động</span>
            </div>
          </div>
          <div className="emotion-indicator">
            <span className={`emotion-badge ${
              emotionScore >= 5 ? 'critical' : 
              emotionScore >= 3 ? 'warning' : 'good'
            }`}>
              {emotionScore >= 5 ? '🚨 Cần hỗ trợ' : 
               emotionScore >= 3 ? '⚠️ Theo dõi' : '😊 Ổn định'}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-content">
                {message.content}
              </div>
              <div className="message-time">{message.timestamp}</div>
            </div>
          ))}
          {isLoading && (
            <div className="message ai">
              <div className="message-content typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Topics */}
        <div className="quick-topics">
          {commonTopics.map((topic) => (
            <button
              key={topic.id}
              className="topic-btn"
              onClick={() => handleSendMessage(topic.text)}
            >
              <span>{topic.icon}</span>
              {topic.text}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="chatbot-input">
          <input
            type="text"
            placeholder="Chia sẻ cảm xúc của bạn..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button 
            className="send-btn" 
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
