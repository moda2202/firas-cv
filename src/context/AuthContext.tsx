// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
// 1. تعريف شكل البيانات (Types)
interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// إنشاء السياق بقيمة مبدئية غير معرفة
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. المزود (Provider)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // نحاول قراءة التوكن من الذاكرة عند بدء التشغيل
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("siteToken")
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem("siteToken", token);
    } else {
      localStorage.removeItem("siteToken");
    }
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  // المتغير isAuthenticated يسهل علينا الفحص في باقي الصفحات
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. هوك مخصص (Custom Hook) لسهولة الاستخدام
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};