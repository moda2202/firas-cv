import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom"; // أضفنا useLocation
import { GoogleLogin } from '@react-oauth/google';
// ⚠️ هام: تأكد أن هذا الرابط هو نفس رابط الـ API تبعك (نفس اللي بملف .http)
const API_URL = "http://localhost:5135";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();


    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/google-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential: credentialResponse.credential }),
            });

            if (!response.ok) throw new Error("Google Login Failed");

            const data = await response.json();
            login(data.accessToken); // حفظ التوكن
            navigate("/community"); // تحويل للمجتمع

        } catch (err) {
            setError("Google login failed. Please try again.");
        }
    };
    // نقرأ الرسالة القادمة من صفحة التسجيل (إن وجدت)
    const successMessage = location.state?.message;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error("Login failed! Check your email or password.");
            }

            const data = await response.json();

            // حفظ التوكن
            login(data.accessToken);

            // توجيه المستخدم لصفحة المجتمع
            navigate("/community");

        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="page-center">
            <div className="card glass" style={{ maxWidth: "400px", width: "100%", padding: "2rem" }}>
                <h2 style={{ marginBottom: "1.5rem" }}>Login to Community 🚀</h2>

                {/* 👇 هنا بنعرض رسالة النجاح إذا كانت موجودة */}
                {successMessage && (
                    <div style={{
                        backgroundColor: "rgba(46, 213, 115, 0.1)",
                        border: "1px solid #2ed573",
                        color: "#2ed573",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        marginBottom: "1.5rem",
                        fontSize: "0.9rem",
                        textAlign: "center",
                        lineHeight: "1.4"
                    }}>
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem" }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #444", background: "#222", color: "#fff" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem" }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #444", background: "#222", color: "#fff" }}
                        />
                    </div>

                    {error && <div style={{ color: "#ff6b6b", fontSize: "0.9rem" }}>{error}</div>}

                    <button
                        type="submit"
                        style={{ marginTop: "1rem", padding: "0.75rem", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                    >
                        Sign In
                    </button>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => { setError("Google Login Failed"); }}
                            theme="filled_black"
                            shape="pill"
                        />
                    </div>
                    <div style={{ textAlign: "center", color: "#666", margin: "0.5rem 0" }}>OR</div>
                </form>

                <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.9rem" }}>
                    Don't have an account? <Link to="/register" style={{ color: "#007bff" }}>Register here</Link>
                </div>
            </div>
        </div>
    );
}