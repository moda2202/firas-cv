// src/pages/HomePage.tsx
import "../index.css"; // تأكد أن هذا الملف موجود في src
import { useState } from "react";
import type { Certificate } from "../types/cv";

import { useCvData } from "../hooks/useCvData";
import { useScrollSpy } from "../hooks/useScrollSpy";

import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";

import { SummarySection } from "../components/sections/SummarySection";
import { SkillsSection } from "../components/sections/SkillsSection";
import { EducationSection } from "../components/sections/EducationSection";
import { ExperienceSection } from "../components/sections/ExperienceSection";
import { CertificatesSection } from "../components/sections/CertificatesSection";
import { ProjectsSection } from "../components/sections/ProjectsSection";

import { CertificateModal } from "../components/certificates/CertificateModal";
// استيراد الهوك الخاص بالتنقل
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const { cv, loading, error } = useCvData();
  const activeSection = useScrollSpy("summary");
  const navigate = useNavigate(); // هوك للتنقل بين الصفحات

  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [copied, setCopied] = useState(false);

  async function copyEmail(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      window.prompt("Copy email:", email);
    }
  }

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  }

  function onCommunityClick() {
    // بدل الـ alert، الآن سننتقل للصفحة فعلياً
    navigate("/community");
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
        </div>
      </div>
    );
  }

  if (!cv) {
    return <div className="page-center">No data</div>;
  }

  return (
    <div className="app">
      <Header
        activeSection={activeSection}
        onNavigate={scrollToSection}
        onCommunityClick={onCommunityClick}
      />

      <main className="layout">
        <Sidebar cv={cv} copied={copied} onCopyEmail={copyEmail} />

        <section className="content">
          <SummarySection text={cv.summary} />
          <SkillsSection cv={cv} />
          <EducationSection cv={cv} />
          <ExperienceSection cv={cv} />
          <CertificatesSection
            certificates={cv.certificates}
            onSelect={setSelectedCert}
          />
          <ProjectsSection cv={cv} />

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