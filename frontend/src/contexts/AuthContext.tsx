import { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './auth';
import type { User } from './auth';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const login = async (email: string, _password: string): Promise<User> => {
    // TODO: Replace with real API call to /api/auth/login
    // Backend will return user data with role
    // For now, mock response based on email:
    let role: 'user' | 'doctor' | 'admin' = 'user';
    
    // Demo: detect role from email
    if (email.includes('doctor') || email.includes('bsi')) {
      role = 'doctor';
    } else if (email.includes('admin')) {
      role = 'admin';
    }
    
    const mockResponse: User = {
      id: '1',
      name: role === 'admin' ? 'Admin User' : role === 'doctor' ? 'Dr. Nguyễn' : 'Test User',
      email,
      role // Backend determines this
    };
    setUser(mockResponse);
    return mockResponse;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
