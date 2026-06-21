import { createContext, useContext, useState, ReactNode } from "react";
import { useLocation } from "wouter";

type AuthUser = { id: number; name: string; email: string; role: string; status: string; avatarUrl: string | null; createdAt: string };
type AuthContextType = { user: AuthUser | null; token: string | null; isAuthenticated: boolean; login: (token: string, user: AuthUser) => void; logout: () => void };
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("nexuscrm_token"));
  const [user, setUser] = useState<AuthUser | null>(() => {
    try { return JSON.parse(localStorage.getItem("nexuscrm_user") || "null"); } catch { return null; }
  });

  const login = (t: string, u: AuthUser) => {
    localStorage.setItem("nexuscrm_token", t);
    localStorage.setItem("nexuscrm_user", JSON.stringify(u));
    setToken(t); setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("nexuscrm_token");
    localStorage.removeItem("nexuscrm_user");
    setToken(null); setUser(null);
    navigate("/login");
  };

  return <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
