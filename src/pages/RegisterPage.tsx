import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE } from "../config";
import { AuthHeader } from "../components/layout/AuthHeader";
import { useTranslation } from "react-i18next";

/* ---- inline SVG icons ---- */
const UserIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg className="auth-field-icon" style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
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

function getPasswordStrength(pw: string): { score: number; labelKey: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 2) return { score, labelKey: "reg_pw_weak", color: "#ef4444" };
  if (score <= 3) return { score, labelKey: "reg_pw_fair", color: "#f59e0b" };
  if (score <= 4) return { score, labelKey: "reg_pw_good", color: "#3b82f6" };
  return { score, labelKey: "reg_pw_strong", color: "#22c55e" };
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { t, i18n } = useTranslation();

  // 👇 السحر البرمجي هنا أيضاً
  const isRtl = i18n.dir() === 'rtl';
  const iconStyle = isRtl ? { left: 'auto', right: '14px' } : {};
  const toggleStyle = isRtl ? { right: 'auto', left: '14px' } : {};
  const inputStyle = { paddingLeft: '45px', paddingRight: '45px' };

  const pwStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.errors?.[0]?.description || t('reg_failed', "Registration failed!");
        throw new Error(errorMsg);
      }

      navigate("/login", {
        state: {
          message: t('reg_success', "Registration successful! Please check your email to confirm your account before logging in."),
        },
      });
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
            <div className="auth-logo">✨</div>
            <h2 className="auth-title">{t('reg_title', 'Create Account')}</h2>
            <p className="auth-subtitle">{t('reg_subtitle', 'Join the DynamicCV community')}</p>
          </div>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">

            <div className="auth-row">
              <div className="auth-field">
                <UserIcon style={iconStyle} />
                <input
                  name="firstName"
                  className="auth-input"
                  style={inputStyle}
                  placeholder={t('reg_first_name', 'First name')}
                  onChange={handleChange}
                  required
                  minLength={2}
                  autoComplete="given-name"
                />
              </div>
              <div className="auth-field">
                <UserIcon style={iconStyle} />
                <input
                  name="lastName"
                  className="auth-input"
                  style={inputStyle}
                  placeholder={t('reg_last_name', 'Last name')}
                  onChange={handleChange}
                  required
                  minLength={2}
                  autoComplete="family-name"
                />
              </div>
            </div>
            <p className="muted" style={{ fontSize: '0.75rem', marginTop: '-4px', marginBottom: '8px' }}>
              {t('reg_name_hint', 'Names must be at least 2 characters, letters only.')}
            </p>

            <div className="auth-field">
              <MailIcon style={iconStyle} />
              <input
                name="email"
                type="email"
                className="auth-input"
                style={inputStyle}
                placeholder={t('reg_email', 'Email address')}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <LockIcon style={iconStyle} />
              <input
                name="password"
                type={showPw ? "text" : "password"}
                className="auth-input"
                style={inputStyle}
                placeholder={t('reg_password', 'Create a strong password')}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button type="button" className="auth-toggle-pw" style={toggleStyle} onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {formData.password && (
              <>
                <div className="pw-strength-bar">
                  <div
                    className="pw-strength-fill"
                    style={{ width: `${(pwStrength.score / 5) * 100}%`, background: pwStrength.color }}
                  />
                </div>
                <div className="pw-strength-text" style={{ color: pwStrength.color }}>
                  {t(pwStrength.labelKey)}
                </div>
              </>
            )}

            <button type="submit" className="auth-btn green" disabled={loading}>
              {loading ? <><span className="auth-spinner" /> {t('reg_creating', 'Creating account...')}</> : t('reg_btn', 'Create Account')}
            </button>
          </form>

          <div className="auth-footer">
            {t('reg_already_have', 'Already have an account?')} <Link to="/login">{t('reg_sign_in', 'Sign in')}</Link>
          </div>
        </div>
      </div>
    </>
  );
}