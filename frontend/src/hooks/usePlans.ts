import { useState, useCallback } from 'react';
import { planService } from '../services/plan.service';
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
      const response = await planService.getAllPlans(userType);
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
      const response = await planService.getCurrentPlan();
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
      const response = await planService.subscribe(data);
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
