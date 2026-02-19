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
          <Route path="/" element={<HomePage />} />

          <Route path="/login" element={<LoginPage />} />

          {/* Community - public (guests can view, logged-in can post) */}
          <Route path="/community" element={<CommunityPage />} />
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