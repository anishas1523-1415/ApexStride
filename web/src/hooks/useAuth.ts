'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  username: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        apiClient.setToken(data.session.access_token);
        const userData = await apiClient.get<User>('/api/v1/auth/me');
        setUser(userData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;
      if (data.session?.access_token) {
        apiClient.setToken(data.session.access_token);
        const userData = await apiClient.get<User>('/api/v1/auth/me');
        setUser(userData);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) throw authError;
      if (data.session?.access_token) {
        apiClient.setToken(data.session.access_token);
        // Create local user record
        const userData = await apiClient.post<User>('/api/v1/auth/signup', {
          username,
          email,
          password,
        });
        setUser(userData);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      apiClient.clearToken();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };
}