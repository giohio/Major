import { useState, useRef, useEffect } from 'react'
import './Chat.css'

interface ChatProps {
  onBackToLanding: () => void;
}

function Chat({ onBackToLanding }: ChatProps) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Xin chào! Tôi là AI tư vấn viên tâm lý được đào tạo theo tiêu chuẩn DSM-5. Tôi ở đây để lắng nghe và hỗ trợ bạn. Hãy chia sẻ với tôi những gì bạn đang trải qua nhé.',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false })
    }
  ])
  
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const commonTopics = [
    { icon: '😰', text: 'Tôi đang cảm thấy lo lắng và không yên tâm', id: 1 },
    { icon: '💼', text: 'Tôi gặp áp lực trong công việc và học tập', id: 2 },
    { icon: '😴', text: 'Tôi có vấn đề về giấc ngủ và mất ngủ', id: 3 },
    { icon: '😣', text: 'Tôi cảm thấy căng thẳng và mệt mỏi', id: 4 },
    { icon: '😢', text: 'Tôi cảm thấy buồn và chán nản', id: 5 },
    { icon: '😡', text: 'Tôi khó kiểm soát cảm xúc và tâm trạng', id: 6 }
  ]

  const psychologySystemPrompt = `Bạn là một AI tư vấn viên tâm lý chuyên nghiệp được đào tạo theo tiêu chuẩn DSM-5. Nhiệm vụ của bạn là:

1. Lắng nghe và thấu hiểu những khó khăn tâm lý của người dùng
2. Đưa ra lời khuyên dựa trên các nguyên tắc tâm lý học lâm sàng
3. Hỗ trợ người dùng nhận diện và quản lý cảm xúc
4. Cung cấp các kỹ thuật thư giãn và coping skills
5. Khuyến khích tìm kiếm sự hỗ trợ chuyên nghiệp khi cần thiết

Hãy trả lời bằng tiếng Việt, thể hiện sự đồng cảm và chuyên nghiệp. Không chẩn đoán bệnh mà chỉ hỗ trợ tâm lý. Nếu phát hiện các dấu hiệu nghiêm trọng, hãy khuyến khích người dùng tìm kiếm sự giúp đỡ từ chuyên gia.`

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return
    
    const userMessage = {
      id: Date.now(),
      type: 'user' as const,
      content: inputValue.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false })
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    
    try {
      const response = await fetch('http://localhost:5000/api/llm/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          system: psychologySystemPrompt,
          model: 'gemini-2.5-flash',
          generation_config: {
            temperature: 0.8,
            max_output_tokens: 1024
          }
        })
      })
      
      const data = await response.json()
      
      if (data.ok && data.output) {
        const aiResponse = {
          id: Date.now() + 1,
          type: 'ai' as const,
          content: data.output,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false })
        }
        setMessages(prev => [...prev, aiResponse])
      } else {
        const errorResponse = {
          id: Date.now() + 1,
          type: 'ai' as const,
          content: 'Xin lỗi, tôi đang gặp một chút vấn đề kỹ thuật. Bạn có thể thử lại sau được không? Trong thời gian này, nếu bạn cần hỗ trợ khẩn cấp, hãy liên hệ hotline 1900-1234.',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false })
        }
        setMessages(prev => [...prev, errorResponse])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorResponse = {
        id: Date.now() + 1,
        type: 'ai' as const,
        content: 'Có lỗi xảy ra khi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại. Nếu vấn đề nghiêm trọng, hãy liên hệ hotline khẩn cấp 1900-1234.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false })
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleTopicClick = (topic: string) => {
    if (!isLoading) {
      setInputValue(topic)
    }
  }
  
  useEffect(() => {
    // Scroll to bottom using scrollTop for more reliable scrolling
    const timer = setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [messages])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="chat-app">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header-content">
          <div className="logo" onClick={onBackToLanding} style={{ cursor: 'pointer' }}>Grounded Conversations</div>
          <nav className="nav-menu">
            <a href="#" onClick={onBackToLanding}>Tính năng</a>
            <a href="#" onClick={onBackToLanding}>Cách hoạt động</a>
            <a href="#" onClick={onBackToLanding}>Liên hệ</a>
          </nav>
          <div className="header-buttons">
            <button className="btn-login">Đăng nhập</button>
            <button className="btn-register" onClick={onBackToLanding}>← Về trang chủ</button>
          </div>
        </div>
      </header>

      <div className="chat-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Tư Vấn Tâm Lý</h2>
            <p>AI hỗ trợ 24/7</p>
          </div>

          <div className="common-topics">
            <h3>Chủ đề phổ biến</h3>
            <div className="topics-list">
              {commonTopics.map((topic) => (
                <button
                  key={topic.id}
                  className="topic-item"
                  onClick={() => handleTopicClick(topic.text)}
                >
                  <span className="topic-icon">{topic.icon}</span>
                  <span className="topic-text">{topic.text}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="session-info">
            <h3>Phiên tư vấn</h3>
            <div className="session-details">
              <div className="session-item">
                <span className="session-dot green"></span>
                <span>Bắt đầu: 15:08:58</span>
              </div>
              <div className="session-item">
                <span className="session-dot green"></span>
                <span>{messages.length} tin nhắn</span>
              </div>
              <div className="session-item">
                <span className="session-dot green"></span>
                <span>Bảo mật tuyệt đối</span>
              </div>
            </div>
          </div>

          <div className="emergency-section">
            <h3>Khẩn cấp?</h3>
            <p>Nếu bạn có ý định tự hại, hãy liên hệ ngay:</p>
            <button className="emergency-button">
              📞 Hotline: 1900-1234
            </button>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="chat-main">
          <div className="chat-info">
            <div className="ai-avatar">
              <span className="avatar-icon">🧠</span>
            </div>
            <div className="ai-details">
              <h3>AI Tâm Lý Viên</h3>
              <span className="online-status">
                <span className="status-dot"></span>
                Đang online
              </span>
            </div>
            <div className="chat-actions">
              <button className="action-btn">⚙️</button>
              <button className="action-btn">⋯</button>
            </div>
          </div>

          <div className="messages-container" ref={messagesContainerRef}>
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}-message`}>
                {message.type === 'ai' && (
                  <div className="message-avatar">
                    <span>🧠</span>
                  </div>
                )}
                <div className="message-content">
                  <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
                  <span className="message-time">{message.timestamp}</span>
                </div>
                {message.type === 'user' && (
                  <div className="message-avatar user-avatar">
                    <span>👤</span>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="message ai-message">
                <div className="message-avatar">
                  <span>🧠</span>
                </div>
                <div className="message-content loading">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="message-time">Đang phân tích...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="message-input-container">
            <div className="message-input">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isLoading ? "AI đang phân tích và trả lời..." : "Chia sẻ cảm xúc và suy nghĩ của bạn..."}
                disabled={isLoading}
                maxLength={500}
              />
              <button 
                className="send-btn"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
              >
                {isLoading ? '⏳' : '📤'}
              </button>
            </div>
            <div className="chat-footer">
              <button className="talk-with-us">
                <span className="talk-icon">🧠</span>
                Hỗ Trợ Tâm Lý
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Chat
