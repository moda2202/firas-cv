import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { API_BASE } from "../config";
import { AuthHeader } from "../components/layout/AuthHeader";

// Define shape of data appearing from backend
interface CommentUser {
  firstName: string;
  lastName: string;
  initial: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userId: string;
  user: CommentUser;
}

export default function CommunityPage() {
  const { token, user } = useAuth(); // user contains my id
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showMyComments, setShowMyComments] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchComments = async (search = "") => {
    setLoading(true);
    try {
      // بناء الرابط الأساسي
      let endpoint = showMyComments
        ? `${API_BASE}/api/community/my-comments`
        : `${API_BASE}/api/community`;

      // إضافة بارامتر البحث إذا وجد
      if (search) {
        endpoint += endpoint.includes('?') ? `&search=${search}` : `?search=${search}`;
      }

      const headers: any = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(endpoint, { headers });
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // إذا كان مربع البحث فارغاً، نجلب الكل. إذا فيه نص، نبقي النتيجة الحالية أو نعيد البحث
    // هنا سنعيد الجلب بدون بحث عند تغيير التبويب (Show All / My Comments) لتجنب تضارب الفلاتر
    if (!searchTerm) fetchComments();
    else fetchComments(searchTerm);
  }, [showMyComments, token]);

  // 👇 4. دالة التعامل مع زر البحث
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComments(searchTerm);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/community`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const createdComment = await response.json();
        setComments([createdComment, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      alert("Failed to post comment!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await fetch(`${API_BASE}/api/community/${commentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId));
      } else {
        alert("Failed to delete comment");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="app">
      <AuthHeader />

      <div className="page-center" style={{ justifyContent: 'flex-start', paddingTop: '40px' }}>
        <div className="layout" style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '700px' }}>

          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 className="hero-name" style={{ fontSize: '2.5rem' }}>Community Wall 🌍</h1>
            <p className="hero-title">Share your thoughts, feedback, or say hi!</p>
          </div>

          {token ? (
            <div className="card" style={{ marginBottom: '24px' }}>
              <form onSubmit={handlePost}>
                <textarea
                  className="auth-input"
                  rows={3}
                  placeholder={`What's on your mind, ${user?.firstName || 'friend'}?`}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{ resize: 'none', marginBottom: '12px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    className={`btn ${showMyComments ? 'primary' : 'ghost'}`}
                    onClick={() => setShowMyComments(!showMyComments)}
                    style={{ fontSize: '0.9rem', color: showMyComments ? '#6366f1' : 'inherit' }}
                  >
                    {showMyComments ? "Show All" : "Show My Comments"}
                  </button>

                  <button type="submit" className="auth-btn" style={{ width: 'auto', padding: '10px 24px' }} disabled={submitting || !newComment.trim()}>
                    {submitting ? "Posting..." : "Post Comment 🚀"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '30px', marginBottom: '24px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <h3>Join the conversation! 💬</h3>
              <p className="muted" style={{ marginBottom: '16px' }}>Log in to share your feedback and connect with others.</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <Link to="/login" className="auth-btn" style={{ width: 'auto', textDecoration: 'none' }}>Log In</Link>
                <Link to="/register" className="btn">Sign Up</Link>
              </div>
            </div>
          )}
          <div className="card" style={{ marginBottom: '20px', padding: '15px' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Search comments or users..."
                className="auth-input"
                style={{ marginBottom: 0 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="auth-btn" style={{ width: 'auto' }}>
                Search 🔍
              </button>

              {searchTerm && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => { setSearchTerm(""); fetchComments(""); }}
                >
                  Clear
                </button>
              )}
            </form>
          </div>
          <div className="timeline">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <span className="auth-spinner" style={{ display: 'inline-block', width: '30px', height: '30px' }}></span>
              </div>
            ) : comments.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <p className="muted">No comments yet. Be the first to say hi! 👋</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="card" style={{ animation: 'slideUpFade 0.4s ease', position: 'relative' }}>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <div style={{
                      width: '42px', height: '42px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                      display: 'grid', placeItems: 'center',
                      fontWeight: 'bold', fontSize: '18px', color: '#fff',
                      flexShrink: 0
                    }}>
                      {comment.user?.initial || "?"}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>
                          {comment.user?.firstName ? `${comment.user.firstName} ${comment.user.lastName || ''}` : "Unknown User"}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="small muted">{formatDate(comment.createdAt)}</span>

                          {/* User only delete button */}
                          {user && (user.id === comment.userId || user.role === "Admin") && (
                            <button
                              onClick={() => handleDelete(comment.id)}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: '#ef4444', padding: '4px', display: 'flex'
                              }}
                              title="Delete comment"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                          )}
                        </div>
                      </div>
                      <p style={{ margin: 0, lineHeight: '1.6', color: 'rgba(255,255,255,0.85)' }}>
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}