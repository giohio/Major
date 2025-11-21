import { apiClient } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';
import type {
  SendMessageRequest,
  SendMessageResponse,
  ChatSession,
  ChatMessage,
} from '../types/api.types';

export class ChatService {
  /**
   * Send a message to AI
   */
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    return apiClient.post<SendMessageResponse>(
      API_ENDPOINTS.CHAT.SEND,
      request
    );
  }

  /**
   * Get messages in a session
   */
  async getSessionMessages(sessionId: number): Promise<{
    session_id: number;
    messages: ChatMessage[];
  }> {
    return apiClient.get(API_ENDPOINTS.CHAT.SESSION(sessionId));
  }

  /**
   * Get recent chat sessions
   */
  async getRecentSessions(limit: number = 10): Promise<{
    sessions: ChatSession[];
    total: number;
  }> {
    return apiClient.get(`${API_ENDPOINTS.CHAT.RECENT}?limit=${limit}`);
  }

  /**
   * Delete a chat session
   */
  async deleteSession(sessionId: number): Promise<{ message: string }> {
    return apiClient.delete(API_ENDPOINTS.CHAT.DELETE_SESSION(sessionId));
  }

  /**
   * Archive a chat session
   */
  async archiveSession(sessionId: number): Promise<{ message: string }> {
    return apiClient.post(API_ENDPOINTS.CHAT.ARCHIVE_SESSION(sessionId));
  }

  /**
   * Submit feedback for a message
   */
  async submitFeedback(data: {
    message_id: number;
    rating: number;
    feedback_text?: string;
  }): Promise<{ message: string; feedback: unknown }> {
    return apiClient.post(API_ENDPOINTS.CHAT.FEEDBACK, data);
  }
}

export const chatService = new ChatService();
