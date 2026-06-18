"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (access: string, refresh: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token");
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = React.useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setAccessToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  const fetchUser = React.useCallback(async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Failed to fetch user", error);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const login = React.useCallback((access: string, refresh: string) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    setAccessToken(access);
    fetchUser(access);
    router.push("/history");
  }, [fetchUser, router]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
