import { createContext } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'doctor' | 'admin';
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'user' | 'doctor' | 'admin') => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
