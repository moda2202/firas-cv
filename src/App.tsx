import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
// RequireAuth still available for other protected routes if needed
import CommunityPage from "./pages/CommunityPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import { MoneyManagerPage } from "./pages/MoneyManagerPage";
import { RequireAuth } from "./routes/RequireAuth";
import { MonthDetailsPage } from "./pages/MonthDetailsPage";


export default function App() {
  const baseUrl = import.meta.env.BASE_URL;

  return (
    <AuthProvider>
      <Router basename={baseUrl}>
        <Routes>
          {/* 👇 1. المنصة (Nexovo) صارت هي الواجهة الرئيسية للموقع */}
          <Route path="/" element={<CommunityPage />} />

          {/* 👇 2. السيرة الذاتية صار إلها رابط فرعي فخم */}
          <Route path="/cv" element={<HomePage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/money-manager"
            element={
              <RequireAuth>
                <MoneyManagerPage />
              </RequireAuth>
            }
          />
          <Route
            path="/money-manager/:id"
            element={
              <RequireAuth>
                <MonthDetailsPage />
              </RequireAuth>
            }
          />

          <Route path="/admin" element={<AdminDashboard />} />
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}