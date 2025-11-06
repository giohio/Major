import { apiClient } from './api.client';
import { API_ENDPOINTS, STORAGE_KEYS } from '../config/api.config';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from '../types/api.types';

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data,
      false
    );

    if (response.access_token) {
      this.saveTokens(response.access_token, response.refresh_token);
      this.saveUser(response.user);
    }

    return response;
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
      false
    );

    if (response.access_token) {
      this.saveTokens(response.access_token, response.refresh_token);
      this.saveUser(response.user);
    }

    return response;
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
  }

  /**
   * Verify email
   */
  async verifyEmail(data: { otp: string }): Promise<{ message: string; user: User }> {
    return apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data);
  }

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }, false);
  }

  /**
   * Reset password
   */
  async resetPassword(data: {
    token: string;
    new_password: string;
  }): Promise<{ message: string }> {
    return apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data, false);
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ access_token: string }> {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<{ access_token: string }>(
      API_ENDPOINTS.AUTH.REFRESH,
      {},
      false
    );

    if (response.access_token) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
    }

    return response;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get stored user
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Save tokens to localStorage
   */
  private saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  /**
   * Save user to localStorage
   */
  private saveUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
}

export const authService = new AuthService();
