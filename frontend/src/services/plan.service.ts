import { apiClient } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';
import type { Plan, SubscribeRequest } from '../types/api.types';

export class PlanService {
  /**
   * Get all available plans
   */
  async getAllPlans(userType?: 'user' | 'doctor'): Promise<{ plans: Plan[] }> {
    const url = userType
      ? `${API_ENDPOINTS.PLANS.LIST}?user_type=${userType}`
      : API_ENDPOINTS.PLANS.LIST;
    
    return apiClient.get(url, false);
  }

  /**
   * Get specific plan
   */
  async getPlan(planId: number): Promise<Plan> {
    return apiClient.get<Plan>(API_ENDPOINTS.PLANS.GET(planId), false);
  }

  /**
   * Get current plan
   */
  async getCurrentPlan(): Promise<{
    plan: Plan;
    subscription_status: string;
    start_date?: string;
    end_date?: string;
  }> {
    return apiClient.get(API_ENDPOINTS.PLANS.CURRENT);
  }

  /**
   * Subscribe to a plan
   */
  async subscribe(data: SubscribeRequest): Promise<{
    message: string;
    payment: unknown;
    payment_url: string;
  }> {
    return apiClient.post(API_ENDPOINTS.PLANS.SUBSCRIBE, data);
  }
}

export const planService = new PlanService();
