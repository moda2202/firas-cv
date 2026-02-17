// src/components/certificates/CertificateModal.tsx
import { useEffect } from "react";
import type { Certificate } from "../../types/cv";
import { API_BASE } from "../../config";

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export function CertificateModal({
  certificate,
  onClose,
}: CertificateModalProps) {
  useEffect(() => {
    if (!certificate) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [certificate, onClose]);

  if (!certificate) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{certificate.name}</div>
            <div className="muted">
              {certificate.issuer} • {certificate.status}
              {certificate.period ? ` • ${certificate.period}` : ""}
            </div>
          </div>
          <button className="btn" onClick={onClose}>
            Close (Esc)
          </button>
        </div>

        <div className="divider" />

        <div className="modal-body">
          {certificate.imageUrl && certificate.name === "IT-Technician Alignment — SharePoint Online Diploma" ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <img
                src={`${API_BASE}${certificate.imageUrl}`}
                alt={certificate.name}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '60vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: '#000'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <a
                  href={`${API_BASE}${certificate.imageUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn primary"
                >
                  🔍 View Full Image
                </a>
              </div>
            </div>
          ) : certificate.name === "Fullstack .NET Developer Diploma" ? (
            <div style={{ padding: '24px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ lineHeight: '1.8', color: 'rgba(255,255,255,0.95)', fontSize: '1.05rem' }}>
                <p>
                  This comprehensive diploma program is structured in several critical stages. It begins with a digital information meeting and an immediate pre-test to evaluate candidates. Those who succeed undergo a rigorous <strong>Test and Mapping (ToK)</strong> phase throughout late October.
                </p>
                <p style={{ marginTop: '16px' }}>
                  The main technical training spans six months, starting <strong>November 3rd</strong> and concluding <strong>April 29th, 2026</strong>. This intensive period is designed for those who demonstrate high potential during the selection process.
                </p>
                <p style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '4px solid rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
                  The journey concludes with a professional internship (APL/praktik) from <strong>April 30th to August 10th, 2026</strong>
                </p>
              </div>
            </div>
          ) : certificate.name === "B.Sc. Software Engineering" ? (
            <div style={{ padding: '20px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                I have completed 165 HP (Higher Education Credits). My degree project (graduation project) is remaining, which is scheduled to be completed by June 2026.
              </p>
            </div>
          ) : (
            <>
              <div className="subhead">What to add next</div>
              <ul className="list">
                <li>Upload certificate image in the repo</li>
                <li>Add a short description of what you learned</li>
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
