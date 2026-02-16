import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config";

export default function CommunityPage() {
  const { token, logout } = useAuth();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // دالة لجلب البيانات السرية
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/community`, {
          method: "GET",
          headers: {
            // 🔑 هنا السحر! نرسل التوكن للسيرفر ليسمح لنا بالدخول
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch secret data");
        }

        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="page-center">
      <div className="card glass" style={{ maxWidth: "600px", width: "100%", padding: "2rem" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h1>🚀 Community Area</h1>
          <button
            onClick={logout}
            style={{ padding: "0.5rem 1rem", background: "#ff4757", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Logout
          </button>
        </div>

        {error && <div style={{ color: "red" }}>{error}</div>}

        {!data ? (
          <p>Loading secret data...</p>
        ) : (
          <div style={{ background: "#222", padding: "1.5rem", borderRadius: "8px", border: "1px solid #444" }}>
            <h3 style={{ color: "#2ed573" }}>{data.title}</h3>
            <p style={{ margin: "1rem 0" }}>{data.message}</p>
            <div style={{ background: "#000", padding: "1rem", fontFamily: "monospace", borderRadius: "4px" }}>
              SECRET CODE: <span style={{ color: "#ffa502", fontWeight: "bold" }}>{data.secretCode}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}