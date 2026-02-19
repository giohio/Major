import { API_CONFIG, STORAGE_KEYS } from '../config/api.config';
import type { ApiError } from '../types/api.types';

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.baseURL = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true', // Bypass ngrok warning page
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private subscribeTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private async handleResponse<T>(response: Response, endpoint: string, options: RequestInit): Promise<T> {
    // Clone response so we can read it multiple times if needed (though we usually don't)

    if (!response.ok) {
      // Special case for 401 (Unauthorized)
      const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/register') || endpoint.includes('/auth/oauth');

      if (response.status === 401 && !isAuthEndpoint) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          try {
            // Call refresh endpoint
            const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const refreshResponse = await fetch(`${this.baseURL}/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshToken}` // Some backends expect Header
              },
              body: JSON.stringify({ refresh_token: refreshToken }) // Some expect body
            });

            if (refreshResponse.ok) {
              const data = await refreshResponse.json();
              const newToken = data.access_token;

              // Update storage
              localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newToken);

              this.isRefreshing = false;
              this.onRefreshed(newToken);

              // Retry original request
              const newHeaders = {
                ...options.headers,
                'Authorization': `Bearer ${newToken}`
              };

              const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: newHeaders
              });

              return retryResponse.json();
            } else {
              throw new Error('Refresh failed');
            }
          } catch (error) {
            this.isRefreshing = false;
            this.clearAuth();
            window.location.href = '/login';
            return Promise.reject(error);
          }
        } else {
          // If already refreshing, wait for new token
          return new Promise((resolve) => {
            this.subscribeTokenRefresh(async (token) => {
              // Retry original request
              const newHeaders = {
                ...options.headers,
                'Authorization': `Bearer ${token}`
              };

              const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: newHeaders
              });
              resolve(retryResponse.json());
            });
          });
        }
      }

      // Handle other errors
      const error: ApiError = await response.json().catch(() => ({
        error: 'Network error',
        message: response.statusText,
      }));

      throw error;
    }

    return response.json();
  }

  private clearAuth(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    console.log(`[API] GET ${endpoint} - Start`);
    const startTime = performance.now();

    try {
      const fullUrl = `${this.baseURL}${endpoint}`;

      const options = {
        method: 'GET',
        headers: this.getHeaders(includeAuth),
        signal: controller.signal,
      };

      console.log(`[API] Fetching ${fullUrl}...`);
      const response = await fetch(fullUrl, options);
      console.log(`[API] GET ${endpoint} - Response in ${(performance.now() - startTime).toFixed(0)}ms, status=${response.status}`);
      return this.handleResponse<T>(response, endpoint, options);
    } catch (error) {
      console.error(`[API] GET ${endpoint} - Error after ${(performance.now() - startTime).toFixed(0)}ms:`, error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    includeAuth: boolean = true
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const options = {
        method: 'POST',
        headers: this.getHeaders(includeAuth),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      };

      const response = await fetch(`${this.baseURL}${endpoint}`, options);
      return this.handleResponse<T>(response, endpoint, options);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    includeAuth: boolean = true
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const options = {
        method: 'PUT',
        headers: this.getHeaders(includeAuth),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      };
      const response = await fetch(`${this.baseURL}${endpoint}`, options);
      return this.handleResponse<T>(response, endpoint, options);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const options = {
        method: 'DELETE',
        headers: this.getHeaders(includeAuth),
        signal: controller.signal,
      };
      const response = await fetch(`${this.baseURL}${endpoint}`, options);
      return this.handleResponse<T>(response, endpoint, options);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async postFormData<T>(
    endpoint: string,
    formData: FormData,
    includeAuth: boolean = true
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers: HeadersInit = {};
      if (includeAuth) {
        const token = this.getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      // Don't set Content-Type for FormData, browser will set it with boundary

      const options = {
        method: 'POST',
        headers: headers,
        body: formData,
        signal: controller.signal,
      };

      const response = await fetch(`${this.baseURL}${endpoint}`, options);
      return this.handleResponse<T>(response, endpoint, options);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export const apiClient = new ApiClient();
