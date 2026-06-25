'use client';

import React, { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (undefined === context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}