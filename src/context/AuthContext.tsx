// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

// 1. User Interface
interface User {
  id: string;
  email: string;
  firstName: string;
  role: string;
}

// User Context Interface
interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

// Moved outside the component so it can be used in initial state
const decodeUser = (token: string): User | null => {
  try {
    const decoded: any = jwtDecode(token);
    return {
      id: decoded.nameid || decoded.sub || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
      email: decoded.email || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
      firstName: String(decoded.given_name || decoded.unique_name || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"] || "User"),
      role: decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "User"
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("siteToken"));
  // Initialize user synchronously from token to avoid race condition
  const [user, setUser] = useState<User | null>(() => {
    const savedToken = localStorage.getItem("siteToken");
    return savedToken ? decodeUser(savedToken) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("siteToken", token);
      setUser(decodeUser(token));
    } else {
      localStorage.removeItem("siteToken");
      setUser(null);
    }
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};