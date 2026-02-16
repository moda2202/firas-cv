import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function AuthHeader() {
    const { user, logout, token } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // دالة بسيطة لمعرفة هل الرابط فعال حالياً لتلوينه
    const isActive = (path: string) => location.pathname === path;

    // الحصول على الحرف الأول للاسم (أو U إذا لم يوجد)
    const userInitial = user?.firstName
        ? String(user.firstName).charAt(0).toUpperCase()
        : "U";

    return (
        <header className="topbar">
            {/* 1. Left: Brand / Logo */}
            <Link to="/" className="brand" style={{ textDecoration: "none" }}>
                <div className="logo">CV</div>
                <div>
                    <div className="brand-title">Firas CV</div>
                    <span className="brand-sub">Full Stack Dev</span>
                </div>
            </Link>

            {/* Mobile Menu Button (Hamburger) */}
            <button
                className="btn ghost menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{ fontSize: '1.2rem', padding: '8px', zIndex: 102 }}
            >
                {mobileMenuOpen ? "✕" : "☰"}
            </button>

            {/* Navigation Wrapper (Center + Right) */}
            <div className={`nav-wrap ${mobileMenuOpen ? "mobile-open" : ""}`}>

                {/* 2. Center: Navigation Links */}
                <nav className="nav-center">
                    <Link
                        to="/"
                        className={`nav-link ${isActive("/") ? "active" : ""}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        CV Resume
                    </Link>
                    <Link
                        to="/community"
                        className={`nav-link ${isActive("/community") ? "active" : ""}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Community
                    </Link>
                </nav>

                {/* 3. Right: Auth Action */}
                <div className="auth-actions">
                    {token ? (
                        // ✅ حالة تسجيل الدخول: عرض الاسم + زر الخروج
                        <div className="user-profile">
                            <div className="user-info">
                                <span className="user-name">Hi, {user?.firstName || 'User'}</span>
                                <div className="user-avatar">{userInitial}</div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="btn ghost small-btn"
                                title="Log Out"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                            </button>
                        </div>
                    ) : (
                        // 🔒 حالة الزائر: عرض تسجيل الدخول
                        <div className="guest-actions">
                            <Link to="/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                                Log In
                            </Link>
                            <Link to="/register" className="btn primary-btn" onClick={() => setMobileMenuOpen(false)}>
                                Join Now
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}