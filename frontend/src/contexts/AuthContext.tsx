import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './auth';
import type { User } from './auth';
import { apiClient } from '../services/api.client';
import { STORAGE_KEYS, API_ENDPOINTS } from '../config/api.config';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          const currentUser = await apiClient.get<any>(API_ENDPOINTS.AUTH.ME);
          setUser({
            id: currentUser.id.toString(),
            name: currentUser.full_name,
            email: currentUser.email,
            role: currentUser.role
          });
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.AUTH.LOGIN, { email, password }, false);

      // Store tokens
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
      if (response.refresh_token) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
      }

      const userData: User = {
        id: response.user.id.toString(),
        name: response.user.full_name,
        email: response.user.email,
        role: response.user.role
      };

      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.AUTH.REGISTER, {
        full_name: name,
        email,
        password
      }, false);

      // Store tokens
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
      if (response.refresh_token) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
      }

      const userData: User = {
        id: response.user.id.toString(),
        name: response.user.full_name,
        email: response.user.email,
        role: response.user.role
      };

      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const loginWithOAuth = async (provider: 'google' | 'facebook', firebaseUser: any): Promise<User> => {
    try {
      const response = await apiClient.post<any>(
        '/auth/oauth/login',
        {
          provider,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          full_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          photo_url: firebaseUser.photoURL
        },
        false
      );

      // Store tokens
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
      if (response.refresh_token) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
      }

      const userData: User = {
        id: response.user.id.toString(),
        name: response.user.full_name,
        email: response.user.email,
        role: response.user.role
      };

      setUser(userData);
      return userData;
    } catch (error) {
      console.error('OAuth login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      setUser(null);
    }
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithOAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
