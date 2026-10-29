import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User } from "../types/index.js";
import { api } from "../services/api.js";

import { DEFAULT_DEMO_USER } from "../services/clientBackend.js";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: { name: string; email: string; password: string; confirmPassword: string }) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateLocalUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const isLoggedOut = localStorage.getItem("career_framework_logged_out") === "true";
    if (isLoggedOut) return null;
    const saved = localStorage.getItem("career_framework_user");
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_DEMO_USER;
  });
  const [token, setToken] = useState<string | null>(() => {
    const isLoggedOut = localStorage.getItem("career_framework_logged_out") === "true";
    if (isLoggedOut) return null;
    return localStorage.getItem("career_framework_token") || ("demo_jwt_token_" + DEFAULT_DEMO_USER.id);
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const isLoggedOut = localStorage.getItem("career_framework_logged_out") === "true";
    if (isLoggedOut) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }
    try {
      const userData = await api.auth.getMe();
      if (userData) {
        setUser(userData);
        localStorage.setItem("career_framework_user", JSON.stringify(userData));
        const currentTok = localStorage.getItem("career_framework_token") || ("demo_jwt_token_" + userData.id);
        setToken(currentTok);
        localStorage.setItem("career_framework_token", currentTok);
      }
    } catch (err) {
      console.warn("Session refresh note:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    localStorage.removeItem("career_framework_logged_out");
    try {
      const res = await api.auth.login(credentials);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem("career_framework_token", res.token);
      localStorage.setItem("career_framework_user", JSON.stringify(res.user));
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; confirmPassword: string }) => {
    setIsLoading(true);
    localStorage.removeItem("career_framework_logged_out");
    try {
      const res = await api.auth.register(data);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem("career_framework_token", res.token);
      localStorage.setItem("career_framework_user", JSON.stringify(res.user));
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.setItem("career_framework_logged_out", "true");
    localStorage.removeItem("career_framework_token");
    localStorage.removeItem("career_framework_user");
  };

  const updateLocalUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem("career_framework_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateLocalUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
