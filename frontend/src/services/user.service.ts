import { apiClient } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';
import type {
  User,
  Subscription,
  EmotionStats,
  ChatSession,
  UserStats,
} from '../types/api.types';

export class UserService {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    return apiClient.get<User>(API_ENDPOINTS.USERS.ME);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
  }): Promise<{ message: string; user: User }> {
    return apiClient.put(API_ENDPOINTS.USERS.ME, data);
  }

  /**
   * Get subscription information
   */
  async getSubscription(): Promise<Subscription> {
    return apiClient.get<Subscription>(API_ENDPOINTS.USERS.SUBSCRIPTION);
  }

  /**
   * Get emotion statistics
   */
  async getEmotionStats(
    period: 'week' | 'month' | 'year' = 'week'
  ): Promise<EmotionStats> {
    return apiClient.get<EmotionStats>(
      `${API_ENDPOINTS.USERS.EMOTIONS}?period=${period}`
    );
  }

  /**
   * Get chat history
   */
  async getHistory(limit: number = 20): Promise<{
    sessions: ChatSession[];
    total: number;
  }> {
    return apiClient.get(`${API_ENDPOINTS.USERS.HISTORY}?limit=${limit}`);
  }

  /**
   * Get user statistics
   */
  async getStats(): Promise<UserStats> {
    return apiClient.get<UserStats>(API_ENDPOINTS.USERS.STATS);
  }
}

export const userService = new UserService();
