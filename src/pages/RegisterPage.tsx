import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE } from "../config";
import { AuthHeader } from "../components/layout/AuthHeader";

/* ---- inline SVG icons ---- */
const UserIcon = () => (
  <svg className="auth-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const MailIcon = () => (
  <svg className="auth-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
);
const LockIcon = () => (
  <svg className="auth-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
);

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 2) return { score, label: "Weak", color: "#ef4444" };
  if (score <= 3) return { score, label: "Fair", color: "#f59e0b" };
  if (score <= 4) return { score, label: "Good", color: "#3b82f6" };
  return { score, label: "Strong", color: "#22c55e" };
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
        const errorMsg = errorData?.errors?.[0]?.description || "Registration failed!";
        throw new Error(errorMsg);
      }

      navigate("/login", {
        state: {
          message: "Registration successful! Please check your email to confirm your account before logging in.",
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

          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo">✨</div>
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Join the DynamicCV community</p>
          </div>

          {/* Error */}
          {error && <div className="auth-error">⚠️ {error}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">

            {/* Name row */}
            <div className="auth-row">
              <div className="auth-field">
                <UserIcon />
                <input
                  name="firstName"
                  className="auth-input"
                  placeholder="First name"
                  onChange={handleChange}
                  required
                  minLength={2}
                  autoComplete="given-name"
                />
              </div>
              <div className="auth-field">
                <UserIcon />
                <input
                  name="lastName"
                  className="auth-input"
                  placeholder="Last name"
                  onChange={handleChange}
                  required
                  minLength={2}
                  autoComplete="family-name"
                />
              </div>
            </div>
            <p className="muted" style={{ fontSize: '0.75rem', marginTop: '-4px', marginBottom: '8px' }}>
              Names must be at least 2 characters, letters only.
            </p>

            {/* Email */}
            <div className="auth-field">
              <MailIcon />
              <input
                name="email"
                type="email"
                className="auth-input"
                placeholder="Email address"
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="auth-field">
              <LockIcon />
              <input
                name="password"
                type={showPw ? "text" : "password"}
                className="auth-input"
                placeholder="Create a strong password"
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button type="button" className="auth-toggle-pw" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* Password strength */}
            {formData.password && (
              <>
                <div className="pw-strength-bar">
                  <div
                    className="pw-strength-fill"
                    style={{
                      width: `${(pwStrength.score / 5) * 100}%`,
                      background: pwStrength.color,
                    }}
                  />
                </div>
                <div className="pw-strength-text" style={{ color: pwStrength.color }}>
                  {pwStrength.label}
                </div>
              </>
            )}

            <button type="submit" className="auth-btn green" disabled={loading}>
              {loading ? <><span className="auth-spinner" /> Creating account...</> : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </>
  );
}