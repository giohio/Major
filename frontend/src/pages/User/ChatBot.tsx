import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Plus, Sparkles, Phone } from 'lucide-react';

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  emotion?: 'positive' | 'neutral' | 'negative' | 'critical';
}

const ChatBot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: 'Xin chào! Tôi là AI tâm lý học của MindCare. Tôi ở đây để lắng nghe và hỗ trợ bạn. Hôm nay bạn cảm thấy thế nào?',
      timestamp: new Date(Date.now() - 60000),
      emotion: 'positive'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const commonTopics = [
    { text: 'Tôi đang cảm thấy lo lắng', id: 1 },
    { text: 'Áp lực công việc', id: 2 },
    { text: 'Vấn đề về giấc ngủ', id: 3 },
    { text: 'Cảm thấy buồn và chán nản', id: 4 },
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
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Analyze emotion
    const { score, emotion } = analyzeEmotion(messageText);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content: score >= 3 
          ? '🚨 Tôi nhận thấy bạn đang trải qua giai đoạn khó khăn. Tôi nghĩ bạn nên được hỗ trợ từ chuyên gia y tế. Bạn có muốn tôi giúp kết nối với bác sĩ không?'
          : 'Tôi hiểu bạn đang trải qua. Hãy kể cho tôi nghe thêm về cảm giác của bạn...',
        timestamp: new Date(),
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
    <div className="flex h-[calc(100vh-4rem)] gap-0">
      {/* Sidebar - Chat History */}
      <div className="w-80 border-r border-border/50 bg-background/50 backdrop-blur flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border/50">
          <Button 
            className="w-full justify-start gap-2 bg-primary hover:bg-primary/90"
            onClick={() => setMessages([{
              id: Date.now(),
              type: 'ai',
              content: 'Xin chào! Tôi là AI tâm lý học của MindCare. Tôi ở đây để lắng nghe và hỗ trợ bạn. Hôm nay bạn cảm thấy thế nào?',
              timestamp: new Date(),
              emotion: 'positive'
            }])}
          >
            <Plus size={18} />
            <span>Cuộc trò chuyện mới</span>
          </Button>
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">Hôm nay</div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left h-auto py-3 px-3 bg-accent/50"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">Cuộc trò chuyện hiện tại</div>
              <div className="text-xs text-muted-foreground truncate">Tôi đang cảm thấy lo lắng...</div>
            </div>
          </Button>

          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground mt-4">Hôm qua</div>
          <Button variant="ghost" className="w-full justify-start text-left h-auto py-3 px-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">Áp lực công việc</div>
              <div className="text-xs text-muted-foreground truncate">Giúp tôi với stress...</div>
            </div>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-left h-auto py-3 px-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">Vấn đề về giấc ngủ</div>
              <div className="text-xs text-muted-foreground truncate">Tôi không ngủ được...</div>
            </div>
          </Button>

          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground mt-4">7 ngày trước</div>
          <Button variant="ghost" className="w-full justify-start text-left h-auto py-3 px-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">Cảm thấy buồn</div>
              <div className="text-xs text-muted-foreground truncate">Tôi cảm thấy chán nản...</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border/50 px-6 py-4 bg-background/50 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-primary/70 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">MindCare AI</h1>
              <p className="text-xs text-muted-foreground">Hoạt động 24/7</p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}
          >
            <div
              className={`max-w-sm px-4 py-3 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-secondary/20 text-foreground border border-secondary/30 rounded-bl-none'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className="text-xs opacity-60 mt-2">
                {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary/20 text-foreground border border-secondary/30 px-4 py-3 rounded-2xl rounded-bl-none">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 bg-secondary rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-secondary rounded-full animate-bounce [animation-delay:0.1s]"></div>
                <div className="w-2.5 h-2.5 bg-secondary rounded-full animate-bounce [animation-delay:0.2s]"></div>
              </div>
            </div>
          </div>
        )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Topics */}
        {messages.length === 1 && (
          <div className="px-6 pb-4 flex flex-wrap gap-2">
            {commonTopics.map((topic) => (
              <Button
                key={topic.id}
                variant="outline"
                size="sm"
                onClick={() => handleSendMessage(topic.text)}
                className="rounded-full text-xs"
              >
                {topic.text}
              </Button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-border/50 px-6 py-4 bg-background/50 backdrop-blur">
        <div className="flex gap-3">
          <Input
            placeholder="Chia sẻ cảm xúc của bạn..."
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="border-input bg-background/50 rounded-full"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="btn-primary rounded-full w-10 h-10 p-0 flex items-center justify-center"
            size="icon"
          >
            <Send size={18} />
          </Button>
        </div>
        
        {/* Emergency Card */}
        <Card className="mt-4 p-4 bg-destructive/5 border-destructive/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <Phone size={16} className="text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-destructive mb-1">Hỗ trợ khẩn cấp</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Nếu bạn đang có ý định tự hại, hãy liên hệ ngay:
              </p>
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full"
                onClick={() => window.open('tel:1900-1234')}
              >
                Gọi hotline: 1900 1234
              </Button>
            </div>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
