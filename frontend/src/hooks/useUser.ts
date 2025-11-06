import { useState, useCallback } from 'react';
import { userService } from '../services/user.service';
import type { User, Subscription, EmotionStats, UserStats } from '../types/api.types';

export const useUser = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [emotionStats, setEmotionStats] = useState<EmotionStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getProfile();
      setProfile(data);
      return data;
    } catch (err) {
      const errorMessage = (err as { error?: string }).error || 'Failed to load profile';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (data: { full_name?: string; phone?: string; avatar_url?: string }) => {
      try {
        setLoading(true);
        setError(null);
        const response = await userService.updateProfile(data);
        setProfile(response.user);
        return response;
      } catch (err) {
        const errorMessage = (err as { error?: string }).error || 'Failed to update profile';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getSubscription();
      setSubscription(data);
      return data;
    } catch (err) {
      const errorMessage = (err as { error?: string }).error || 'Failed to load subscription';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEmotionStats = useCallback(
    async (period: 'week' | 'month' | 'year' = 'week') => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.getEmotionStats(period);
        setEmotionStats(data);
        return data;
      } catch (err) {
        const errorMessage = (err as { error?: string }).error || 'Failed to load emotion stats';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadUserStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getStats();
      setUserStats(data);
      return data;
    } catch (err) {
      const errorMessage = (err as { error?: string }).error || 'Failed to load user stats';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    profile,
    subscription,
    emotionStats,
    userStats,
    loading,
    error,
    loadProfile,
    updateProfile,
    loadSubscription,
    loadEmotionStats,
    loadUserStats,
  };
};
