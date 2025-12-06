import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Send,
  Plus,
  Sparkles,
  MessageSquare,
  Menu
} from 'lucide-react';
import { apiClient } from '@/services/api.client';
import { API_ENDPOINTS } from '@/config/api.config';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ChatSession } from '@/types/api.types';

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  emotion?: 'positive' | 'neutral' | 'negative' | 'critical';
}

const ChatBot = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const commonTopics = [
    { text: 'Tôi đang cảm thấy lo lắng', icon: '😰' },
    { text: 'Áp lực công việc quá lớn', icon: '💼' },
    { text: 'Khó ngủ mấy ngày nay', icon: '🌙' },
    { text: 'Cảm thấy buồn không rõ lý do', icon: '😢' },
  ];

  const loadSessions = async () => {
    try {
      const response = await apiClient.get<{ sessions: ChatSession[] }>(`${API_ENDPOINTS.CHAT.RECENT}?limit=20`);
      setSessions(response.sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadSessionMessages = async () => {
    try {
      setIsLoading(true);
      // Note: In a real app, we would fetch messages for this session
      // For now, we'll simulate it or just clear if it's a new chat
      // const response = await apiClient.get(...)
      setMessages([]); // Placeholder
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (sessionId) {
      loadSessionMessages();
    } else {
      setMessages([]);
    }
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewChat = () => {
    navigate('/chat');
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await apiClient.post<{
        message: string;
        ai_response: string;
        emotion_analysis?: {
          risk_level: string;
        };
        alert_created?: boolean;
        session_id?: number;
      }>(API_ENDPOINTS.CHAT.SEND, {
        message: messageText,
        session_id: sessionId ? parseInt(sessionId) : undefined
      });

      // If new session created, update URL and list
      if (response.session_id && !sessionId) {
        loadSessions();
        // We don't navigate to avoid reload, just keep state
      }

      let emotion: Message['emotion'] = 'positive';
      if (response.emotion_analysis) {
        const riskLevel = response.emotion_analysis.risk_level;
        if (riskLevel === 'critical') emotion = 'critical';
        else if (riskLevel === 'high') emotion = 'negative';
        else if (riskLevel === 'medium') emotion = 'neutral';
        else emotion = 'positive';
      }

      const aiMessage: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.ai_response,
        timestamp: new Date(),
        emotion
      };

      setMessages(prev => [...prev, aiMessage]);

      if (response.emotion_analysis?.risk_level === 'critical' || response.alert_created) {
        toast.error('Phát hiện nguy cơ cao. Vui lòng tìm sự trợ giúp y tế.');
      }
    } catch (error: unknown) {
      console.error('Failed to send message:', error);
      toast.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Group sessions by date
  const groupedSessions = sessions.reduce((groups, session) => {
    const date = new Date(session.created_at).toLocaleDateString('vi-VN');
    if (!groups[date]) groups[date] = [];
    groups[date].push(session);
    return groups;
  }, {} as Record<string, ChatSession[]>);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4">
          <Button
            onClick={handleNewChat}
            className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20 border-0 h-11"
          >
            <Plus size={20} />
            <span className="font-medium">Cuộc trò chuyện mới</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
          {Object.entries(groupedSessions).map(([date, groupSessions]) => (
            <div key={date} className="mb-6">
              <h3 className="px-3 text-xs font-medium text-muted-foreground mb-2">{date}</h3>
              <div className="space-y-1">
                {groupSessions.map(session => (
                  <button
                    key={session.id}
                    onClick={() => {
                      navigate(`/chat?session=${session.id}`); // Using query param for now or just handle state
                      // For this demo, let's just load messages if we had the API
                      setIsSidebarOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-foreground/80 hover:bg-accent hover:text-accent-foreground transition-colors truncate flex items-center gap-2 group"
                  >
                    <MessageSquare size={16} className="shrink-0 text-muted-foreground group-hover:text-primary" />
                    <span className="truncate">{session.title || 'Cuộc trò chuyện mới'}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
              AI
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">MindCare AI Pro</p>
              <p className="text-xs text-muted-foreground">Gói cao cấp</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background/50 backdrop-blur-sm relative">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center p-4 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={20} />
          </Button>
          <span className="ml-2 font-semibold">MindCare AI</span>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-4 animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                <Sparkles size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Xin chào! Tôi có thể giúp gì cho bạn?</h2>
              <p className="text-muted-foreground mb-8">Tôi ở đây để lắng nghe, chia sẻ và hỗ trợ sức khỏe tinh thần của bạn.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {commonTopics.map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(topic.text)}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all duration-200 text-left group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{topic.icon}</span>
                    <span className="text-sm font-medium text-foreground/80 group-hover:text-primary">{topic.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                    message.type === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                    message.type === 'user' ? "bg-primary text-primary-foreground" : "bg-gradient-to-br from-purple-600 to-blue-600 text-white"
                  )}>
                    {message.type === 'user' ? <span className="text-xs font-bold">You</span> : <Sparkles size={14} />}
                  </div>

                  <div className={cn(
                    "max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm",
                    message.type === 'user'
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-card border border-border rounded-tl-none"
                  )}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    {message.emotion && message.emotion !== 'positive' && message.emotion !== 'neutral' && (
                      <div className="mt-2 pt-2 border-t border-white/20 flex items-center gap-2 text-xs opacity-90">
                        {message.emotion === 'critical' ? '🚨 Cần chú ý cao' : '⚠️ Cảm xúc tiêu cực'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0 text-white">
                    <Sparkles size={14} />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-tl-none px-5 py-4 shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-background via-background to-transparent">
          <div className="max-w-3xl mx-auto relative">
            <div className="relative flex items-end gap-2 bg-card border border-border shadow-lg rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Nhập tin nhắn của bạn..."
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[44px] py-3 px-3 resize-none"
                disabled={isLoading}
                autoComplete="off"
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-xl transition-all duration-200 shrink-0 mb-0.5",
                  inputValue.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Send size={18} />
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3">
              MindCare AI có thể mắc lỗi. Hãy luôn kiểm tra các thông tin quan trọng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
