import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage"; // استوردنا الصفحة الجديدة
import { RequireAuth } from "./routes/RequireAuth"; // استوردنا الحارس
import CommunityPage from "./pages/CommunityPage"; // استوردنا صفحة المجتمع الجديدة
import RegisterPage from "./pages/RegisterPage";



export default function App() {
  const baseUrl = import.meta.env.BASE_URL;

  return (
    <AuthProvider>
      <Router basename={baseUrl}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          <Route path="/login" element={<LoginPage />} />

          {/* 👇 هنا وضعنا الحماية! غلفنا الصفحة بـ RequireAuth */}
          <Route 
            path="/community" 
            element={
              <RequireAuth>
                <CommunityPage /> {/* استبدال المكون القديم بالجديد */}
              </RequireAuth>
            } 
          />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}