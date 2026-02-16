import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// تأكد أن هذا الرابط هو نفس رابط الـ API (اللوكال)
const API_URL = "http://localhost:5135";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  });
  const [error, setError] = useState("");
  // const [success, setSuccess] = useState(false); // لم نعد بحاجة لهذا المتغير هنا لأننا سننتقل فوراً
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        // نحاول نقرأ رسالة الخطأ من السيرفر (مثلاً: الباسورد ضعيف)
        const errorData = await response.json().catch(() => null);
        // أحياناً الخطأ بيجي كمصفوفة errors
        const errorMsg = errorData?.errors?.[0]?.description || "Registration failed!";
        throw new Error(errorMsg);
      }

      // ✅ التعديل هنا: التوجيه فوراً مع رسالة
      navigate("/login", {
        state: {
          message: "🎉 Registration successful! Please check your email to confirm your account before logging in."
        }
      });

    } catch (err: any) {
      setError(err.message);
    }
  };

  // ستايلات سريعة
  const inputStyle = { width: "100%", padding: "0.75rem", borderRadius: "4px", border: "1px solid #444", background: "#222", color: "#fff" };
  const buttonStyle = { padding: "0.75rem", background: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };

  return (
    <div className="page-center">
      <div className="card glass" style={{ maxWidth: "400px", width: "100%", padding: "2rem" }}>
        <h2 style={{ marginBottom: "1.5rem" }}>Create Account ✨</h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input name="firstName" placeholder="First Name" onChange={handleChange} required style={inputStyle} />
            <input name="lastName" placeholder="Last Name" onChange={handleChange} required style={inputStyle} />
          </div>

          <input name="email" type="email" placeholder="Email" onChange={handleChange} required style={inputStyle} />
          <input name="password" type="password" placeholder="Password (Strong!)" onChange={handleChange} required style={inputStyle} />

          {error && <div style={{ color: "#ff4757", fontSize: "0.9rem" }}>⚠️ {error}</div>}

          <button type="submit" style={buttonStyle}>Register</button>

          <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.9rem" }}>
            Already have an account? <Link to="/login" style={{ color: "#007bff" }}>Login here</Link>
          </div>
        </form>
      </div>
    </div>
  );
}