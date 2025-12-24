import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, Video, MessageSquare } from 'lucide-react';
import { apiClient } from '../services/api.client';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface Message {
  id: number;
  sender: 'doctor' | 'patient';
  content: string;
  timestamp: Date;
  read?: boolean;
}

interface ChatConsultationProps {
  appointmentId: number;
  patientName?: string;
  doctorName?: string;
  patientAvatar?: string | null;
  doctorAvatar?: string | null;
  isDoctor: boolean;
  onClose: () => void;
  onRequestVideoCall?: () => void;
}

const ChatConsultation = ({
  appointmentId,
  patientName,
  doctorName,
  patientAvatar,
  doctorAvatar,
  isDoctor,
  onClose,
  onRequestVideoCall
}: ChatConsultationProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isCompletingAppointment, setIsCompletingAppointment] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      loadMessages(true);
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async (silent = false) => {
    try {
      if (!silent) setIsLoadingMessages(true);
      
      console.log(`[ChatConsultation] Loading messages for appointment ${appointmentId}`);
      
      // Get messages for this appointment
      const response = await apiClient.get<{ messages: Array<{
        id: number;
        role: string;
        message: string;
        created_at: string;
        read?: boolean;
      }> }>(
        `/chat/appointments/${appointmentId}/messages`
      );

      console.log(`[ChatConsultation] Loaded ${response.messages?.length || 0} messages`);

      const loadedMessages: Message[] = response.messages.map((msg, idx) => ({
        id: idx,
        sender: msg.role === 'doctor' ? 'doctor' : 'patient',
        content: msg.message,
        timestamp: new Date(msg.created_at),
        read: msg.read || false
      }));

      setMessages(loadedMessages);
    } catch (error) {
      console.error('[ChatConsultation] Failed to load messages:', error);
      if (!silent) {
        toast.error('Unable to load messages');
      }
    } finally {
      if (!silent) setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    console.log(`[ChatConsultation] Sending message for appointment ${appointmentId}, role: ${isDoctor ? 'doctor' : 'patient'}`);

    const userMessage: Message = {
      id: Date.now(),
      sender: isDoctor ? 'doctor' : 'patient',
      content: inputValue,
      timestamp: new Date(),
      read: false
    };

    setMessages(prev => [...prev, userMessage]);
    const messageContent = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      console.log('[ChatConsultation] Posting message:', messageContent);
      const response = await apiClient.post(`/chat/appointments/${appointmentId}/messages`, {
        message: messageContent,
        role: isDoctor ? 'doctor' : 'patient'
      });
      console.log('[ChatConsultation] Message sent successfully:', response);

      // Reload messages to get server response
      setTimeout(() => loadMessages(true), 500);
    } catch (error: any) {
      console.error('[ChatConsultation] Failed to send message:', error);
      console.error('[ChatConsultation] Error details:', error.response?.data || error.message);
      toast.error('Unable to send message: ' + (error.response?.data?.error || error.message));
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCompleteAppointment = async () => {
    try {
      setIsCompletingAppointment(true);
      await apiClient.put(`/doctor/appointments/${appointmentId}`, {
        status: 'completed'
      });
      toast.success('Consultation completed');
      setTimeout(() => onClose(), 1000);
    } catch (error: any) {
      console.error('Failed to complete appointment:', error);
      toast.error('Unable to complete: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsCompletingAppointment(false);
    }
  };

  const getMessageAlignment = (sender: Message['sender']) => {
    if (isDoctor) {
      return sender === 'doctor' ? 'justify-end' : 'justify-start';
    } else {
      return sender === 'patient' ? 'justify-end' : 'justify-start';
    }
  };

  const getMessageBgColor = (sender: Message['sender']) => {
    if (isDoctor) {
      return sender === 'doctor'
        ? 'bg-teal-600 text-white'
        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100';
    } else {
      return sender === 'patient'
        ? 'bg-blue-600 text-white'
        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          {isDoctor ? (
            // Show patient avatar
            patientAvatar ? (
              <img 
                src={patientAvatar} 
                alt={patientName || 'Patient'}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                  }
                }}
              />
            ) : null
          ) : (
            // Show doctor avatar
            doctorAvatar ? (
              <img 
                src={doctorAvatar} 
                alt={doctorName || 'Doctor'}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                  }
                }}
              />
            ) : null
          )}
          <div 
            className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold"
            style={{ display: (isDoctor ? patientAvatar : doctorAvatar) ? 'none' : 'flex' }}
          >
            {isDoctor
              ? (patientName?.charAt(0) || 'P')
              : (doctorName?.charAt(0) || 'D')}
          </div>
          <div>
            <h3 className="font-semibold">
              {isDoctor ? patientName : doctorName}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isDoctor ? 'Patient' : 'Doctor'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRequestVideoCall && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRequestVideoCall}
              className="gap-2"
            >
              <Video className="w-4 h-4" />
              Video Call
            </Button>
          )}
          {isDoctor && (
            <Button
              variant="default"
              size="sm"
              onClick={handleCompleteAppointment}
              disabled={isCompletingAppointment}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <MessageSquare className="w-4 h-4" />
              {isCompletingAppointment ? 'Processing...' : 'Complete'}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">No messages yet</p>
            <p className="text-sm">
              {isDoctor
                ? 'Send the first message to start consultation'
                : 'Start the consultation by sending a message'}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn('flex', getMessageAlignment(message.sender))}
              >
                <div
                  className={cn(
                    'max-w-[70%] rounded-2xl px-4 py-2',
                    getMessageBgColor(message.sender)
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  <p
                    className={cn(
                      'text-xs mt-1 opacity-70',
                      message.sender === (isDoctor ? 'doctor' : 'patient')
                        ? 'text-white'
                        : 'text-muted-foreground'
                    )}
                  >
                    {message.timestamp.toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isDoctor
                ? 'Enter consultation message...'
                : 'Enter your message...'
            }
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {isDoctor && (
          <p className="text-xs text-muted-foreground mt-2">
            💡 This message is only between you and the patient
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatConsultation;
