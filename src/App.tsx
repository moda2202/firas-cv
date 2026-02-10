import { useEffect, useMemo, useRef, useState } from "react";
import "./index.css";
import type { Cv, Certificate } from "./types/cv";

const API_BASE = import.meta.env.VITE_API_BASE ?? "https://localhost:7256";

function badgeText(text: string) {
  return text.trim();
}

export default function App() {
  const [cv, setCv] = useState<Cv | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  // NAV states
  const [navOpen, setNavOpen] = useState(false);     // mobile menu
  const [cvOpen, setCvOpen] = useState(false);       // CV dropdown
  const [activeSection, setActiveSection] = useState("summary");

  // UX
  const [copied, setCopied] = useState(false);

  const cvMenuRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);

  const navItems = useMemo(
    () => [
      { id: "summary", label: "Summary" },
      { id: "skills", label: "Skills" },
      { id: "education", label: "Education" },
      { id: "experience", label: "Experience" },
      { id: "certificates", label: "Certificates" },
      { id: "projects", label: "Projects" },
    ],
    []
  );

  // Load CV
  useEffect(() => {
    const ac = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE}/api/cv`, { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Cv;
        setCv(data);
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e?.message ?? "Failed to load CV");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => ac.abort();
  }, []);

  const links = useMemo(() => cv?.profile.links ?? {}, [cv]);

  // ScrollSpy: يحدد أي section انت واقف عليه
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("section[id]"));
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

        if (best?.target?.id) setActiveSection(best.target.id);
      },
      { threshold: [0.2, 0.4, 0.6] }
    );

    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  // Close dropdown/menu on outside click + ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCvOpen(false);
        setNavOpen(false);
      }
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (cvMenuRef.current && !cvMenuRef.current.contains(target)) setCvOpen(false);
      if (navRef.current && !navRef.current.contains(target)) setNavOpen(false);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  // Modal UX (ESC + lock scroll)
  useEffect(() => {
    if (!selectedCert) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedCert(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [selectedCert]);

  async function copyEmail(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      window.prompt("Copy email:", email);
    }
  }

  function goToSection(id: string) {
    setCvOpen(false);
    setNavOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  }

  function onCommunityClick() {
    setCvOpen(false);
    setNavOpen(false);
    alert("Community page: coming soon 👋");
  }

  if (loading) {
    return (
      <div className="page-center">
        <div className="card glass">
          <div className="spinner" />
          <div className="muted">Loading DynamicCV…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-center">
        <div className="card glass">
          <div className="h2">Couldn’t load CV</div>
          <div className="muted">Error: {error}</div>
          <div className="muted small">Check that API is running and API_BASE is correct.</div>
        </div>
      </div>
    );
  }

  if (!cv) return <div className="page-center">No data</div>;

  return (
    <div className="app">
      {/* Top Bar */}
      <header className="topbar">
        <div className="brand">
          <div className="logo">CV</div>
          <div>
            <div className="brand-title">Firas CV</div>

          </div>
        </div>

        {/* NAV */}
        <div className="nav-wrap" ref={navRef}>
          <button className="btn ghost menu-btn" onClick={() => setNavOpen((v) => !v)}>
            Menu
          </button>

          <nav className={`nav ${navOpen ? "open" : ""}`}>
            {/* CV dropdown */}
            <div className="nav-group" ref={cvMenuRef}>
              <button
                className="nav-btn"
                onClick={() => setCvOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={cvOpen}
              >
                CV <span style={{ opacity: 0.7 }}>▾</span>
              </button>

              <div className={`dropdown ${cvOpen ? "open" : ""}`} role="menu">
                {navItems.map((x) => (
                  <a
                    key={x.id}
                    href={`#${x.id}`}
                    className={activeSection === x.id ? "active" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      goToSection(x.id);
                    }}
                  >
                    <span>{x.label}</span>
                    {activeSection === x.id ? <span className="badge-mini">●</span> : null}
                  </a>
                ))}
              </div>
            </div>

            {/* Community */}
            <a
              className="nav-link"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onCommunityClick();
              }}
              title="Coming soon"
            >
              Community
            </a>
          </nav>
        </div>
      </header>

      <main className="layout">
        {/* Left Column */}
        <aside className="sidebar">
          <section className="card glass hero">
            <div className="hero-name">{cv.profile.fullName}</div>
            <div className="hero-title">{cv.profile.title}</div>
            {cv.profile.avatarUrl && (
              <img
                className="hero-avatar"
                src={`${API_BASE}${cv.profile.avatarUrl}`}
                alt="Profile photo"
                loading="lazy"
              />
            )}
            <div className="hero-meta">
              <span>{cv.profile.location}</span>
              <span>•</span>
              <a href={`mailto:${cv.profile.email}`}>{cv.profile.email}</a>
            </div>

            <div className="hero-actions">
              {links.github && (
                <a className="btn" href={links.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              )}
              {links.linkedin && (
                <a className="btn" href={links.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              )}
              <button className="btn ghost" onClick={() => copyEmail(cv.profile.email)} title="Copy email">
                {copied ? "Copied ✅" : "Copy Email"}
              </button>
              <button className="btn ghost" onClick={() => window.print()} title="Save as PDF">
                Download PDF
              </button>
            </div>

            <div className="divider" />

            <div className="info-grid">
              <div className="info">
                <div className="label">Phone</div>
                <div className="value">
                  <a href={`tel:${cv.profile.phone}`}>{cv.profile.phone}</a>
                </div>
              </div>
              <div className="info">
                <div className="label">GitHub</div>
                <div className="value">@{cv.profile.githubUsername}</div>
              </div>
              <div className="info">
                <div className="label">Driving License</div>
                <div className="value">
                  {cv.drivingLicense?.typeB ? "B" : "-"}
                  {cv.drivingLicense?.truckCard ? " • Truck card" : ""}
                </div>
              </div>
            </div>
          </section>

          <section className="card glass">
            <div className="section-title">Languages</div>
            <div className="badges">
              {cv.languages?.map((l) => (
                <span key={l.name} className="badge">
                  {badgeText(l.name)} <span className="badge-muted">• {badgeText(l.level)}</span>
                </span>
              ))}
            </div>
          </section>

          <section className="card glass">
            <div className="section-title">Interests</div>
            <div className="badges">
              {cv.interests?.map((i) => (
                <span key={i} className="badge">
                  {badgeText(i)}
                </span>
              ))}
            </div>
          </section>
        </aside>

        {/* Right Column */}
        <section className="content">
          <section id="summary" className="card glass">
            <div className="section-head">
              <div>
                <div className="h2">Summary</div>
                <div className="muted">Short professional overview</div>
              </div>
            </div>
            <p className="p">{cv.summary}</p>
          </section>

          <section id="skills" className="card glass">
            <div className="section-head">
              <div>
                <div className="h2">Skills</div>
                <div className="muted">Technologies & tools</div>
              </div>
            </div>

            <div className="cols">
              <div className="col">
                <div className="subhead">Languages & Frameworks</div>
                <div className="badges">
                  {cv.itCompetences?.languagesAndFrameworks?.map((s) => (
                    <span className="badge" key={s}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="col">
                <div className="subhead">Databases</div>
                <div className="badges">
                  {cv.itCompetences?.databases?.map((s) => (
                    <span className="badge" key={s}>
                      {s}
                    </span>
                  ))}
                </div>

                <div className="subhead" style={{ marginTop: 14 }}>
                  Tools & Platforms
                </div>
                <div className="badges">
                  {cv.itCompetences?.toolsAndPlatforms?.map((s) => (
                    <span className="badge" key={s}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="education" className="card glass">
            <div className="section-head">
              <div>
                <div className="h2">Education</div>
                <div className="muted">Programs & highlights</div>
              </div>
            </div>

            <div className="timeline">
              {cv.education?.map((e) => (
                <div key={e.program} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-body">
                    <div className="row">
                      <div className="strong">{e.program}</div>
                      <div className="muted small">{e.period}</div>
                    </div>
                    <div className="muted">
                      {e.school} • {e.location}
                    </div>
                    <ul className="list">
                      {e.highlights?.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="experience" className="card glass">
            <div className="section-head">
              <div>
                <div className="h2">Experience</div>
                <div className="muted">Work history</div>
              </div>
            </div>

            <div className="timeline">
              {cv.workExperience?.map((w) => (
                <div key={w.title + w.company} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-body">
                    <div className="row">
                      <div className="strong">{w.title}</div>
                      <div className="muted small">{w.period}</div>
                    </div>
                    <div className="muted">
                      {w.company} • {w.location}
                    </div>
                    <ul className="list">
                      {w.bullets?.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="certificates" className="card glass">
            <div className="section-head">
              <div>
                <div className="h2">Certificates</div>
                <div className="muted">Click to open details</div>
              </div>
            </div>

            <div className="grid">
              {cv.certificates?.map((c) => (
                <button key={c.name} className="tile" onClick={() => setSelectedCert(c)}>
                  <div className="cert-header">
                    {c.logoUrl && (
                      <img
                        className="cert-logo"
                        src={`${API_BASE}${c.logoUrl}`}
                        alt={`${c.issuer} logo`}
                        loading="lazy"
                      />
                    )}
                    <div className="tile-title">{c.name}</div>
                  </div>

                  <div className="tile-meta">
                    {c.issuer} • {c.status}
                    {c.period ? ` • ${c.period}` : ""}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section id="projects" className="card glass">
            <div className="section-head">
              <div>
                <div className="h2">Projects</div>
                <div className="muted">Highlights</div>
              </div>
            </div>

            <div className="grid">
              {cv.projects?.map((p) => (
                <div key={p.name} className="tile static">
                  <div className="tile-title">{p.name}</div>
                  <div className="p muted">{p.description}</div>
                </div>
              ))}
            </div>
          </section>

          <footer className="footer muted small">
            Built with ASP.NET Core Web API + React Vite • Data source: cv.json
          </footer>
        </section>
      </main>

      {/* Modal */}
      {selectedCert && (
        <div className="modal-backdrop" onClick={() => setSelectedCert(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div className="modal-title">{selectedCert.name}</div>
                <div className="muted">
                  {selectedCert.issuer} • {selectedCert.status}
                  {selectedCert.period ? ` • ${selectedCert.period}` : ""}
                </div>
              </div>
              <button className="btn" onClick={() => setSelectedCert(null)}>
                Close (Esc)
              </button>
            </div>

            <div className="divider" />

            <div className="modal-body">
              <div className="subhead">What to add next</div>
              <ul className="list">
                <li>Upload certificate PDF/image in the repo</li>
                <li>Add a short description of what you learned</li>
                <li>Add related project link (if applicable)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
