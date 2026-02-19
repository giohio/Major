import { createContext, useContext } from 'react';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'user' | 'doctor' | 'admin';
  avatar_url?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, additionalData?: any) => Promise<User>;
  loginWithOAuth: (provider: 'google' | 'facebook', firebaseUser: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
