import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import { AuthHeader } from "../components/layout/AuthHeader";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isBanned: boolean;
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 👇 متغير لتخزين نص البحث
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user || user.role !== "Admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // جلب المستخدمين (مع البحث)
  const fetchUsers = async (search = "") => {
    setLoading(true);
    try {
      // نبعث كلمة البحث للباك إند
      const endpoint = search 
        ? `${API_BASE}/api/admin/users?search=${encodeURIComponent(search)}` 
        : `${API_BASE}/api/admin/users`;

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  // أول ما تفتح الصفحة، جيب الكل
  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  // عند الضغط على زر البحث
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchTerm);
  };

  const toggleBan = async (userId: string) => {
    if (!confirm("Are you sure you want to change this user's status?")) return;

    try {
      const response = await fetch(`${API_BASE}/api/admin/toggle-ban/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setUsers(users.map(u => 
          u.id === userId ? { ...u, isBanned: !u.isBanned } : u
        ));
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      alert("Error connecting to server");
    }
  };

  return (
    <div className="app">
      <AuthHeader />
      <div className="page-center" style={{ justifyContent: 'flex-start', paddingTop: '40px' }}>
        <div className="layout" style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 className="hero-name">Admin Dashboard 🛡️</h1>
            <p className="hero-title">Manage users and content</p>
          </div>

          {/* 👇 قسم البحث الجديد */}
          <div className="card" style={{ marginBottom: '20px', padding: '15px' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                className="auth-input"
                style={{ marginBottom: 0 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="auth-btn" style={{ width: 'auto' }}>Search 🔍</button>
              {searchTerm && (
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => { setSearchTerm(""); fetchUsers(""); }}
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          {/* الجدول */}
          <div className="card" style={{ overflowX: 'auto' }}>
            {loading ? (
               <div style={{ textAlign: 'center', padding: '20px' }}>Loading users...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Email</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px' }}>{u.firstName} {u.lastName}</td>
                      <td style={{ padding: '12px' }} className="muted">{u.email}</td>
                      <td style={{ padding: '12px' }}>
                        {u.isBanned ? (
                          <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5' }}>Banned 🚫</span>
                        ) : (
                          <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#86efac' }}>Active ✅</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {u.email !== user?.email && (
                          <button 
                            onClick={() => toggleBan(u.id)}
                            className="btn"
                            style={{ 
                              fontSize: '12px', 
                              background: u.isBanned ? '#22c55e' : '#ef4444',
                              border: 'none'
                            }}
                          >
                            {u.isBanned ? "Unban" : "Ban"}
                          </button>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                        No users found matching "{searchTerm}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}