# 🎨 Frontend Integration Guide

## ✅ Đã tạo các file sau:

### 1. **Configuration**
- `src/config/api.config.ts` - API endpoints và configuration

### 2. **Types**
- `src/types/api.types.ts` - TypeScript types cho tất cả API responses

### 3. **Services**
- `src/services/api.client.ts` - Base API client với fetch wrapper
- `src/services/auth.service.ts` - Authentication service
- `src/services/chat.service.ts` - Chat/AI service
- `src/services/user.service.ts` - User profile service
- `src/services/plan.service.ts` - Subscription plans service

### 4. **React Hooks**
- `src/hooks/useAuth.ts` - Hook cho authentication
- `src/hooks/useChat.ts` - Hook cho chat functionality
- `src/hooks/useUser.ts` - Hook cho user data
- `src/hooks/usePlans.ts` - Hook cho subscription plans

### 5. **Context**
- `src/contexts/AuthContext.tsx` - Global auth state management (đã có sẵn)

---

## 🚀 Cách sử dụng

### 1. Setup Environment

Tạo file `.env`:
```bash
cp .env.example .env
```

Cập nhật `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 2. Wrap App với AuthProvider

```tsx
// src/main.tsx hoặc src/App.tsx
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

### 3. Sử dụng trong Components

#### 📝 **Authentication**

```tsx
import { useAuthContext } from './contexts/AuthContext';

function LoginPage() {
  const { login, loading, error, isAuthenticated } = useAuthContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({
        email: 'user@example.com',
        password: 'password123'
      });
      // Redirect to dashboard
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <form onSubmit={handleLogin}>
      {error && <div className="error">{error}</div>}
      <input type="email" name="email" />
      <input type="password" name="password" />
      <button disabled={loading}>
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  );
}
```

#### 💬 **Chat với AI**

```tsx
import { useChat } from './hooks/useChat';
import { useEffect, useState } from 'react';

function ChatPage() {
  const { 
    messages, 
    sendMessage, 
    loading, 
    error,
    remainingChats,
    loadRecentSessions
  } = useChat();

  const [input, setInput] = useState('');

  useEffect(() => {
    loadRecentSessions();
  }, [loadRecentSessions]);

  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      const response = await sendMessage(input, true);
      
      // Kiểm tra emotion analysis
      if (response.emotion_analysis) {
        console.log('Emotion:', response.emotion_analysis.primary_emotion);
        console.log('Risk level:', response.emotion_analysis.risk_level);
      }

      // Kiểm tra alert
      if (response.alert) {
        console.warn('Alert created:', response.alert);
      }

      setInput('');
    } catch (err) {
      console.error('Failed to send:', err);
    }
  };

  return (
    <div className="chat-container">
      {/* Chat quota */}
      <div className="chat-quota">
        Còn lại: {remainingChats === 'unlimited' ? '∞' : remainingChats} tin nhắn
      </div>

      {/* Messages */}
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <p>{msg.content}</p>
            {msg.emotion_detected && (
              <span className="emotion">{msg.emotion_detected}</span>
            )}
            {msg.risk_level && msg.risk_level !== 'low' && (
              <span className={`risk ${msg.risk_level}`}>
                ⚠️ {msg.risk_level}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input">
        {error && <div className="error">{error}</div>}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi'}
        </button>
      </div>
    </div>
  );
}
```

#### 👤 **User Profile**

```tsx
import { useUser } from './hooks/useUser';
import { useEffect } from 'react';

function ProfilePage() {
  const { 
    profile, 
    subscription, 
    emotionStats,
    loadProfile, 
    loadSubscription,
    loadEmotionStats,
    updateProfile,
    loading 
  } = useUser();

  useEffect(() => {
    loadProfile();
    loadSubscription();
    loadEmotionStats('week');
  }, [loadProfile, loadSubscription, loadEmotionStats]);

  const handleUpdate = async () => {
    try {
      await updateProfile({
        full_name: 'New Name',
        phone: '0123456789'
      });
      alert('Profile updated!');
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Profile</h1>
      <p>Email: {profile?.email}</p>
      <p>Name: {profile?.full_name}</p>
      <p>Role: {profile?.role}</p>

      <h2>Subscription</h2>
      <p>Plan: {subscription?.subscription_plan}</p>
      <p>Status: {subscription?.subscription_status}</p>

      <h2>Emotion Stats (This Week)</h2>
      {emotionStats && (
        <>
          <p>Total logs: {emotionStats.total_logs}</p>
          <p>Average sentiment: {emotionStats.average_sentiment}</p>
          <p>Trend: {emotionStats.trend}</p>
          
          <h3>Emotion Distribution</h3>
          {Object.entries(emotionStats.emotion_distribution).map(([emotion, count]) => (
            <div key={emotion}>
              {emotion}: {count}
            </div>
          ))}
        </>
      )}

      <button onClick={handleUpdate}>Update Profile</button>
    </div>
  );
}
```

#### 💰 **Subscription Plans**

