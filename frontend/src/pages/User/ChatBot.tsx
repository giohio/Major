import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Send,
  Plus,
  Sparkles,
  MessageSquare,
  Menu,
  Trash2
} from 'lucide-react';
import { AudioRecorder } from '@/components/Chat/AudioRecorder';
import { apiClient } from '@/services/api.client';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/config/api.config';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ChatSession } from '@/types/api.types';

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  emotion?: 'positive' | 'neutral' | 'negative' | 'critical';
  isLoading?: boolean;
}

interface SuggestedQuestion {
  intent: string;
  question: string;
}

const ChatBot = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSendingAudio, setIsSendingAudio] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const commonTopics = [
    { text: 'I am feeling anxious', icon: '😰' },
    { text: 'Áp lực công việc quá lớn', icon: '💼' },
    { text: 'Khó ngủ mấy ngày nay', icon: '🌙' },
    { text: 'Cảm thấy buồn không rõ lý do', icon: '😢' },
  ];

  const loadSessions = async () => {
    console.log('[ChatBot] Loading sessions...');
    const start = performance.now();
    try {
      // Only load 10 most recent sessions for faster initial load
      const response = await apiClient.get<{ sessions: ChatSession[] }>(`${API_ENDPOINTS.CHAT.RECENT}?limit=10`);
      console.log(`[ChatBot] Sessions loaded in ${(performance.now() - start).toFixed(0)}ms`);
      setSessions(response.sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadSessionMessages = async (sid: string, append: boolean = false) => {
    console.log(`[ChatBot] Loading messages for session ${sid}, append=${append}`);
    const start = performance.now();
    try {
      if (!append) {
        setIsLoading(true);
        setSuggestedQuestions([]); // Clear suggestions when loading old session
      } else {
        setIsLoadingMore(true);
      }

      const skip = append ? messages.length : 0;
      // Load only 20 messages initially for faster loading
      const limit = append ? 50 : 20;
      const response = await apiClient.get<{ messages: any[] }>(
        `${API_ENDPOINTS.CHAT.SESSION(parseInt(sid))}?limit=${limit}&skip=${skip}`
      );

      console.log(`[ChatBot] Messages loaded in ${(performance.now() - start).toFixed(0)}ms, count=${response.messages.length}`);

      // Convert to Message format
      const loadedMessages: Message[] = response.messages.map((msg, idx) => ({
        id: skip + idx,
        type: msg.role === 'user' ? 'user' : 'ai',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        emotion: msg.emotion_detected ?
          (msg.emotion_detected === 'critical' ? 'critical' :
            msg.emotion_detected === 'negative' ? 'negative' :
              msg.emotion_detected === 'neutral' ? 'neutral' : 'positive') :
          'neutral'
      }));

      setHasMoreMessages(loadedMessages.length === limit);

      if (append) {
        setMessages(prev => [...loadedMessages, ...prev]);
      } else {
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Không thể tải tin nhắn');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    console.log('[ChatBot] useEffect[]: Loading sessions on mount');
    loadSessions();
  }, []);

  useEffect(() => {
    console.log('[ChatBot] useEffect[sessionId]: sessionId changed =', sessionId);

    if (sessionId) {
      loadSessionMessages(sessionId);
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
    setSuggestedQuestions([]);
    setIsSidebarOpen(false);
  };

  const handleDeleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering session click

    if (!confirm('Bạn có chắc muốn xóa cuộc trò chuyện này?')) {
      return;
    }

    try {
      await apiClient.delete(API_ENDPOINTS.CHAT.DELETE_SESSION(sessionId));
      toast.success('Đã xóa cuộc trò chuyện');

      // Reload sessions list
      loadSessions();

      // If we're viewing the deleted session, go to new chat
      if (sessionId.toString() === new URLSearchParams(window.location.search).get('session')) {
        handleNewChat();
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast.error('Không thể xóa cuộc trò chuyện');
    }
  };

  const handleSendMessage = async (text?: string) => {
    console.log('[ChatBot] handleSendMessage called', { text, inputValue, isLoading });
    const messageText = text || inputValue.trim();
    if (!messageText) {
      console.log('[ChatBot] Empty message, returning');
      return;
    }
    if (isLoading) {
      console.log('[ChatBot] Already loading, returning');
      return;
    }

    // Clear suggested questions when sending new message
    setSuggestedQuestions([]);

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    console.log('[ChatBot] Optimistic update:', userMessage);
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      console.log('[ChatBot] Sending API request to', API_ENDPOINTS.CHAT.SEND);
      const response = await apiClient.post<{
        message: string;
        ai_response: string;
        emotion_analysis?: {
          risk_level: string;
        };
        alert_created?: boolean;
        session_id?: number;
        suggested_questions?: SuggestedQuestion[];
      }>(API_ENDPOINTS.CHAT.SEND, {
        message: messageText,
        session_id: sessionId ? parseInt(sessionId) : undefined
      });

      console.log('[ChatBot] API Response:', response);

      // If new session created, update URL and list
      if (response.session_id && !sessionId) {
        console.log('[ChatBot] New session created, updating URL to session', response.session_id);
        navigate(`/chat?session=${response.session_id}`, { replace: true });
        loadSessions();
      }

      // Update suggested questions
      if (response.suggested_questions && response.suggested_questions.length > 0) {
        setSuggestedQuestions(response.suggested_questions);
      } else {
        setSuggestedQuestions([]);
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
      console.error('[ChatBot] Failed to send message:', error);

      // Better error handling
      let errorMessage = 'Không thể gửi tin nhắn. Vui lòng thử lại.';

      if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
          console.error('[ChatBot] Error message:', error.message);
        }
        if ('error' in error && typeof error.error === 'string') {
          errorMessage = error.error;
          console.error('[ChatBot] Error detail:', error.error);
        }
        // Log full error object for debugging
        console.error('[ChatBot] Full error object:', JSON.stringify(error, null, 2));
      }

      toast.error(errorMessage);
    } finally {
      console.log('[ChatBot] Finished sending, isLoading = false');
      setIsLoading(false);
    }
  };

  const handleSendAudio = async (audioBlob: Blob) => {
    console.log('[ChatBot] ===== handleSendAudio START =====');
    console.log('[ChatBot] audioBlob:', audioBlob);
    console.log('[ChatBot] audioBlob size:', audioBlob.size);
    console.log('[ChatBot] isLoading:', isLoading, 'isSendingAudio:', isSendingAudio);
    
    if (isLoading || isSendingAudio) {
      console.log('[ChatBot] Already processing, returning');
      return;
    }

    setIsSendingAudio(true);
    setIsLoading(true); // Show loading indicator

    try {
      // Create FormData
      console.log('[ChatBot] Creating FormData...');
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      if (sessionId) {
        formData.append('session_id', sessionId);
      }
      console.log('[ChatBot] FormData created, sessionId:', sessionId);

      // Add AI loading message only
      const tempAiMessage: Message = {
        id: Date.now(),
        content: '',
        type: 'ai',
        timestamp: new Date(),
        isLoading: true,
      };
      setMessages(prev => [...prev, tempAiMessage]);

      console.log('[ChatBot] Sending audio to API');
      
      // Use fetch directly for FormData upload (apiClient.post converts to JSON)
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const url = `${import.meta.env.VITE_API_BASE_URL}/api/chat/send-audio`;
      
      // Debug logs
      console.log('[DEBUG] Request URL:', url);
      console.log('[DEBUG] Token exists:', !!token);
      console.log('[DEBUG] Token preview:', token?.substring(0, 20) + '...');
      console.log('[DEBUG] FormData size:', formData.has('audio') ? 'has audio' : 'no audio');
      
      const fetchResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData  // Don't set Content-Type, browser will set it with boundary
      });
      
      console.log('[DEBUG] Response status:', fetchResponse.status);
      console.log('[DEBUG] Response ok:', fetchResponse.ok);
      console.log('[DEBUG] Response headers:', Object.fromEntries(fetchResponse.headers.entries()));
      
      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${fetchResponse.status}`);
      }
      
      const response = await fetchResponse.json() as {
        message: string;
        ai_response: string;
        emotion_analysis?: { risk_level: string };
        alert_created?: boolean;
        session_id?: number;
        suggested_questions?: SuggestedQuestion[];
        audio_metadata?: {
          transcription: string;
          emotion_confidence: number;
        };
      };

      console.log('[ChatBot] Audio API Response:', response);

      // Get transcription and AI response
      const transcription = response.audio_metadata?.transcription || response.message;
      const aiResponse = response.ai_response;
      
      // Remove loading message and add both user + AI messages
      setMessages(prev => {
        // Remove loading message (last item)
        const withoutLoading = prev.filter(msg => !msg.isLoading);
        
        // Add user message with transcription
        const userMessage: Message = {
          id: Date.now(),
          content: transcription,
          type: 'user',
          timestamp: new Date(),
        };
        
        // Add AI response message
        const aiMessage: Message = {
          id: Date.now() + 1,
          content: aiResponse,
          type: 'ai',
          timestamp: new Date(),
        };
        
        return [...withoutLoading, userMessage, aiMessage];
      });

      // If new session created, update URL
      if (response.session_id && !sessionId) {
        navigate(`/chat?session=${response.session_id}`, { replace: true });
        loadSessions();
      }

      // Add user message (transcribed)
      const userMessage: Message = {
        id: Date.now(),
        type: 'user',
        content: response.audio_metadata?.transcription || '[Audio message]',
        timestamp: new Date()
      };

      // Add AI response
      let emotion: Message['emotion'] = 'positive';
      if (response.emotion_analysis) {
        const riskLevel = response.emotion_analysis.risk_level;
        if (riskLevel === 'critical') emotion = 'critical';
        else if (riskLevel === 'high') emotion = 'negative';
        else if (riskLevel === 'medium') emotion = 'neutral';
      }

      const aiMessage: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.ai_response,
        timestamp: new Date(),
        emotion
      };

      setMessages(prev => [...prev, userMessage, aiMessage]);

      // Update suggested questions
      if (response.suggested_questions?.length) {
        setSuggestedQuestions(response.suggested_questions);
      }

      toast.success('Audio message sent!');

      if (response.emotion_analysis?.risk_level === 'critical' || response.alert_created) {
        toast.error('Phát hiện nguy cơ cao. Vui lòng tìm sự trợ giúp y tế.');
      }
    } catch (error: any) {
      console.error('[ChatBot] Failed to send audio:', error);
      console.error('[ChatBot] Error details:', {
        message: error?.message,
        status: error?.status,
        data: error?.data,
        full: error
      });
      
      // Remove loading messages on error
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      const errorMessage = error?.message || error?.data?.error || 'Không thể gửi audio. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setIsSendingAudio(false);
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
                  <div
                    key={session.id}
                    className="group relative"
                  >
                    <button
                      onClick={() => {
                        navigate(`/chat?session=${session.id}`);
                        setIsSidebarOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-foreground/80 hover:bg-accent hover:text-accent-foreground transition-colors truncate flex items-center gap-2"
                    >
                      <MessageSquare size={16} className="shrink-0 text-muted-foreground group-hover:text-primary" />
                      <span className="truncate flex-1">{session.title || 'Cuộc trò chuyện mới'}</span>
                    </button>
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive"
                      title="Xóa cuộc trò chuyện"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
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
                    {message.isLoading ? (
                      <div className="flex gap-1.5 py-1">
                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    )}
                    {message.emotion && message.emotion !== 'positive' && message.emotion !== 'neutral' && !message.isLoading && (
                      <div className="mt-2 pt-2 border-t border-white/20 flex items-center gap-2 text-xs opacity-90">
                        {message.emotion === 'critical' ? '🚨 Cần chú ý cao' : '⚠️ Cảm xúc tiêu cực'}
                      </div>
                    )}
                  </div>
                </div>
               ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Suggested Questions */}
          {messages.length > 0 && !isLoading && suggestedQuestions.length > 0 && (
            <div className="max-w-3xl mx-auto mt-4 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Bạn có thể hỏi:</p>
              <div className="grid gap-2">
                {suggestedQuestions.slice(0, 3).map((sq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(sq.question)}
                    className="text-left px-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground/80 hover:bg-accent hover:text-accent-foreground hover:border-primary/50 transition-all duration-200"
                  >
                    {sq.question}
                  </button>
                ))}
              </div>
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
                placeholder="Nhập tin nhắn hoặc ghi âm..."
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[44px] py-3 px-3 resize-none"
                disabled={isLoading || isSendingAudio}
                autoComplete="off"
              />
              <AudioRecorder 
                onSendAudio={handleSendAudio} 
                disabled={isLoading || isSendingAudio}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading || isSendingAudio}
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
