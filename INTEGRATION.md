# 🔗 Kết nối Frontend với Backend

Hướng dẫn tích hợp Backend API vào Frontend React.

## 📋 Chuẩn bị

### 1. Backend đã chạy
Đảm bảo backend đang chạy tại: http://127.0.0.1:5000

```powershell
cd backend
.\run.ps1
```

### 2. Cài đặt axios trong Frontend

```powershell
cd frontend
npm install axios
```

## 🔧 Cấu hình API Client

### Tạo file `src/services/api.ts`

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );

          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

## 🔐 Auth Service

### Tạo file `src/services/authService.ts`

```typescript
import api from './api';

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role?: 'user' | 'doctor' | 'admin';
  doctor_info?: {
    license_number?: string;
    specialization?: string;
    years_of_experience?: number;
    bio?: string;
    consultation_fee?: number;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
}

class AuthService {
  async register(data: RegisterData) {
    const response = await api.post('/api/auth/register', data);
    if (response.data.access_token) {
      this.setTokens(response.data);
    }
    return response.data;
  }

  async login(data: LoginData) {
    const response = await api.post('/api/auth/login', data);
    if (response.data.access_token) {
      this.setTokens(response.data);
    }
    return response.data;
  }

  async getCurrentUser() {
    const response = await api.get('/api/auth/me');
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async changePassword(data: ChangePasswordData) {
    const response = await api.post('/api/auth/change-password', data);
    return response.data;
  }

  async logout() {
    try {
      await api.post('/api/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  private setTokens(data: any) {
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
    }
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  }

  private clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }
}

export default new AuthService();
```

## 🔄 Cập nhật App.tsx

### Update `src/App.tsx`

```typescript
import { createContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/authService';

// ... existing imports

interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'user' | 'doctor' | 'admin';
  subscription_plan: string;
  // ... other fields
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  isLoading: true,
});

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const data = await authService.getCurrentUser();
          setUser(data.user);
        } catch (error) {
          console.error('Failed to get current user:', error);
          authService.logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authService.login({ email, password });
      setUser(data.user);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Đăng nhập thất bại';
      throw new Error(message);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      <BrowserRouter>
        {/* ... your routes */}
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
```

## 📝 Cập nhật Login Page

### Update `src/pages/Login.tsx`

```typescript
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Redirect based on role will be handled by ProtectedRoute
      navigate('/user/dashboard');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Đăng nhập</h1>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="login-footer">
          Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
        </p>

        {/* Quick Login Buttons for Testing */}
        <div className="quick-login">
          <p>Đăng nhập nhanh:</p>
          <button onClick={() => { setEmail('user1@example.com'); setPassword('User@123456'); }}>
            User
          </button>
          <button onClick={() => { setEmail('doctor1@mindcare.ai'); setPassword('Doctor@123456'); }}>
            Doctor
          </button>
          <button onClick={() => { setEmail('admin@mindcare.ai'); setPassword('Admin@123456'); }}>
            Admin
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
```

## 🛡️ Protected Routes

### Update ProtectedRoute component

```typescript
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../App';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('user' | 'doctor' | 'admin')[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardMap = {
      user: '/user/dashboard',
      doctor: '/doctor/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={dashboardMap[user.role]} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
```

## 🧪 Test API Connection

### Tạo file test: `src/pages/TestAPI.tsx`

```typescript
import { useState } from 'react';
import api from '../services/api';
import authService from '../services/authService';

function TestAPI() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testHealthCheck = async () => {
    try {
      const response = await api.get('/health');
      setResult(response.data);
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const testLogin = async () => {
    try {
      const data = await authService.login({
        email: 'user1@example.com',
        password: 'User@123456'
      });
      setResult(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const testGetMe = async () => {
    try {
      const data = await authService.getCurrentUser();
      setResult(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test API Connection</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testHealthCheck}>Test Health Check</button>
        <button onClick={testLogin} style={{ marginLeft: '10px' }}>Test Login</button>
        <button onClick={testGetMe} style={{ marginLeft: '10px' }}>Test Get Me</button>
      </div>

      {error && (
        <div style={{ color: 'red', padding: '10px', background: '#fee' }}>
          Error: {error}
        </div>
      )}

      {result && (
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default TestAPI;
```

## ✅ Checklist

- [ ] Backend đang chạy tại http://127.0.0.1:5000
- [ ] Frontend đã cài axios: `npm install axios`
- [ ] Đã tạo `src/services/api.ts`
- [ ] Đã tạo `src/services/authService.ts`
- [ ] Đã cập nhật `src/App.tsx`
- [ ] Đã cập nhật `src/pages/Login.tsx`
- [ ] Đã cập nhật ProtectedRoute
- [ ] Test API connection với TestAPI page
- [ ] Đăng nhập thành công với tài khoản test

## 🐛 Common Issues

### CORS Error
**Lỗi:** "Access to XMLHttpRequest has been blocked by CORS policy"

**Giải pháp:** Đảm bảo backend đã cấu hình CORS đúng. Kiểm tra file `.env`:
```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Network Error
**Lỗi:** "Network Error" khi gọi API

**Giải pháp:**
1. Kiểm tra backend có đang chạy không
2. Kiểm tra URL trong `api.ts` đúng chưa
3. Kiểm tra firewall không block port 5000

### 401 Unauthorized
**Lỗi:** API trả về 401 sau khi đăng nhập

**Giải pháp:** 
1. Kiểm tra token có được lưu đúng không
2. Clear localStorage và đăng nhập lại
3. Kiểm tra token expiration

## 📞 Support

Nếu gặp vấn đề, tạo issue trên GitHub hoặc liên hệ team.