```tsx
import { usePlans } from './hooks/usePlans';
import { useEffect } from 'react';

function PlansPage() {
  const { plans, loadPlans, subscribe, loading } = usePlans();

  useEffect(() => {
    loadPlans('user'); // hoặc 'doctor'
  }, [loadPlans]);

  const handleSubscribe = async (planId: number) => {
    try {
      const response = await subscribe({
        plan_id: planId,
        billing_cycle: 'monthly',
        payment_method: 'vnpay'
      });

      // Redirect to payment URL
      window.location.href = response.payment_url;
    } catch (err) {
      console.error('Subscribe failed:', err);
    }
  };

  return (
    <div className="plans-grid">
      {plans.map((plan) => (
        <div key={plan.id} className="plan-card">
          <h3>{plan.name}</h3>
          <p>{plan.description}</p>
          <p className="price">
            {plan.price_monthly.toLocaleString('vi-VN')}₫/tháng
          </p>

          <ul className="features">
            <li>
              Chat limit: {plan.chat_limit === -1 ? '∞' : plan.chat_limit}
            </li>
            <li>Voice: {plan.voice_enabled ? '✅' : '❌'}</li>
            <li>Video: {plan.video_enabled ? '✅' : '❌'}</li>
            <li>
              Empathy layer: {plan.empathy_layer_enabled ? '✅' : '❌'}
            </li>
            <li>
              Doctor access: {plan.doctor_access ? '✅' : '❌'}
            </li>
          </ul>

          <button 
            onClick={() => handleSubscribe(plan.id)}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Subscribe'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

#### 🚨 **Protected Routes**

```tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from './contexts/AuthContext';

function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const { isAuthenticated, user, loading } = useAuthContext();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

// Usage in Router
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  
  {/* Protected routes */}
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/chat" element={<ChatPage />} />
    <Route path="/profile" element={<ProfilePage />} />
  </Route>

  {/* Doctor only */}
  <Route element={<ProtectedRoute allowedRoles={['doctor', 'admin']} />}>
    <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
    <Route path="/doctor/patients" element={<PatientsPage />} />
  </Route>

  {/* Admin only */}
  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
    <Route path="/admin" element={<AdminPanel />} />
  </Route>
</Routes>
```

---

## 📊 **Error Handling**

Tất cả services đều throw error có format:

```ts
interface ApiError {
  error: string;
  message?: string;
  details?: string;
  upgrade_required?: boolean;
  current_plan?: string;
}
```

Xử lý error:

```tsx
try {
  await chatService.sendMessage({ message: 'Hello' });
} catch (err) {
  const error = err as ApiError;
  
  if (error.upgrade_required) {
    alert(`Please upgrade from ${error.current_plan} to use this feature`);
    // Redirect to plans page
  } else {
    alert(error.error || 'Something went wrong');
  }
}
```

---

## 🎯 **Best Practices**

### 1. **Luôn check authentication**
```tsx
const { isAuthenticated } = useAuthContext();

if (!isAuthenticated) {
  return <Navigate to="/login" />;
}
```

### 2. **Handle loading states**
```tsx
if (loading) {
  return <LoadingSpinner />;
}
```

### 3. **Display errors to users**
```tsx
{error && (
  <div className="error-message">
    {error}
  </div>
)}
```

### 4. **Refresh user data khi cần**
```tsx
const { refreshUser } = useAuthContext();

// After updating profile
await updateProfile(data);
await refreshUser();
```

### 5. **Cleanup on unmount**
```tsx
useEffect(() => {
  loadData();

  return () => {
    // Cleanup if needed
  };
}, []);
```

---

## 🔐 **Token Management**

Tokens được tự động lưu trong localStorage:
- `access_token` - JWT access token (1 hour)
- `refresh_token` - Refresh token (30 days)
- `user` - User object

API client tự động:
- Thêm token vào headers
- Redirect về /login khi token expired
- Clear tokens khi 401

---

## 📝 **TypeScript Support**

Tất cả types đã được định nghĩa trong `src/types/api.types.ts`:

```tsx
import type { 
  User, 
  ChatMessage, 
  EmotionAnalysis,
  Plan 
} from './types/api.types';

const user: User = { ... };
const message: ChatMessage = { ... };
```

---

## 🚀 **Next Steps**

1. ✅ Copy .env.example sang .env
2. ✅ Wrap App với AuthProvider
3. ✅ Tạo Login/Register pages
4. ✅ Tạo Chat page với useChat
5. ✅ Tạo Profile page với useUser
6. ✅ Tạo Plans page với usePlans
7. ✅ Setup Protected Routes
8. ✅ Test tất cả flows

---

## 🎨 **Component Examples**

Xem thêm ví dụ trong các file:
- Login: Xem phần Authentication ở trên
- Chat: Xem phần Chat với AI ở trên
- Profile: Xem phần User Profile ở trên
- Plans: Xem phần Subscription Plans ở trên

---

## 💡 **Tips**

1. **Dùng React DevTools** để debug state
2. **Check Network tab** để xem API calls
3. **Console.log** responses để hiểu data structure
4. **Test error cases** (wrong password, network error, etc.)
5. **Handle edge cases** (empty states, loading states, error states)

---

✅ **Frontend services đã sẵn sàng!** Copy các ví dụ code ở trên vào components của bạn.
