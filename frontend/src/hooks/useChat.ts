import { useState, useCallback } from 'react';
import { apiClient } from '../services/api.client';
import { API_ENDPOINTS } from '../config/api.config';
import type {
  ChatMessage,
  ChatSession,
  SendMessageRequest,
  SendMessageResponse,
} from '../types/api.types';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingChats, setRemainingChats] = useState<number | 'unlimited'>('unlimited');

  const sendMessage = useCallback(
    async (message: string, analyzeEmotion: boolean = true) => {
      try {
        setLoading(true);
        setError(null);

        const request: SendMessageRequest = {
          message,
          session_id: currentSessionId || undefined,
          analyze_emotion: analyzeEmotion,
        };

        const response: SendMessageResponse = await apiClient.post<SendMessageResponse>(API_ENDPOINTS.CHAT.SEND, request);

        // Update session ID
        if (!currentSessionId) {
          setCurrentSessionId(response.session_id);
        }

        // Add messages to state
        setMessages((prev) => [...prev, response.user_message, response.ai_message]);

        // Update remaining chats
        if (response.remaining_chats !== undefined) {
          setRemainingChats(response.remaining_chats);
        }

        return response;
      } catch (err) {
        const errorMessage = (err as { error?: string }).error || 'Failed to send message';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentSessionId]
  );

  const loadSession = useCallback(async (sessionId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<{ messages: ChatMessage[] }>(API_ENDPOINTS.CHAT.SESSION(sessionId));
      setMessages(response.messages);
      setCurrentSessionId(sessionId);
    } catch (err) {
      const errorMessage = (err as { error?: string }).error || 'Failed to load session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRecentSessions = useCallback(async (limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<{ sessions: ChatSession[] }>(`${API_ENDPOINTS.CHAT.RECENT}?limit=${limit}`);
      setSessions(response.sessions);
    } catch (err) {
      const errorMessage = (err as { error?: string }).error || 'Failed to load sessions';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: number) => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.delete(API_ENDPOINTS.CHAT.DELETE_SESSION(sessionId));
      
      // Remove from sessions list
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      
      // Clear current session if deleted
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    } catch (err) {
      const errorMessage = (err as { error?: string }).error || 'Failed to delete session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentSessionId]);

  const startNewSession = useCallback(() => {
    setCurrentSessionId(null);
    setMessages([]);
  }, []);

  const submitFeedback = useCallback(
    async (messageId: number, rating: number, feedbackText?: string) => {
      try {
        await apiClient.post(API_ENDPOINTS.CHAT.FEEDBACK, {
          message_id: messageId,
          rating,
          feedback_text: feedbackText,
        });
      } catch (err) {
        console.error('Failed to submit feedback:', err);
        throw err;
      }
    },
    []
  );

  return {
    messages,
    sessions,
    currentSessionId,
    loading,
    error,
    remainingChats,
    sendMessage,
    loadSession,
    loadRecentSessions,
    deleteSession,
    startNewSession,
    submitFeedback,
  };
};
