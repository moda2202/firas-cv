import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react"; // استخدمنا type عشان التايب سكريبت ما يزعل

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // إذا مو مسجل دخول، ارميه على صفحة اللوجن
    // state={{ from: location }} عشان نرجعه للصفحة اللي كان بدو ياها بعد ما يسجل دخول
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};