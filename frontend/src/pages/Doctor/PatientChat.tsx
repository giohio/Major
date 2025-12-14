import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Send, Paperclip, Video, Phone, MoreVertical, Search } from 'lucide-react';

interface Message {
  id: number;
  sender: 'doctor' | 'patient';
  content: string;
  timestamp: string;
  type: 'text' | 'image';
}

interface ChatSession {
  id: number;
  patientId: number;
  patientName: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  mood?: string;
}

const PatientChat = () => {
  const [selectedChat, setSelectedChat] = useState<number>(1);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const sessions: ChatSession[] = [
    {
      id: 1,
      patientId: 1,
      patientName: 'Nguyễn Văn A',
      lastMessage: 'Cảm ơn bác sĩ rất nhiều!',
      timestamp: '14:30',
      unread: 2,
      mood: '😊'
    },
    {
      id: 2,
      patientId: 2,
      patientName: 'Trần Thị B',
      lastMessage: 'Em đã thử bài tập hơi thở',
      timestamp: '10:15',
      unread: 0,
      mood: '😌'
    },
    {
      id: 3,
      patientId: 3,
      patientName: 'Lê Văn C',
      lastMessage: 'Hôm nay em thấy tốt hơn nhiều',
      timestamp: 'Hôm qua',
      unread: 1,
      mood: '🙂'
    },
    {
      id: 4,
      patientId: 4,
      patientName: 'Phạm Thị D',
      lastMessage: 'Khi nào bác sĩ có thời gian?',
      timestamp: 'Hôm qua',
      unread: 0,
      mood: '😔'
    }
  ];

  const messages: Message[] = [
    {
      id: 1,
      sender: 'patient',
      content: 'Chào bác sĩ, hôm nay em cảm thấy lo lắng nhiều hơn',
      timestamp: '14:20',
      type: 'text'
    },
    {
      id: 2,
      sender: 'doctor',
      content: 'Chào em. Bác sĩ hiểu. Em có thể chia sẻ cụ thể hơn được không?',
      timestamp: '14:22',
      type: 'text'
    },
    {
      id: 3,
      sender: 'patient',
      content: 'Em lo về công việc và áp lực từ gia đình. Em không biết phải làm sao',
      timestamp: '14:23',
      type: 'text'
    },
    {
      id: 4,
      sender: 'doctor',
      content: 'Em đã làm rất tốt khi chia sẻ điều này. Hãy thử áp dụng bài tập hơi thở mà chúng ta đã học nhé. Sau đó em thử viết ra những điều em lo lắng.',
      timestamp: '14:25',
      type: 'text'
    },
    {
      id: 5,
      sender: 'patient',
      content: 'Vâng ạ, em sẽ thử. Cảm ơn bác sĩ rất nhiều!',
      timestamp: '14:30',
      type: 'text'
    }
  ];

  const filteredSessions = sessions.filter(session =>
    session.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentSession = sessions.find(s => s.id === selectedChat);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message
      setMessage('');
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-7xl mx-auto">
      {/* Sidebar - Chat List */}
      <Card className="w-80 rounded-none border-l-0 border-t-0 border-b-0">
        <CardHeader className="border-b">
          <CardTitle>Tin Nhắn</CardTitle>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm bệnh nhân..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-2 space-y-1">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setSelectedChat(session.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedChat === session.id
                    ? 'bg-accent'
                    : 'hover:bg-accent/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                    {session.mood}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">{session.patientName}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {session.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-sm text-muted-foreground truncate">
                        {session.lastMessage}
                      </p>
                      {session.unread > 0 && (
                        <Badge variant="destructive" className="flex-shrink-0 rounded-full w-5 h-5 flex items-center justify-center p-0 text-xs">
                          {session.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <Card className="rounded-none border-l-0 border-r-0 border-t-0">
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                  {currentSession?.mood}
                </div>
                <div>
                  <h3 className="font-semibold">{currentSession?.patientName}</h3>
                  <p className="text-xs text-muted-foreground">Đang hoạt động</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.sender === 'doctor'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === 'doctor'
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground'
                  }`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <Card className="rounded-none border-l-0 border-r-0 border-b-0">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Input
                placeholder="Nhập tin nhắn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage}>
                <Send className="w-4 h-4 mr-2" />
                Gửi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientChat;
