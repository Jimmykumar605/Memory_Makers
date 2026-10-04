"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserAccount, UserRole, Photographer } from "./types";
import { setAdminSession, clearAdminSession } from "./adminAuth";

interface AuthResponse {
  success?: boolean;
  error?: string;
  user?: UserAccount;
  photographer?: Photographer | null;
  redirectTo?: string;
  isPendingPhotographer?: boolean;
  isPendingApproval?: boolean;
}

interface SignupPayload {
  name: string;
  email: string;
  password?: string;
  role: "photographer" | "client";
  phone?: string;
  gender?: "male" | "female" | "other" | string;
  experienceYears?: number;
  city?: string;
  state?: string;
  businessName?: string;
  startingPrice?: number;
  tagline?: string;
}

interface AuthContextType {
  user: UserAccount | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (email: string, password: string, preferredRole?: "photographer" | "client") => Promise<AuthResponse>;
  signup: (payload: SignupPayload) => Promise<AuthResponse>;
  logout: (redirectTo?: string | null) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserSession: (updatedFields: Partial<UserAccount>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "memorymakers_active_session_v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      let activeEmail = "";
      let activeRole = "";

      // 1. Try reading cached user session from localStorage
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(AUTH_STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed) {
              setUser(parsed);
              activeEmail = parsed.email || "";
              activeRole = parsed.role || "";
            }
          } catch {
            // ignore
          }
        }
      }

      // 2. Query dynamic user session from API
      const headers: Record<string, string> = {};
      if (activeEmail) {
        headers["x-user-email"] = activeEmail;
        headers["x-user-role"] = activeRole;
      }

      const res = await fetch("/api/auth/me", { headers });
      const data = await res.json();
      if (data?.user) {
        setUser(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
        }
      }
    } catch {
      // Keep cached user if offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    const handleAuthChange = () => {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(AUTH_STORAGE_KEY);
        if (cached) {
          try {
            setUser(JSON.parse(cached));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener("mm_auth_changed", handleAuthChange);
    return () => window.removeEventListener("mm_auth_changed", handleAuthChange);
  }, [refreshUser]);

  const login = async (
    email: string,
    password: string,
    preferredRole?: "photographer" | "client"
  ): Promise<AuthResponse> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, preferredRole }),
      });

      const data: AuthResponse = await res.json();

      if (!res.ok || data.error) {
        return { error: data.error || "Authentication failed." };
      }

      if (data.user) {
        setUser(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
          if (data.user.role === "admin") {
            setAdminSession(data.user.email);
          }
          window.dispatchEvent(new Event("mm_auth_changed"));
        }
      }

      return data;
    } catch (err: any) {
      return { error: err.message || "Network error during authentication." };
    }
  };

  const signup = async (payload: SignupPayload): Promise<AuthResponse> => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: AuthResponse = await res.json();

      if (!res.ok || data.error) {
        return { error: data.error || "Account creation failed." };
      }

      if (data.user && !data.isPendingPhotographer) {
        setUser(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
          window.dispatchEvent(new Event("mm_auth_changed"));
        }
      }

      return data;
    } catch (err: any) {
      return { error: err.message || "Network error during account registration." };
    }
  };

  const logout = async (redirectTo: string | null = "/photographers") => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem("mm_active_photographer_id");
        localStorage.removeItem("memorymakers_active_session_v1");
        sessionStorage.clear();
        clearAdminSession();
        window.dispatchEvent(new Event("mm_auth_changed"));

        if (redirectTo) {
          window.location.href = redirectTo;
        }
      }
    }
  };

  const updateUserSession = (updatedFields: Partial<UserAccount>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event("mm_auth_changed"));
      }
      return updated;
    });
  };

  const isAuthenticated = Boolean(user && user.status === "active");
  const role = user?.role || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        role,
        login,
        signup,
        logout,
        refreshUser,
        updateUserSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
