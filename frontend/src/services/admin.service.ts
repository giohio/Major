/**
 * Admin Service
 * Services for admin-specific operations
 */

import { apiClient } from './api.client';
import { API_CONFIG } from '../config/api.config';
import type {
  User,
  Plan,
  AIModel,
  AdminOverview,
  UsageStats,
  ApiResponse
} from '../types/api.types';

export class AdminService {
  // ================== User Management ==================

  /**
   * Get all users
   */
  async getUsers(params?: {
    role?: string;
    page?: number;
    perPage?: number;
  }): Promise<ApiResponse<User[]>> {
    const query = new URLSearchParams();
    if (params?.role) query.append('role', params.role);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.perPage) query.append('per_page', params.perPage.toString());

    return apiClient.get<ApiResponse<User[]>>(
      `${API_CONFIG.API_ENDPOINTS.ADMIN.USERS}?${query.toString()}`
    );
  }

  /**
   * Get user details
   */
  async getUser(userId: number): Promise<User> {
    return apiClient.get<User>(`${API_CONFIG.API_ENDPOINTS.ADMIN.USERS}/${userId}`);
  }

  /**
   * Create a new user
   */
  async createUser(data: {
    email: string;
    password: string;
    full_name: string;
    role: 'user' | 'doctor' | 'admin';
    phone?: string;
    is_verified?: boolean;
  }): Promise<{ message: string; user: User }> {
    return apiClient.post(API_CONFIG.API_ENDPOINTS.ADMIN.USERS, data);
  }

  /**
   * Update user
   */
  async updateUser(
    userId: number,
    data: {
      full_name?: string;
      phone?: string;
      role?: string;
      is_verified?: boolean;
      is_active?: boolean;
      subscription_plan?: string;
      subscription_status?: string;
    }
  ): Promise<{ message: string; user: User }> {
    return apiClient.put(`${API_CONFIG.API_ENDPOINTS.ADMIN.USERS}/${userId}`, data);
  }

  /**
   * Delete user
   */
  async deleteUser(userId: number): Promise<{ message: string }> {
    return apiClient.delete(`${API_CONFIG.API_ENDPOINTS.ADMIN.USERS}/${userId}`);
  }

  // ================== Doctor Management ==================

  /**
   * Get all doctors
   */
  async getDoctors(params?: {
    verified?: boolean;
    page?: number;
    perPage?: number;
  }): Promise<ApiResponse<User[]>> {
    const query = new URLSearchParams();
    if (params?.verified !== undefined) query.append('verified', params.verified.toString());
    if (params?.page) query.append('page', params.page.toString());
    if (params?.perPage) query.append('per_page', params.perPage.toString());

    return apiClient.get<ApiResponse<User[]>>(
      `${API_CONFIG.API_ENDPOINTS.ADMIN.DOCTORS}?${query.toString()}`
    );
  }

  /**
   * Get doctor details
   */
  async getDoctor(doctorId: number): Promise<User> {
    return apiClient.get<User>(`${API_CONFIG.API_ENDPOINTS.ADMIN.DOCTORS}/${doctorId}`);
  }

  /**
   * Verify doctor
   */
  async verifyDoctor(doctorId: number): Promise<{ message: string; doctor: User }> {
    return apiClient.put(
      `${API_CONFIG.API_ENDPOINTS.ADMIN.DOCTORS}/${doctorId}/verify`,
      {}
    );
  }

  // ================== Plan Management ==================

  /**
   * Get all plans
   */
  async getPlans(planType?: 'user' | 'doctor'): Promise<{ plans: Plan[] }> {
    const query = planType ? `?plan_type=${planType}` : '';
    return apiClient.get(`${API_CONFIG.API_ENDPOINTS.ADMIN.PLANS}${query}`);
  }

  /**
   * Create a new plan
   */
  async createPlan(data: {
    name: string;
    description?: string;
    price_monthly: number;
    price_yearly?: number;
    plan_type: 'user' | 'doctor';
    chat_limit?: number;
    voice_enabled?: boolean;
    video_enabled?: boolean;
    empathy_layer_enabled?: boolean;
    doctor_access?: boolean;
    priority_support?: boolean;
    patient_limit?: number;
    analytics_enabled?: boolean;
  }): Promise<{ message: string; plan: Plan }> {
    return apiClient.post(API_CONFIG.API_ENDPOINTS.ADMIN.PLANS, data);
  }

  /**
   * Update plan
   */
  async updatePlan(planId: number, data: Partial<Plan>): Promise<{ message: string; plan: Plan }> {
    return apiClient.put(`${API_CONFIG.API_ENDPOINTS.ADMIN.PLANS}/${planId}`, data);
  }

  /**
   * Delete plan
   */
  async deletePlan(planId: number): Promise<{ message: string }> {
    return apiClient.delete(`${API_CONFIG.API_ENDPOINTS.ADMIN.PLANS}/${planId}`);
  }

  // ================== AI Model Management ==================

  /**
   * Get all AI models
   */
  async getModels(): Promise<{ models: AIModel[] }> {
    return apiClient.get(API_CONFIG.API_ENDPOINTS.ADMIN.MODELS);
  }

  /**
   * Create a new AI model configuration
   */
  async createModel(data: {
    name: string;
    model_type: 'gemini' | 'openai' | 'claude' | 'custom';
    model_version: string;
    description?: string;
    api_endpoint?: string;
    is_active?: boolean;
    is_default?: boolean;
  }): Promise<{ message: string; model: AIModel }> {
    return apiClient.post(API_CONFIG.API_ENDPOINTS.ADMIN.MODELS, data);
  }

  /**
   * Update AI model
   */
  async updateModel(
    modelId: number,
    data: Partial<AIModel>
  ): Promise<{ message: string; model: AIModel }> {
    return apiClient.put(`${API_CONFIG.API_ENDPOINTS.ADMIN.MODELS}/${modelId}`, data);
  }

  /**
   * Delete AI model
   */
  async deleteModel(modelId: number): Promise<{ message: string }> {
    return apiClient.delete(`${API_CONFIG.API_ENDPOINTS.ADMIN.MODELS}/${modelId}`);
  }

  // ================== Analytics ==================

  /**
   * Get system overview
   */
  async getOverview(): Promise<AdminOverview> {
    return apiClient.get<AdminOverview>(API_CONFIG.API_ENDPOINTS.ADMIN.OVERVIEW);
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<UsageStats> {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('start_date', params.startDate);
    if (params?.endDate) query.append('end_date', params.endDate);

    return apiClient.get<UsageStats>(
      `${API_CONFIG.API_ENDPOINTS.ADMIN.USAGE_STATS}?${query.toString()}`
    );
  }

  /**
   * Get revenue analytics
   */
  async getRevenue(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    total_revenue: number;
    revenue_by_plan: Record<string, number>;
    revenue_by_method: Record<string, number>;
    period: { start_date: string; end_date: string };
  }> {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('start_date', params.startDate);
    if (params?.endDate) query.append('end_date', params.endDate);

    return apiClient.get(
      `${API_CONFIG.API_ENDPOINTS.ADMIN.REVENUE}?${query.toString()}`
    );
  }

  /**
   * Get system logs
   */
  async getLogs(params?: {
    level?: string;
    page?: number;
    perPage?: number;
  }): Promise<ApiResponse<unknown[]>> {
    const query = new URLSearchParams();
    if (params?.level) query.append('level', params.level);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.perPage) query.append('per_page', params.perPage.toString());

    return apiClient.get<ApiResponse<unknown[]>>(
      `${API_CONFIG.API_ENDPOINTS.ADMIN.LOGS}?${query.toString()}`
    );
  }
}

export const adminService = new AdminService();
