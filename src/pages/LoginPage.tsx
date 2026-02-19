import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { API_BASE } from "../config";
import { AuthHeader } from "../components/layout/AuthHeader";
import { useTranslation } from "react-i18next";

/* ---- inline SVG icons (تم إضافة خاصية style لتقبل التعديل برمجياً) ---- */
const MailIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg className="auth-field-icon" style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
);
const LockIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg className="auth-field-icon" style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);
const EyeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
const EyeOffIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
);

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const successMessage = location.state?.message;

    const { t, i18n } = useTranslation();
    
    // 👇 السحر البرمجي هنا (اكتشاف اللغة وتحديد الستايل الديناميكي)
    const isRtl = i18n.dir() === 'rtl';
    const iconStyle = isRtl ? { left: 'auto', right: '14px' } : {};
    const toggleStyle = isRtl ? { right: 'auto', left: '14px' } : {};
    const inputStyle = { paddingLeft: '45px', paddingRight: '45px' }; // مسافة أمان من الجهتين لحماية النص

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            const response = await fetch(`${API_BASE}/api/auth/google-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential: credentialResponse.credential }),
            });
            if (!response.ok) throw new Error(t('login_google_failed', "Google login failed. Please try again."));
            const data = await response.json();
            login(data.accessToken);
            navigate("/community");
        } catch (err: any) {
            setError(err.message || t('login_google_failed', "Google login failed. Please try again."));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/Auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) throw new Error(t('login_failed_msg', "Login failed! Check your email or password."));
            const data = await response.json();
            login(data.accessToken);
            navigate("/community");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AuthHeader />
            <div className="page-center">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-logo">🚀</div>
                        <h2 className="auth-title">{t('login_title', 'Welcome Back')}</h2>
                        <p className="auth-subtitle">{t('login_subtitle', 'Sign in to access the community')}</p>
                    </div>

                    {successMessage && <div className="auth-success">✅ {successMessage}</div>}
                    {error && <div className="auth-error">⚠️ {error}</div>}

                    <div className="auth-google-wrap">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError(t('login_google_failed', "Google Login Failed"))}
                            theme="filled_black"
                            shape="pill"
                            size="large"
                            width="320"
                        />
                    </div>

                    <div className="auth-divider">{t('login_or', 'or')}</div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-field">
                            {/* 👇 تمرير الستايل للأيقونة */}
                            <MailIcon style={iconStyle} />
                            <input
                                type="email"
                                className="auth-input"
                                style={inputStyle}
                                placeholder={t('login_email_placeholder', 'Email address')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="auth-field">
                            {/* 👇 تمرير الستايل للأيقونة */}
                            <LockIcon style={iconStyle} />
                            <input
                                type={showPw ? "text" : "password"}
                                className="auth-input"
                                style={inputStyle}
                                placeholder={t('login_password_placeholder', 'Password')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                            {/* 👇 تمرير الستايل لزر العين */}
                            <button type="button" className="auth-toggle-pw" style={toggleStyle} onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                                {showPw ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? <><span className="auth-spinner" /> {t('login_signing_in', 'Signing in...')}</> : t('login_sign_in_btn', 'Sign In')}
                        </button>
                    </form>

                    <div className="auth-footer">
                        {t('login_no_account', "Don't have an account?")} <Link to="/register">{t('login_create_account', 'Create one')}</Link>
                    </div>
                </div>
            </div>
        </>
    );
}