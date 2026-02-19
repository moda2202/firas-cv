import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// 👇 1. استيراد هوك الترجمة وزر تغيير اللغات
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function AuthHeader() {
    const { user, logout, token } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // 👇 2. تفعيل هوك الترجمة (هاد هو العقل المدبر)
    const { t } = useTranslation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Helper to check active path
    const isActive = (path: string) => location.pathname === path;

    // Get user initial or 'U'
    const userInitial = user?.firstName
        ? String(user.firstName).charAt(0).toUpperCase()
        : "U";

    return (
        <header className="topbar">
            {/* 1. Left: Brand / Logo - التعديل الجديد لبراند Nexovo */}
            <Link to="/" className="brand" style={{ textDecoration: "none" }}>
                <div className="logo" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: '#fff', border: 'none' }}>
                    N
                </div>
                <div>
                    <div className="brand-title" style={{ letterSpacing: '1px' }}>NEXOVO</div>
                    <span className="brand-sub">By Firas Darwich</span>
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
                    {/* 👇 الواجهة الرئيسية صارت المنصة */}
                    <Link
                        to="/"
                        className={`nav-link ${isActive("/") ? "active" : ""}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        {t('nav_community', 'Nexovo Hub')} 🌍
                    </Link>

                    {/* 👇 السي في صار صفحة فرعية */}
                    <Link
                        to="/cv"
                        className={`nav-link ${isActive("/cv") ? "active" : ""}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        {t('nav_resume', 'My CV')} 📄
                    </Link>

                    {token && (
                        <Link
                            to="/money-manager"
                            className={`nav-link ${isActive("/money-manager") ? "active" : ""}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {t('nav_money', 'Money')} 💰
                        </Link>
                    )}

                    {user?.role === "Admin" && (
                        <Link
                            to="/admin"
                            className={`nav-link ${isActive("/admin") ? "active" : ""}`}
                            style={{ color: '#fca5a5', fontWeight: 'bold' }}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {t('nav_dashboard', 'Dashboard')} 🛡️
                        </Link>
                    )}
                </nav>

                {/* 3. Right: Auth Action */}
                <div className="auth-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>

                    {/* 👇 4. وضع زر تغيير اللغات هنا ليكون أنيقاً */}
                    <LanguageSwitcher />

                    {token ? (
                        <div className="user-profile">
                            <div className="user-info">
                                <span className="user-name">{t('nav_hi', 'Hi')}, {user?.firstName || 'User'}</span>
                                <div className="user-avatar">{userInitial}</div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="btn ghost small-btn"
                                title={t('nav_logout', 'Log Out')}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                            </button>
                        </div>
                    ) : (
                        <div className="guest-actions">
                            <Link to="/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                                {t('nav_login', 'Log In')}
                            </Link>
                            <Link to="/register" className="btn primary-btn" onClick={() => setMobileMenuOpen(false)}>
                                {t('nav_register', 'Join Now')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}