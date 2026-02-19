import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { API_BASE } from "../config";
import { AuthHeader } from "../components/layout/AuthHeader";

// 👇 استيراد مكتبة الترجمة
import { useTranslation } from "react-i18next";

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
  const { token, user } = useAuth();
  
  // 👇 تفعيل الترجمة
  const { t, i18n } = useTranslation();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showMyComments, setShowMyComments] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const fetchComments = async (search = "") => {
    setLoading(true);
    try {
      let endpoint = showMyComments && token
        ? `${API_BASE}/api/community/my-comments`
        : `${API_BASE}/api/community`;
      
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
    if (!token) setShowMyComments(false);
    if (!searchTerm) fetchComments(); 
    else fetchComments(searchTerm);
  }, [showMyComments, token]);

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
      alert(t('comm_failed_post', "Failed to post comment!"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm(t('comm_delete_confirm', "Are you sure you want to delete this comment?"))) return;
    try {
      const response = await fetch(`${API_BASE}/api/community/${commentId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId));
      } else {
        alert(t('comm_failed_delete', "Failed to delete comment"));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (commentId: number) => {
    if (!editText.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/api/community/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editText }),
      });

      if (response.ok) {
        setComments(comments.map(c => 
          c.id === commentId ? { ...c, content: editText } : c
        ));
        setEditingId(null);
      } else {
        alert(t('comm_failed_update', "Failed to update comment"));
      }
    } catch (error) {
      alert(t('comm_error_update', "Error updating comment"));
    }
  };

  // 👇 التاريخ صار يتكيف مع لغة المستخدم تلقائياً
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="app">
      <AuthHeader />

      <div className="page-center" style={{ justifyContent: 'flex-start', paddingTop: '40px' }}>
        <div className="layout" style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '700px' }}>

          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 className="hero-name" style={{ fontSize: '2.5rem' }}>{t('comm_title', 'Community Wall')} 🌍</h1>
            <p className="hero-title">{t('comm_subtitle', 'Share your thoughts, feedback, or say hi!')}</p>
          </div>

          <div className="card" style={{ marginBottom: '20px', padding: '15px' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder={t('comm_search_placeholder', 'Search comments or users...')}
                className="auth-input"
                style={{ marginBottom: 0 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="auth-btn" style={{ width: 'auto' }}>
                {t('comm_search_btn', 'Search')} 🔍
              </button>
              {searchTerm && (
                <button type="button" className="btn" onClick={() => { setSearchTerm(""); fetchComments(""); }}>
                  {t('comm_clear_btn', 'Clear')}
                </button>
              )}
            </form>
          </div>

          {token ? (
            <div className="card" style={{ marginBottom: '24px' }}>
              <form onSubmit={handlePost}>
                <textarea
                  className="auth-input"
                  rows={3}
                  placeholder={t('comm_whats_on_mind', "What's on your mind, {{name}}?", { name: user?.firstName || t('comm_friend', 'friend') })}
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
                    {showMyComments ? t('comm_show_all', "Show All") : t('comm_show_mine', "Show My Comments")}
                  </button>
                  <button type="submit" className="auth-btn" style={{ width: 'auto', padding: '10px 24px' }} disabled={submitting || !newComment.trim()}>
                    {submitting ? t('comm_posting', "Posting...") : `${t('comm_post_btn', "Post Comment")} 🚀`}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '30px', marginBottom: '24px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <h3>{t('comm_join_title', 'Join the conversation!')} 💬</h3>
              <p className="muted" style={{ marginBottom: '16px' }}>{t('comm_join_subtitle', 'Log in to share your feedback and post comments.')}</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <Link to="/login" className="auth-btn" style={{ width: 'auto', textDecoration: 'none' }}>{t('nav_login', 'Log In')}</Link>
                <Link to="/register" className="btn">{t('nav_register', 'Sign Up')}</Link>
              </div>
            </div>
          )}

          <div className="timeline">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <span className="auth-spinner" style={{ display: 'inline-block', width: '30px', height: '30px' }}></span>
              </div>
            ) : comments.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <p className="muted">
                  {searchTerm ? t('comm_no_results', 'No results found for "{{search}}"', { search: searchTerm }) : `${t('comm_no_comments', 'No comments yet. Be the first to say hi!')} 👋`}
                </p>
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
                      {comment.user?.firstName ? comment.user.firstName[0].toUpperCase() : "?"}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>
                          {comment.user?.firstName ? `${comment.user.firstName} ${comment.user.lastName || ''}` : t('comm_unknown_user', "Unknown User")}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="small muted">{formatDate(comment.createdAt)}</span>

                          {user && (
                            <>
                              {user.id === comment.userId && editingId !== comment.id && (
                                <button
                                  onClick={() => startEditing(comment)}
                                  className="icon-btn"
                                  title={t('comm_edit_tooltip', "Edit comment")}
                                  style={{ color: '#fbbf24', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                                >
                                  ✏️
                                </button>
                              )}

                              {(user.id === comment.userId || user.role === "Admin") && editingId !== comment.id && (
                                <button
                                  onClick={() => handleDelete(comment.id)}
                                  className="icon-btn"
                                  style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                                  title={t('comm_delete_tooltip', "Delete comment")}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {editingId === comment.id ? (
                        <div style={{ marginTop: '8px' }}>
                          <textarea
                            className="auth-input"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={2}
                            style={{ marginBottom: '8px' }}
                          />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => saveEdit(comment.id)} className="btn primary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>{t('comm_save_btn', 'Save')}</button>
                            <button onClick={cancelEditing} className="btn ghost" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>{t('comm_cancel_btn', 'Cancel')}</button>
                          </div>
                        </div>
                      ) : (
                        <p style={{ margin: 0, lineHeight: '1.6', color: 'rgba(255,255,255,0.85)' }}>
                          {comment.content}
                        </p>
                      )}
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