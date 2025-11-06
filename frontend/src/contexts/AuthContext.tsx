import { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './auth';
import type { User } from './auth';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, _password: string, role: 'user' | 'doctor' | 'admin') => {
    // Mock login - replace with real API call
    setUser({
      id: '1',
      name: 'Test User',
      email,
      role
    });
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
