import { useState, useCallback } from 'react';
import { apiClient } from '../services/api.client';
import { API_ENDPOINTS } from '../config/api.config';
import type { Plan, SubscribeRequest } from '../types/api.types';

export const usePlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlans = useCallback(async (userType?: 'user' | 'doctor') => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = userType ? `${API_ENDPOINTS.PLANS.LIST}?user_type=${userType}` : API_ENDPOINTS.PLANS.LIST;
      const response = await apiClient.get<{ plans: Plan[] }>(endpoint);
      setPlans(response.plans);
      return response.plans;
    } catch (err) {
      const errorMessage = (err as { error?: string }).error || 'Failed to load plans';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCurrentPlan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<{ plan: Plan }>(API_ENDPOINTS.PLANS.CURRENT);
      setCurrentPlan(response.plan);
      return response;
    } catch (err) {
      const errorMessage = (err as { error?: string }).error || 'Failed to load current plan';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const subscribe = useCallback(async (data: SubscribeRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post<any>(API_ENDPOINTS.PLANS.SUBSCRIBE, data);
      return response;
    } catch (err) {
      const errorMessage = (err as { error?: string }).error || 'Failed to subscribe';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    plans,
    currentPlan,
    loading,
    error,
    loadPlans,
    loadCurrentPlan,
    subscribe,
  };
};
