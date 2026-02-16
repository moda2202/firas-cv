import "../index.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Certificate } from "../types/cv";

import { useCvData } from "../hooks/useCvData";
import { useScrollSpy } from "../hooks/useScrollSpy";

// 👇 نستخدم الهيدر الجديد (بدون Props)
import { AuthHeader } from "../components/layout/AuthHeader";
import { Sidebar } from "../components/layout/Sidebar";

import { SummarySection } from "../components/sections/SummarySection";
import { SkillsSection } from "../components/sections/SkillsSection";
import { EducationSection } from "../components/sections/EducationSection";
import { ExperienceSection } from "../components/sections/ExperienceSection";
import { CertificatesSection } from "../components/sections/CertificatesSection";
import { ProjectsSection } from "../components/sections/ProjectsSection";

import { CertificateModal } from "../components/certificates/CertificateModal";

export default function HomePage() {
  const { cv, loading, error } = useCvData();
  const activeSection = useScrollSpy("summary");
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // دالة نسخ الإيميل
  async function copyEmail(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      window.prompt("Copy email:", email);
    }
  }

  // دالة التمرير السلس
  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
        const headerOffset = 80;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
    history.replaceState(null, "", `#${id}`);
  }

  // قائمة الأقسام للتنقل السريع
  const sections = [
    { id: "summary", label: "Summary" },
    { id: "skills", label: "Skills" },
    { id: "education", label: "Education" },
    { id: "experience", label: "Experience" },
    { id: "certificates", label: "Certificates" },
    { id: "projects", label: "Projects" },
  ];

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
        </div>
      </div>
    );
  }

  if (!cv) {
    return <div className="page-center">No data</div>;
  }

  return (
    <div className="app">
      {/* ✅ 1. الهيدر الرئيسي (بدون أي props) */}
      <AuthHeader />

      {/* ✅ 2. شريط التنقل الفرعي (الجديد) */}
      <div className="cv-subnav glass">
        <div className="cv-subnav-content">
            {sections.map((sec) => (
                <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`subnav-link ${activeSection === sec.id ? "active" : ""}`}
                >
                    {sec.label}
                </button>
            ))}
        </div>
      </div>

      <main className="layout">
        {/* ✅ تصحيح Sidebar: نمرر الدالة مباشرة وهو يتصرف */}
        <Sidebar cv={cv} copied={copied} onCopyEmail={copyEmail} />

        <section className="content">
            <div id="summary"><SummarySection text={cv.summary} /></div>
            <div id="skills"><SkillsSection cv={cv} /></div>
            <div id="education"><EducationSection cv={cv} /></div>
            <div id="experience"><ExperienceSection cv={cv} /></div>
            <div id="certificates">
                <CertificatesSection
                    certificates={cv.certificates}
                    onSelect={setSelectedCert}
                />
            </div>
            <div id="projects"><ProjectsSection cv={cv} /></div>

          <footer className="footer muted small">
            Built with ASP.NET Core Web API + React Vite • Data source: cv.json
          </footer>
        </section>
      </main>

      <CertificateModal
        certificate={selectedCert}
        onClose={() => setSelectedCert(null)}
      />
    </div>
  );
}