"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "@/lib/utils";

export interface User {
  id: string;
  email: string;
  role: "admin" | "student" | "staff";
  sub_role?: "lab_attendant" | "registering_nurse" | null;
  is_approved: boolean;
  is_suspended: boolean;
  suspension_reason?: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async (tok: string): Promise<User> => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
      { headers: { Authorization: `Bearer ${tok}` } }
    );
    if (!res.ok) throw new Error("Session expired");
    return res.json();
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("access_token");
    if (savedToken) {
      setToken(savedToken);
      fetchMe(savedToken)
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("access_token");
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const formData = new URLSearchParams({ username, password });
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || "Login failed");
    }
    const data: { access_token: string; token_type: string } = await res.json();
    localStorage.setItem("access_token", data.access_token);
    setToken(data.access_token);
    const me = await fetchMe(data.access_token);
    setUser(me);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  const refreshUser = async () => {
    if (!token) return;
    const me = await fetchMe(token);
    setUser(me);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
