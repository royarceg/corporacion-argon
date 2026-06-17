"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, authService } from "@/services/authService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ user: User }>;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isClient: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaurar el usuario desde localStorage al montar.
  // La sesión REAL vive en la cookie httpOnly (invisible para JS); esto es solo
  // estado de UI. Si el localStorage está corrupto, lo limpiamos sin romper la app.
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem("user");
    }
    setLoading(false);
  }, []);

  async function login(username: string, password: string) {
    // El backend setea la cookie httpOnly con el JWT; aquí solo guardamos el user (UI).
    const data = await authService.login(username, password);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return { user: data.user };
  }

  async function logout() {
    try {
      await authService.logout(); // el backend limpia la cookie httpOnly
    } catch {
      // Aunque falle el backend, limpiamos del lado del cliente igual
    }
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  }

  const isAuthenticated = () => !!user;
  const isAdmin = () => user?.role === "master_admin";
  const isClient = () => user?.role === "client_user";

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAuthenticated, isAdmin, isClient }}
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
