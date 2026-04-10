"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, authService } from "@/services/authService";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ token: string; user: User }>;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isClient: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  async function login(username: string, password: string) {
    const data = await authService.login(username, password);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  }

  const isAuthenticated = () => !!user && !!token;
  const isAdmin = () => user?.role === "master_admin";
  const isClient = () => user?.role === "client_user";

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, isAuthenticated, isAdmin, isClient }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
